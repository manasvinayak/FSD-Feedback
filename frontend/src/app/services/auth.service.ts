import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {
    console.log('AuthService initialized');
  }

  login(email: string, password: string, role: string = 'user'): Observable<User> {
    // In a real app, this would be an API call
    // For demo purposes, we'll simulate a successful login
    if (!email || !password) {
      return throwError(() => new Error('Email and password are required'));
    }

    // Ensure role is either 'user' or 'admin'
    const userRole = role === 'admin' ? 'admin' : 'user';

    // Simulate API call delay
    return of({
      id: 'user_' + new Date().getTime(),
      name: email.split('@')[0],
      email,
      role: userRole
    } as User).pipe(delay(800));
  }

  register(name: string, email: string, password: string): Observable<User> {
    // In a real app, this would be an API call
    // For demo, we'll simulate a successful registration
    if (!name || !email || !password) {
      return throwError(() => new Error('All fields are required'));
    }

    // Simulate API call delay
    return of({
      id: 'user_' + new Date().getTime(),
      name,
      email,
      role: 'user'
    } as User).pipe(delay(800));
  }

  saveUserToLocalStorage(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('No user found in localStorage');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      console.log('Current user from AuthService:', user);
      return user;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }

  // Simple method to mock a user for testing
  mockUser(): void {
    const mockUser: User = {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    console.log('Mock user created:', mockUser);
  }

  logout(): void {
    localStorage.removeItem('user');
    console.log('User logged out');
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  redirectBasedOnRole(): void {
    const user = this.getCurrentUser();
    if (user) {
      if (user.role === 'admin') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/feedback']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }
} 