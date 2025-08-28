import { create } from 'zustand';
import { Player } from '@/lib/types';
import { compareGuess, JudgementResult } from '@/lib/utils';
import { differenceInDays } from 'date-fns';

const MAX_GUESSES = 8;
const EPOCH_DATE = new Date('2025-08-28'); // 게임 시작 기준일

interface GameState {
  players: Player[];
  dailySequence: number[];
  secretPlayer: Player | null;
  guesses: Player[];
  results: JudgementResult[];
  gameStatus: 'playing' | 'won' | 'lost';
  isDataLoading: boolean;
  error: string | null;
  actions: {
    fetchDataAndStartGame: () => Promise<void>;
    addGuess: (player: Player) => void;
    restartGame: () => void; // 다시 시작 액션 추가
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  players: [],
  dailySequence: [],
  secretPlayer: null,
  guesses: [],
  results: [],
  gameStatus: 'playing',
  isDataLoading: false,
  error: null,
  actions: {
    fetchDataAndStartGame: async () => {
      if (get().players.length > 0) return;

      set({ isDataLoading: true, error: null });
      try {
        const [playerResponse, sequenceResponse] = await Promise.all([
          fetch('/players_2025.json'),
          fetch('/daily_sequence.json')
        ]);

        if (!playerResponse.ok) throw new Error('선수 명단 로딩 실패');
        if (!sequenceResponse.ok) throw new Error('데일리 시퀀스 로딩 실패');

        const players = await playerResponse.json();
        const dailySequence = await sequenceResponse.json();

        const today = new Date();
        const dayIndex = differenceInDays(today, EPOCH_DATE) % dailySequence.length;
        const secretPlayerId = dailySequence[dayIndex];
        const secretPlayer = players.find((p: Player) => p.id === secretPlayerId);

        if (secretPlayer) {
          set({
            players,
            dailySequence,
            secretPlayer,
            guesses: [],
            results: [],
            gameStatus: 'playing',
            isDataLoading: false,
          });
          console.log("오늘의 비밀 선수:", secretPlayer.name);
        } else {
          throw new Error("오늘의 선수를 찾을 수 없습니다.");
        }

      } catch (error) {
        set({ error: (error as Error).message, isDataLoading: false });
      }
    },
    addGuess: (guess) => {
      const { secretPlayer, guesses, results } = get();
      if (!secretPlayer || get().gameStatus !== 'playing') return;

      const result = compareGuess(secretPlayer, guess);
      const newGuesses = [...guesses, guess];
      const newResults = [...results, result];

      let newGameStatus: GameState['gameStatus'] = 'playing';
      if (result.isCorrect) {
        newGameStatus = 'won';
      } else if (newGuesses.length >= MAX_GUESSES) {
        newGameStatus = 'lost';
      }

      set({ guesses: newGuesses, results: newResults, gameStatus: newGameStatus });
    },
    restartGame: () => {
      // 정답 선수는 바꾸지 않고, 추측 기록만 리셋
      set({
        guesses: [],
        results: [],
        gameStatus: 'playing',
      });
    },
  },
}));