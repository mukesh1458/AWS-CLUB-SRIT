import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { routeTransition } from './app.animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [routeTransition]
})
export class App {
  title = 'aws-club-srit-angular';

  // Custom Cursor state
  cursorX = 0;
  cursorY = 0;
  isClicking = false;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.cursorX = e.clientX;
    this.cursorY = e.clientY;
  }

  @HostListener('document:mousedown')
  onMouseDown() {
    this.isClicking = true;
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isClicking = false;
  }

  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
