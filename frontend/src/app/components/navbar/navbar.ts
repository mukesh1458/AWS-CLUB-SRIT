import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  isScrolled = false;
  isMenuOpen = false;

  constructor(public authService: AuthService, private router: Router) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  getDashboardLink(): string {
    const userRole = this.authService.currentUser?.role;
    if (userRole === 'super_admin') return '/admin';
    if (userRole === 'team_member') return '/team-dashboard';
    return '/dashboard';
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/home']);
  }
}
