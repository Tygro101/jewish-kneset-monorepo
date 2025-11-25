import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-clock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clock.component.html',
  styleUrl: './clock.component.scss'
})
export class ClockComponent {
  currentDate!: Date;
  constructor() {
    setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }
}
