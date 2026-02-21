import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

import { TiltDirective } from '../../directives/tilt.directive';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [RevealDirective, TiltDirective],
  templateUrl: './team.html',
  styleUrl: './team.css'
})
export class Team { }
