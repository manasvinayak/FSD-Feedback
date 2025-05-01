import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, retry, timeout, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Define interfaces for type safety
export interface Feedback {
  feedbackId?: number;
  name: string;
  email: string;
  contactNo: string;
  userId?: string;
  dateTime?: Date;
  overallEventQuality: number;
  venueFacilities: number;
  orgManagement: number;
  techContent: number;
  comments?: string;
}

export interface FeedbackForm {
  name: string;
  email: string;
  contactNo: string;
  userId?: string;
  overallEventQuality: number;
  venueFacilities: number;
  orgManagement: number;
  techContent: number;
  comments?: string;
}

export interface FeedbackStatistics {
  count: number;
  averageOverallRating: number;
  averageTechContentRating: number;
  averageVenueFacilitiesRating: number;
  averageOrgManagementRating: number;
  uniqueParticipantsCount: number;
  ratingDistribution: { [key: string]: number };
  completionRate: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  // Use environment configuration for API URL
  private apiUrl = environment.apiUrl + '/feedback';
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });
  private timeoutDuration = 30000; // 30 seconds timeout
  private isLoading = false;

  constructor(private http: HttpClient) {
    console.log('Feedback service initialized with API URL:', this.apiUrl);
  }

  // Getter for loading state
  get loading(): boolean {
    return this.isLoading;
  }

  // Generic error handler
  private handleError(operation: string, result?: any) {
    return (error: HttpErrorResponse): Observable<any> => {
      console.error(`${operation} failed:`, error);
      
      // Network error
      if (error.error instanceof ErrorEvent) {
        console.error(`Network error: ${error.error.message}`);
        return throwError(() => new Error(`Network error: Please check your internet connection`));
      }
      
      // Server error with status code
      if (error.status) {
        console.error(`Backend returned code ${error.status}, body was:`, error.error);
        
        // Handle specific status codes
        switch (error.status) {
          case 401:
            return throwError(() => new Error('Unauthorized: Please log in again'));
          case 403:
            return throwError(() => new Error('Forbidden: You do not have permission to perform this action'));
          case 404:
            return throwError(() => new Error('Resource not found: The requested feedback does not exist'));
          case 0:
            return throwError(() => new Error('Server unreachable: Please check if the backend server is running at ' + environment.apiUrl));
          case 504:
            return throwError(() => new Error('Server timeout: The request took too long to process'));
          case 500:
            return throwError(() => new Error('Server error: An internal error occurred in the backend'));
          case 400:
            return throwError(() => new Error('Bad request: Please check your data and try again'));
          default:
            return throwError(() => new Error(`Error ${error.status}: ${error.message || 'Unknown error occurred'}`));
        }
      }
      
      // For methods that should return data even on error
      if (result !== undefined) {
        return of(result);
      }
      
      return throwError(() => new Error('Something went wrong. Please try again later.'));
    };
  }

  getAllFeedback(): Observable<Feedback[]> {
    this.isLoading = true;
    console.log('Fetching all feedback from:', this.apiUrl);
    
    return this.http.get<Feedback[]>(this.apiUrl, { headers: this.headers }).pipe(
      timeout(this.timeoutDuration),
      retry(2),
      tap(response => console.log('Feedback data received:', response)),
      catchError(this.handleError('getAllFeedback', [])),
      finalize(() => this.isLoading = false)
    );
  }

  getFeedbackById(id: number): Observable<Feedback | null> {
    this.isLoading = true;
    console.log(`Fetching feedback with ID ${id} from: ${this.apiUrl}/${id}`);
    
    return this.http.get<Feedback>(`${this.apiUrl}/${id}`, { headers: this.headers }).pipe(
      timeout(this.timeoutDuration),
      retry(2),
      tap(response => console.log('Feedback details received:', response)),
      catchError(this.handleError(`getFeedbackById id=${id}`, null)),
      finalize(() => this.isLoading = false)
    );
  }

  getFeedbackByUserId(userId: string): Observable<Feedback[]> {
    this.isLoading = true;
    console.log(`Fetching feedback for user with ID ${userId}`);
    
    // Since the backend doesn't have a /user/{userId} endpoint, we'll get all feedback and filter
    return this.http.get<Feedback[]>(this.apiUrl, { headers: this.headers }).pipe(
      timeout(this.timeoutDuration),
      retry(2),
      map(feedbacks => {
        console.log('All feedback received:', feedbacks);
        // Filter by userId (in a real app, this filtering would happen on the server)
        const userFeedbacks = feedbacks.filter(f => f.userId === userId);
        console.log('Filtered feedback for user:', userFeedbacks);
        return userFeedbacks;
      }),
      catchError(this.handleError(`getFeedbackByUserId userId=${userId}`, [])),
      finalize(() => this.isLoading = false)
    );
  }

  createFeedback(feedback: FeedbackForm): Observable<Feedback> {
    this.isLoading = true;
    console.log('Creating feedback. URL:', this.apiUrl);
    console.log('Data being sent:', feedback);
    
    return this.http.post<Feedback>(this.apiUrl, feedback, { 
      headers: this.headers,
      responseType: 'json'
    }).pipe(
      timeout(this.timeoutDuration),
      retry(1), // Only retry once for write operations
      tap(response => console.log('Feedback created. Response:', response)),
      catchError(this.handleError('createFeedback')),
      finalize(() => this.isLoading = false)
    );
  }

  updateFeedback(id: number, feedback: FeedbackForm): Observable<Feedback> {
    this.isLoading = true;
    console.log(`Updating feedback with ID ${id}. URL: ${this.apiUrl}/${id}`);
    console.log('Data being sent:', feedback);
    
    return this.http.put<Feedback>(`${this.apiUrl}/${id}`, feedback, { 
      headers: this.headers,
      responseType: 'json'
    }).pipe(
      timeout(this.timeoutDuration),
      retry(1), // Only retry once for write operations
      tap(response => console.log('Feedback updated. Response:', response)),
      catchError(this.handleError(`updateFeedback id=${id}`)),
      finalize(() => this.isLoading = false)
    );
  }

  deleteFeedback(id: number): Observable<boolean> {
    this.isLoading = true;
    console.log(`Deleting feedback with ID ${id}. URL: ${this.apiUrl}/${id}`);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers }).pipe(
      timeout(this.timeoutDuration),
      retry(1), // Only retry once for delete operations
      map(() => {
        console.log(`Feedback with ID ${id} deleted successfully`);
        return true;
      }),
      catchError(this.handleError(`deleteFeedback id=${id}`)),
      finalize(() => this.isLoading = false)
    );
  }

  // Analytics Helper Functions
  getStatistics(): Observable<FeedbackStatistics> {
    this.isLoading = true;
    
    return this.http.get<FeedbackStatistics>(`${this.apiUrl}/statistics`, { headers: this.headers }).pipe(
      catchError(this.handleError('getStatistics', null)),
      finalize(() => this.isLoading = false)
    );
  }
} 