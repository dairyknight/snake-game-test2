import { GameManager } from '@/game/GameManager';
import { GameLoop } from '@/game/GameLoop';
import { Renderer } from '@/renderer/Renderer';
import { GameState } from '@/state/GameState';
import { KeyboardInput } from '@/input/KeyboardInput';
import { TouchInput } from '@/input/TouchInput';
import { StartScreen } from '@/ui/StartScreen';
import { GameOverScreen } from '@/ui/GameOverScreen';
import { PauseOverlay } from '@/ui/PauseOverlay';
import { AriaAnnouncer } from '@/ui/AriaAnnouncer';

const gameManager = new GameManager();

const canvas = document.getElementById('game-canvas');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element not found');
}

const renderer = new Renderer(canvas, gameManager, { showCanvasOverlay: false });

const gameLoop = new GameLoop(gameManager, renderer.draw.bind(renderer));

gameLoop.start();

// Restart game loop when re-entering PLAYING state (loop stops on GAME_OVER)
gameManager.events.on('stateChange', ({ to }) => {
  if (to === GameState.PLAYING) gameLoop.start();
});

// Input handlers — instantiated after loop; window/mql listeners keep instances alive
new KeyboardInput(gameManager);
new TouchInput(gameManager);

// UI screens — EventEmitter subscriptions keep instances alive
new StartScreen(gameManager);
new GameOverScreen(gameManager);
new PauseOverlay(gameManager);
new AriaAnnouncer(gameManager);
