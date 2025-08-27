import { create } from 'zustand';
import { Player } from '@/lib/types';
import { compareGuess, JudgementResult, pickRandom } from '@/lib/utils';

const MAX_GUESSES = 8;

interface GameState {
  players: Player[];
  secretPlayer: Player | null;
  guesses: Player[];
  results: JudgementResult[];
  gameStatus: 'playing' | 'won' | 'lost';
  isDataLoading: boolean;
  error: string | null;
  actions: {
    fetchPlayers: () => Promise<void>;
    startGame: () => void;
    addGuess: (player: Player) => void;
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  players: [],
  secretPlayer: null,
  guesses: [],
  results: [],
  gameStatus: 'playing',
  isDataLoading: false,
  error: null,
  actions: {
    fetchPlayers: async () => {
      if (get().players.length > 0) {
        get().actions.startGame();
        return;
      }
      set({ isDataLoading: true, error: null });
      try {
        const response = await fetch('/players_2025.json');
        if (!response.ok) throw new Error('선수 명단을 불러오는데 실패했습니다.');
        const players = await response.json();
        set({ players, isDataLoading: false });
        get().actions.startGame();
      } catch (error) {
        set({ error: (error as Error).message, isDataLoading: false });
      }
    },
    startGame: () => {
      const { players } = get();
      const secretPlayer = pickRandom(players);
      if (secretPlayer) {
        set({
          secretPlayer,
          guesses: [],
          results: [],
          gameStatus: 'playing',
        });
        console.log("비밀 선수 ID:", secretPlayer.id, "이름:", secretPlayer.name);
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
  },
}));