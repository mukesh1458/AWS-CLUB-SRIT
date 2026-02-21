import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../directives/reveal.directive';

import { TiltDirective } from '../../directives/tilt.directive';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RevealDirective, TiltDirective],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events {
  activeTab: 'upcoming' | 'past' = 'upcoming';

  switchTab(tab: 'upcoming' | 'past') {
    this.activeTab = tab;
  }
}
