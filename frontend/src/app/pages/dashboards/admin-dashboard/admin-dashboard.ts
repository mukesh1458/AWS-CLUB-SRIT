import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin/admin.service';
import { AuthService } from '../../../services/auth/auth.service';
import { RevealDirective } from '../../../directives/reveal.directive';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  pendingUsers: any[] = [];
  adminUser: any;
  isApproving: { [key: string]: boolean } = {};
  isRejecting: { [key: string]: boolean } = {};

  // Live stats
  totalStudents: number | null = null;
  totalEvents: number | null = null;
  totalResources: number | null = null;

  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  constructor() {
    this.adminUser = this.authService.currentUser;
  }

  ngOnInit() {
    this.loadPendingUsers();
    this.loadStats();
  }

  loadPendingUsers() {
    this.adminService.getPendingUsers().subscribe({
      next: (res) => { this.pendingUsers = res.users || []; },
      error: (err) => { console.error('Failed to fetch pending users', err); }
    });
  }

  loadStats() {
    this.adminService.getStats().subscribe({
      next: (res) => {
        this.totalStudents = res.totalStudents;
        this.totalEvents = res.totalEvents;
        this.totalResources = res.totalResources;
      },
      error: (err) => { console.error('Failed to fetch stats', err); }
    });
  }

  approveUser(userId: string) {
    this.isApproving[userId] = true;
    this.adminService.approveUser(userId).subscribe({
      next: () => {
        this.pendingUsers = this.pendingUsers.filter(u => u.id !== userId);
        this.isApproving[userId] = false;
        // Update pending count and approved students in stats
        if (this.totalStudents !== null) this.totalStudents++;
      },
      error: (err) => {
        console.error('Approval failed', err);
        this.isApproving[userId] = false;
      }
    });
  }

  rejectUser(userId: string) {
    if (!confirm('Are you sure you want to reject and permanently remove this student?')) return;
    this.isRejecting[userId] = true;
    this.adminService.rejectUser(userId).subscribe({
      next: () => {
        this.pendingUsers = this.pendingUsers.filter(u => u.id !== userId);
        this.isRejecting[userId] = false;
      },
      error: (err) => {
        console.error('Rejection failed', err);
        this.isRejecting[userId] = false;
      }
    });
  }
}
