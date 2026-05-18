import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InputService {

  private throwPressed = false;
  throwBottle = signal(false);
  moveLeft = signal(false);
  moveRight = signal(false);
  jump = signal(false);

  constructor() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.code === 'KeyA') this.moveLeft.set(true);
    if (e.key === 'ArrowRight' || e.code === 'KeyD') this.moveRight.set(true);
    if (e.key === 'ArrowUp' || e.code === 'KeyW') this.jump.set(true);
    if (e.key === ' ' && !this.throwPressed) {
      this.throwPressed = true;
      this.throwBottle.set(true);
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.code === 'KeyA') this.moveLeft.set(false);
    if (e.key === 'ArrowRight' || e.code === 'KeyD') this.moveRight.set(false);
    if (e.key === 'ArrowUp' || e.code === 'KeyW') this.jump.set(false);
    if (e.key === ' ') {
      this.throwPressed = false;
      this.throwBottle.set(false);
    }
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