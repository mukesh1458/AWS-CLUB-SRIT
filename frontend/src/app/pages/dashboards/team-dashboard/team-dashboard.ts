import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin/admin.service';
import { AuthService } from '../../../services/auth/auth.service';
import { TeamService } from '../../../services/team/team.service';
import { RevealDirective } from '../../../directives/reveal.directive';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RevealDirective],
  templateUrl: './team-dashboard.html',
  styleUrls: ['./team-dashboard.css']
})
export class TeamDashboard implements OnInit {
  pendingUsers: any[] = [];
  teamUser: any;

  events: any[] = [];
  isDeletingEvent: { [key: string]: boolean } = {};

  resources: any[] = [];
  isDeletingResource: { [key: string]: boolean } = {};

  // Modals view state ('main', 'event', 'resource')
  activeView: 'main' | 'event' | 'resource' = 'main';

  // Avatar upload state
  avatarUrl = '';
  isUploadingAvatar = false;

  // Forms
  eventForm: FormGroup;
  isSubmittingEvent = false;

  resourceForm: FormGroup;
  resourceFile: File | null = null;
  isSubmittingResource = false;

  // Messages
  alertMsg = '';
  alertType: 'success' | 'error' = 'success';
  isApproving: { [key: string]: boolean } = {};
  isRejecting: { [key: string]: boolean } = {};

  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private teamService = inject(TeamService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  constructor() {
    this.teamUser = this.authService.currentUser;
    this.avatarUrl = this.teamUser?.avatar_url || '';

    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
    });

    this.resourceForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadPendingUsers();
    this.loadEvents();
    this.loadResources();
  }

  loadPendingUsers() {
    this.adminService.getPendingUsers().subscribe({
      next: (res) => { this.pendingUsers = res.users || []; },
      error: (err) => { console.error('Failed to fetch pending users', err); }
    });
  }

  approveUser(userId: string) {
    this.isApproving[userId] = true;
    this.adminService.approveUser(userId).subscribe({
      next: () => {
        this.pendingUsers = this.pendingUsers.filter(u => u.id !== userId);
        this.showAlert('success', 'Student approved successfully!');
        this.isApproving[userId] = false;
      },
      error: (err) => {
        console.error('Approval failed', err);
        this.showAlert('error', 'Failed to approve student.');
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
        this.showAlert('success', 'Student rejected and removed.');
        this.isRejecting[userId] = false;
      },
      error: (err) => {
        console.error('Rejection failed', err);
        this.showAlert('error', 'Failed to reject student.');
        this.isRejecting[userId] = false;
      }
    });
  }

  // ── Modals & Views ──
  setView(view: 'main' | 'event' | 'resource') {
    this.activeView = view;
    this.alertMsg = '';
    if (view === 'event') {
      this.eventForm.reset();
      this.loadEvents(); // refresh events list
    }
    if (view === 'resource') {
      this.resourceForm.reset();
      this.resourceFile = null;
      this.loadResources(); // refresh resources list
    }
  }

  showAlert(type: 'success' | 'error', message: string) {
    this.alertType = type;
    this.alertMsg = message;
    setTimeout(() => this.alertMsg = '', 4000);
  }

  // ── Event Studio ──
  loadEvents() {
    // Reusing the student endpoint since it fetches all events
    // But we need to use HttpClient directly if TeamService doesn't have a getEvents yet
    this.http.get<any>('http://127.0.0.1:3001/api/student/events').subscribe({
      next: (res) => { this.events = res.events || []; },
      error: (err) => { console.error('Failed to fetch events', err); }
    });
  }

  deleteEvent(eventId: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    this.isDeletingEvent[eventId] = true;
    this.teamService.deleteEvent(eventId).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== eventId);
        this.showAlert('success', 'Event deleted successfully.');
        this.isDeletingEvent[eventId] = false;
      },
      error: (err) => {
        this.showAlert('error', 'Failed to delete event.');
        this.isDeletingEvent[eventId] = false;
      }
    });
  }

  onSubmitEvent() {
    if (this.eventForm.invalid) return;
    this.isSubmittingEvent = true;

    this.teamService.createEvent(this.eventForm.value).subscribe({
      next: (res) => {
        this.showAlert('success', 'Event published perfectly!');
        this.isSubmittingEvent = false;
        this.loadEvents(); // Reload the list
        this.eventForm.reset();
      },
      error: (err) => {
        this.showAlert('error', err.error?.error || 'Failed to create event.');
        this.isSubmittingEvent = false;
      }
    });
  }

  // ── Resource Vault (Cloudinary Flow) ──
  onResourceFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.resourceFile = input.files[0];
    }
  }

  onSubmitResource() {
    if (this.resourceForm.invalid || !this.resourceFile) {
      this.showAlert('error', 'Please fill the form and select a PDF/Image file.');
      return;
    }

    this.isSubmittingResource = true;
    this.alertMsg = '';

    // Step 1: Get Cloudinary Signature
    this.adminService.getCloudinarySignature().subscribe({
      next: (sigData: any) => {
        const formData = new FormData();
        formData.append('file', this.resourceFile!);
        formData.append('api_key', sigData.api_key);
        formData.append('timestamp', sigData.timestamp);
        formData.append('signature', sigData.signature);
        formData.append('folder', sigData.folder);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/auto/upload`;

        // Step 2: Upload direct to Cloudinary
        this.http.post<any>(uploadUrl, formData).subscribe({
          next: (cloudRes) => {
            const secureUrl = cloudRes.secure_url;

            // Step 3: Save Resource to our DB
            const resourcePayload = {
              ...this.resourceForm.value,
              file_url: secureUrl
            };

            this.teamService.uploadResource(resourcePayload).subscribe({
              next: () => {
                this.showAlert('success', 'Resource uploaded to the Vault!');
                this.isSubmittingResource = false;
                this.setView('main');
              },
              error: (err) => {
                this.showAlert('error', 'Database save failed.');
                this.isSubmittingResource = false;
              }
            });
          },
          error: (uploadErr) => {
            console.error('Cloudinary error', uploadErr);
            this.showAlert('error', 'Cloudinary upload failed.');
            this.isSubmittingResource = false;
          }
        });
      },
      error: (sigErr) => {
        this.showAlert('error', 'Failed to get upload signature.');
        this.isSubmittingResource = false;
      }
    });
  }

  // ── Avatar Upload Flow ──
  onAvatarFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    this.uploadAvatar(input.files[0]);
  }

  uploadAvatar(file: File) {
    this.isUploadingAvatar = true;
    this.adminService.getCloudinarySignature().subscribe({
      next: (sigData: any) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sigData.api_key);
        formData.append('timestamp', sigData.timestamp);
        formData.append('signature', sigData.signature);
        formData.append('folder', sigData.folder);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`;
        this.http.post<any>(uploadUrl, formData).subscribe({
          next: (cloudRes) => {
            const secureUrl = cloudRes.secure_url;
            this.adminService.updateAvatar(secureUrl).subscribe({
              next: () => {
                this.avatarUrl = secureUrl;
                this.isUploadingAvatar = false;
                this.showAlert('success', 'Profile picture updated!');
              },
              error: () => { this.showAlert('error', 'Failed saving avatar.'); this.isUploadingAvatar = false; }
            });
          },
          error: () => { this.showAlert('error', 'Cloud upload failed.'); this.isUploadingAvatar = false; }
        });
      },
      error: () => { this.showAlert('error', 'Signature request failed.'); this.isUploadingAvatar = false; }
    });
  }
  loadResources() {
    this.http.get<any>('http://127.0.0.1:3001/api/public/resources').subscribe({
      next: (res) => { this.resources = res.resources || []; },
      error: (err) => { console.error('Failed to fetch resources', err); }
    });
  }

  deleteResource(resourceId: string) {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    this.isDeletingResource[resourceId] = true;
    this.teamService.deleteResource(resourceId).subscribe({
      next: () => {
        this.resources = this.resources.filter(r => r.id !== resourceId);
        this.showAlert('success', 'Resource deleted successfully.');
        this.isDeletingResource[resourceId] = false;
      },
      error: (err) => {
        this.showAlert('error', 'Failed to delete resource.');
        this.isDeletingResource[resourceId] = false;
      }
    });
  }
}
