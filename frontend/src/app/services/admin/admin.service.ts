import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
    private apiUrl = `${environment.apiUrl}/admin`;

    constructor(private http: HttpClient) { }

    getPendingUsers(): Observable<any> {
        return this.http.get(`${this.apiUrl}/pending-users`);
    }

    approveUser(userId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/approve-user/${userId}`, {});
    }

    rejectUser(userId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/reject-user/${userId}`);
    }

    getStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/stats`);
    }

    /** Get a signed upload signature from the backend */
    getCloudinarySignature(): Observable<any> {
        return this.http.post(`${this.apiUrl}/cloudinary-signature`, {});
    }

    /** Save the Cloudinary avatar URL to the user's profile */
    updateAvatar(avatar_url: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/update-avatar`, { avatar_url });
    }
}
