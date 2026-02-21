import { Component, ElementRef, OnInit, Renderer2, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, AfterViewInit {
  @ViewChild('particles', { static: true }) particlesContainer!: ElementRef;

  // Counters state
  activeMembers = 0;
  eventsHosted = 0;
  certifications = 0;

  // Real backend total count
  totalEvents = 0;
  private countersStarted = false;

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    public authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.createParticles();
  }

  ngAfterViewInit() {
    this.checkScrollCounters();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScrollCounters();
  }

  createParticles() {
    const container = this.particlesContainer.nativeElement;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 14 : 28;

    for (let i = 0; i < count; i++) {
      const p = this.renderer.createElement('div');
      this.renderer.addClass(p, 'particle');

      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const tx = (Math.random() - 0.5) * 200;
      const ty = -(Math.random() * 300 + 100);
      const dur = Math.random() * 8 + 6;
      const del = Math.random() * 8;
      const size = Math.random() * 3 + 1;

      this.renderer.setStyle(p, 'left', `${x}%`);
      this.renderer.setStyle(p, 'top', `${y}%`);
      this.renderer.setStyle(p, '--tx', `${tx}px`);
      this.renderer.setStyle(p, '--ty', `${ty}px`);
      this.renderer.setStyle(p, 'animation-duration', `${dur}s`);
      this.renderer.setStyle(p, 'animation-delay', `${del}s`);
      this.renderer.setStyle(p, 'width', `${size}px`);
      this.renderer.setStyle(p, 'height', `${size}px`);
      this.renderer.setStyle(p, 'opacity', '0');

      this.renderer.appendChild(container, p);
    }
  }

  checkScrollCounters() {
    if (this.countersStarted) return;

    const statsEl = this.elRef.nativeElement.querySelector('.hero-stats');
    if (!statsEl) return;

    const rect = statsEl.getBoundingClientRect();
    const isVisible = (rect.top <= window.innerHeight) && ((rect.bottom) >= 0);

    if (isVisible) {
      this.countersStarted = true;
      // Animate the active members stat
      this.animateCounter('activeMembers', 50);
      this.animateCounter('certifications', 0);
    }
  }

  animateCounter(prop: 'activeMembers' | 'eventsHosted' | 'certifications', target: number, duration = 1800) {
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(ease * target);

      this[prop] = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this[prop] = target;
      }
    };

    requestAnimationFrame(step);
  }

  getDashboardLink(): string {
    const userRole = this.authService.currentUser?.role;
    if (userRole === 'super_admin') return '/admin';
    if (userRole === 'team_member') return '/team-dashboard';
    return '/dashboard'; // Should not be reached based on UI logic
  }
}
