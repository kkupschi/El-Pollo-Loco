import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../core/services/audio';
import { GameCanvasComponent } from '../game-canvas/game-canvas';
import { GameService } from '../../core/services/game';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, GameCanvasComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPageComponent implements OnInit {

  controlsOpen = signal(false);

  constructor(
    public audioService: AudioService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.gameService.gameState.set('menu');
    this.audioService.stopAllSounds();
    this.audioService.loadSound('menu_music', 'assets/sounds/music/menu_music.mp3', 0.1);
  }

  startGame() {
    this.audioService.stopSound('menu_music');
    this.gameService.startGame();
  }

  onFirstInteraction() {
    if (!this.audioService.isPlaying('menu_music')) {
      this.audioService.playSound('menu_music', true);
    }
  }

  openControls() {
    this.controlsOpen.set(true);
  }

  closeControls() {
    this.controlsOpen.set(false);
  }
}