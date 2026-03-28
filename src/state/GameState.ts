export enum GameState {
  IDLE      = 'IDLE',
  PLAYING   = 'PLAYING',
  PAUSED    = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export interface GameEvents {
  stateChange: { from: GameState; to: GameState };
  gameOver:    { score: number };
  scoreUpdate: { score: number; highScore: number };
  foodEaten:   undefined;
}
