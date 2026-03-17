import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../core/services/audio';
import { GameCanvasComponent } from '../game-canvas/game-canvas';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, GameCanvasComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPageComponent {

  menuVisible = signal(true);
  controlsOpen = signal(false);

  constructor(public audioService: AudioService) {
    this.audioService.loadSound('menu_music', 'assets/sounds/music/menu_music.mp3', 0.1);
    this.audioService.playSound('menu_music', true);
  }

  startGame() {
    this.menuVisible.set(false);
  }

  openControls() {
    this.controlsOpen.set(true);
  }

  closeControls() {
    this.controlsOpen.set(false);
  }
}