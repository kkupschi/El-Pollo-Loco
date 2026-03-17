import { Component } from '@angular/core';
import { InputService } from '../../core/services/input';

@Component({
  selector: 'app-mobile-controls',
  standalone: true,
  templateUrl: './mobile-controls.html',
  styleUrl: './mobile-controls.css'
})
export class MobileControlsComponent {

  constructor(private inputService: InputService) { }

  onLeftStart() { this.inputService.setMoveLeft(true); }
  onLeftEnd() { this.inputService.setMoveLeft(false); }

  onRightStart() { this.inputService.setMoveRight(true); }
  onRightEnd() { this.inputService.setMoveRight(false); }

  onJumpStart() { this.inputService.setJump(true); }
  onJumpEnd() { this.inputService.setJump(false); }

  onThrow() { this.inputService.setThrowBottle(true); }
}