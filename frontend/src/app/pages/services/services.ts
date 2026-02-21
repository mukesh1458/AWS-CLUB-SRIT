import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

import { TiltDirective } from '../../directives/tilt.directive';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RevealDirective, TiltDirective],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services { }
