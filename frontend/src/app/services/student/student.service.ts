import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StudentService {
    private apiUrl = 'http://127.0.0.1:3001/api/student';

    constructor(private http: HttpClient) { }

    getEvents(): Observable<any> {
        return this.http.get(`${this.apiUrl}/events`);
    }

    registerForEvent(eventId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/events/${eventId}/register`, {});
    }

    getResources(): Observable<any> {
        return this.http.get(`${this.apiUrl}/resources`);
    }
}
