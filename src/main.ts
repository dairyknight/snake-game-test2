import { GameManager } from '@/game/GameManager';
import { GameLoop } from '@/game/GameLoop';

const gameManager = new GameManager();

// Stub draw callback — replaced by Renderer.draw in Phase 6
const gameLoop = new GameLoop(gameManager, (_interpolation) => {
  // Phase 6: renderer.draw(interpolation)
});

// Start the loop — keyboard/touch input will drive state transitions
gameLoop.start();
