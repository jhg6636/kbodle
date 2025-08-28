import React, { useState } from 'react';
import copy from 'copy-to-clipboard';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const GameOverDialog = () => {
  const { gameStatus, secretPlayer, guesses, results, actions } = useGameStore();
  const [isCopied, setIsCopied] = useState(false);

  const isOpen = gameStatus === 'won' || gameStatus === 'lost';

  const handleShare = () => {
    const title = `KBODLE ${gameStatus === 'won' ? guesses.length : 'X'}/8`;
    const grid = results.map(result => {
      const row = [
        result.team === 'correct' ? '🟩' : '🟥',
        result.position === 'correct' ? '🟩' : result.position === 'partial' ? '🟨' : '🟥',
        result.age === 'correct' ? '🟩' : result.age === 'up' ? '🔼' : '🔽',
        result.jerseyNumber === 'correct' ? '🟩' : result.jerseyNumber === 'up' ? '🔼' : '🔽',
      ].join('');
      return row;
    }).join('\n');

    const shareText = `${title}\n\n${grid}`;
    copy(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClose = () => {
    // The dialog should not be closable by clicking outside or pressing Esc
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{gameStatus === 'won' ? '승리!' : '패배'}</DialogTitle>
          <DialogDescription>
            {gameStatus === 'won' 
              ? "축하합니다! 정답을 맞히셨습니다."
              : `정답은 <strong>{secretPlayer?.name}</strong> 선수였습니다.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 mt-4">
          <Button onClick={actions.startGame} className="w-full">다시 시작</Button>
          <Button onClick={handleShare} variant="secondary" className="w-full">
            {isCopied ? '복사 완료!' : '결과 공유하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameOverDialog;
