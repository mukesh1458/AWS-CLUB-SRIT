import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../directives/reveal.directive';
import { TiltDirective } from '../../directives/tilt.directive';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { StudentService } from '../../services/student/student.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RevealDirective, TiltDirective],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {
  activeTab: 'upcoming' | 'past' = 'upcoming';
  events: any[] = [];
  isLoading = true;

  isLoggedIn = false;
  isApproved = false;
  isRegistering: { [key: string]: boolean } = {};
  alertMsg = '';
  alertType: 'success' | 'error' = 'success';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private studentService: StudentService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadEvents();
    this.checkAuthStatus();
  }

  loadEvents() {
    this.isLoading = true;
    // If logged in and approved, we can use the student endpoint which tells us if we are already registered
    if (this.authService.isLoggedIn()) {
      this.http.get<any>('http://127.0.0.1:3001/api/student/events').subscribe({
        next: (res) => {
          this.events = res.events || [];
          this.isLoading = false;
        },
        error: (err) => {
          // Fallback to public if 403 unapproved
          this.loadPublicEvents();
        }
      });
    } else {
      this.loadPublicEvents();
    }
  }

  loadPublicEvents() {
    this.isLoading = true;
    this.http.get<any>('http://127.0.0.1:3001/api/public/events').subscribe({
      next: (res) => {
        this.events = res.events || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load public events', err);
        this.isLoading = false;
      }
    });
  }

  checkAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.authService.currentUser;
      const u = user as any;
      this.isApproved = u?.is_approved === true || u?.role === 'super_admin' || u?.role === 'team_member';
    }
  }

  switchTab(tab: 'upcoming' | 'past') {
    this.activeTab = tab;
  }

  get upcomingEvents() {
    const now = new Date();
    return this.events.filter(e => new Date(e.date) >= now);
  }

  get pastEvents() {
    const now = new Date();
    return this.events.filter(e => new Date(e.date) < now);
  }

  showAlert(type: 'success' | 'error', msg: string) {
    this.alertType = type;
    this.alertMsg = msg;
    setTimeout(() => this.alertMsg = '', 4000);
  }

  registerForEvent(eventId: string) {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.isApproved) {
      this.showAlert('error', 'You must be approved by an Admin to register.');
      return;
    }

    this.isRegistering[eventId] = true;
    this.studentService.registerForEvent(eventId).subscribe({
      next: () => {
        this.showAlert('success', 'Successfully registered!');
        // Update local state to show as registered
        const evt = this.events.find(e => e.id === eventId);
        if (evt) evt.isRegistered = true;
        this.isRegistering[eventId] = false;
      },
      error: (err) => {
        this.showAlert('error', err.error?.error || 'Registration failed.');
        this.isRegistering[eventId] = false;
      }
    });
  }
}
