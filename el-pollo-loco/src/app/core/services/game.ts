import { Injectable, signal } from '@angular/core';

export type GameState = 'menu' | 'running' | 'paused' | 'won' | 'lost';

@Injectable({
  providedIn: 'root',
})
export class GameService {

  gameState = signal<GameState>('menu');

  score = signal(0);
  coins = signal(0);
  bottles = signal(0);
  characterHealth = signal(100);
  endbossHealth = signal(100);
  endbossVisible = signal(false);

  startGame() {
    this.gameState.set('running');
  }

  pauseGame() {
    this.gameState.set('paused');
  }

  winGame() {
    this.gameState.set('won');
  }

  loseGame() {
    this.gameState.set('lost');
  }

  restartGame() {
    this.score.set(0);
    this.coins.set(0);
    this.bottles.set(0);
    this.characterHealth.set(100);
    this.endbossHealth.set(100);
    this.gameState.set('running');
  }
}