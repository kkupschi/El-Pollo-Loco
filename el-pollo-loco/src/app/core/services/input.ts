import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InputService {

  moveLeft = signal(false);
  moveRight = signal(false);
  jump = signal(false);
  throwBottle = signal(false);

  constructor() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') this.moveLeft.set(true);
    if (e.key === 'ArrowRight') this.moveRight.set(true);
    if (e.key === 'ArrowUp') this.jump.set(true);
    if (e.key === 'd') this.throwBottle.set(true);
  }

  private onKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') this.moveLeft.set(false);
    if (e.key === 'ArrowRight') this.moveRight.set(false);
    if (e.key === 'ArrowUp') this.jump.set(false);
    if (e.key === 'd') this.throwBottle.set(false);
  }

  setMoveLeft(value: boolean) {
    this.moveLeft.set(value);
  }

  setMoveRight(value: boolean) {
    this.moveRight.set(value);
  }

  setJump(value: boolean) {
    this.jump.set(value);
  }

  setThrowBottle(value: boolean) {
    this.throwBottle.set(value);
  }
}