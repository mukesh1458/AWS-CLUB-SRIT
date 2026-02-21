import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

import { TiltDirective } from '../../directives/tilt.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RevealDirective, TiltDirective],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About { }
