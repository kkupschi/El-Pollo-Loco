import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../core/services/audio';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPageComponent {

  menuVisible = signal(true);
  controlsOpen = signal(false);

  constructor(public audioService: AudioService) { }

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