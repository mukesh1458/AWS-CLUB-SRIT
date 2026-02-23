import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeamService {
    private apiUrl = `${environment.apiUrl}/team`;

    constructor(private http: HttpClient) { }

    createEvent(eventData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/events`, eventData);
    }

    deleteEvent(eventId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/events/${eventId}`);
    }

    getEventRegistrations(eventId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/events/${eventId}/registrations`);
    }

    uploadResource(resourceData: { title: string, description: string, file_url: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/resources`, resourceData);
    }

    deleteResource(resourceId: string): Observable<any> {
        // We use admin URL here as per the route mapping in backend
        return this.http.delete(`${environment.apiUrl}/admin/resources/${resourceId}`);
    }
}
