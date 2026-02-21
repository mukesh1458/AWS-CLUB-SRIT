import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resources.html',
  styleUrl: './resources.css',
})
export class Resources implements OnInit {
  resources: any[] = [];
  isLoggedIn = false;
  isApproved = false;
  isLoading = true;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.checkAuthStatus();
    this.loadResources();
  }

  checkAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.authService.currentUser;
      const u = user as any;
      this.isApproved = u?.is_approved === true || u?.role === 'super_admin' || u?.role === 'team_member';
    }
  }

  loadResources() {
    this.isLoading = true;
    // Anyone can see the list of resources
    this.http.get<any>('http://127.0.0.1:3001/api/public/resources').subscribe({
      next: (res) => {
        this.resources = res.resources || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load resources', err);
        this.isLoading = false;
      }
    });
  }

  // Helper method to extract original filename if possible from cloudinary URL
  getFilename(url: string, title: string): string {
    try {
      const parts = url.split('/');
      const last = parts[parts.length - 1];
      if (last.includes('.')) return last;
      return title + '.pdf';
    } catch {
      return title + '.pdf';
    }
  }
}
