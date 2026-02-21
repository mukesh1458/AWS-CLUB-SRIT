import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://127.0.0.1:3001/api/auth';
    private tokenKey = 'aws_club_token';
    private currentUserSubject = new BehaviorSubject<{ id: string, email: string, full_name: string, role: string, is_approved?: boolean } | null>(null);

    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        this.checkSession();
    }

    get token(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    get currentUser() {
        return this.currentUserSubject.value;
    }

    isLoggedIn(): boolean {
        return !!this.token;
    }

    hasRole(allowedRoles: string[]): boolean {
        const user = this.currentUser;
        return user ? allowedRoles.includes(user.role) : false;
    }

    private checkSession() {
        const token = this.token;
        if (token) {
            try {
                // Decode JWT payload (without requiring a library) to get the role info stored inside during login
                const payload = JSON.parse(atob(token.split('.')[1]));

                // Note: Supabase JWT standard payload places the role inside 'user_role' or app_metadata if customized.
                // We returned the exact user object from our login API, so we should actually just store that user object.
                const storedUser = localStorage.getItem('aws_club_user');
                if (storedUser) {
                    this.currentUserSubject.next(JSON.parse(storedUser));
                }
            } catch (e) {
                this.logout();
            }
        }
    }

    register(data: any) {
        return this.http.post(`${this.apiUrl}/register`, data).pipe(
            tap((res: any) => this.handleAuthResponse(res))
        );
    }

    login(credentials: { email: string, password: string }) {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => this.handleAuthResponse(res))
        );
    }

    private handleAuthResponse(res: any) {
        if (res.token && res.user) {
            localStorage.setItem(this.tokenKey, res.token);
            localStorage.setItem('aws_club_user', JSON.stringify(res.user));
            this.currentUserSubject.next(res.user);
        } else if (res.session?.access_token && res.user) {
            // Handle Register response
            localStorage.setItem(this.tokenKey, res.session.access_token);
            localStorage.setItem('aws_club_user', JSON.stringify(res.user));
            this.currentUserSubject.next(res.user);
        }
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('aws_club_user');
        this.currentUserSubject.next(null);
    }
}
