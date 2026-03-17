import { Component } from '@angular/core';
import { GameService } from '../../core/services/game';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  templateUrl: './status-bar.html',
  styleUrl: './status-bar.css'
})
export class StatusBarComponent {

  constructor(public gameService: GameService) { }

  getHealthImage(): string {
    return this.getStatusImage(this.gameService.characterHealth());
  }

  getCoinImage(): string {
    const value = (this.gameService.coins() / 5) * 100;
    return this.getStatusImage(value);
  }

  getBottleImage(): string {
    const value = (this.gameService.bottles() / 5) * 100;
    return this.getStatusImage(value);
  }

  private getStatusImage(value: number): string {
    if (value >= 100) return '100';
    if (value >= 80) return '80';
    if (value >= 60) return '60';
    if (value >= 40) return '40';
    if (value >= 20) return '20';
    return '0';
  }
}