import { Component, Output, EventEmitter } from '@angular/core';
import { GameService } from '../../core/services/game';

@Component({
  selector: 'app-end-screen',
  standalone: true,
  templateUrl: './end-screen.html',
  styleUrl: './end-screen.css'
})
export class EndScreenComponent {

  @Output() onRestart = new EventEmitter<void>();
  @Output() onHome = new EventEmitter<void>();

  constructor(public gameService: GameService) { }

  restart() {
    this.onRestart.emit();
  }

  goHome() {
    this.onHome.emit();
  }
}