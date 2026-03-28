import { GameManager } from '@/game/GameManager';
import { GameLoop } from '@/game/GameLoop';
import { Renderer } from '@/renderer/Renderer';

const gameManager = new GameManager();

const canvas = document.getElementById('game-canvas');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element not found');
}

const renderer = new Renderer(canvas, gameManager);

const gameLoop = new GameLoop(gameManager, renderer.draw.bind(renderer));

gameLoop.start();
