import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { User } from '../../models/user.model';
import { FeedbackService, FeedbackForm } from '../../services/feedback.service';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule, HeaderComponent, FooterComponent]
})
export class FeedbackFormComponent implements OnInit {
  feedbackForm: FormGroup;
  currentUser: User | null = null;
  userFeedback: any | null = null;
  submitted = false;
  isEditing = false;
  loading = false;
  formLoading = false;
  errorMessage = '';
  isDevelopment = !environment.production;

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private authService: AuthService
  ) {
    this.feedbackForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNo: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      overallEventQuality: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      venueFacilities: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      orgManagement: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      techContent: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      comments: ['']
    });

    console.log('FeedbackFormComponent constructor initialized');
  }

  ngOnInit(): void {
    console.log('FeedbackFormComponent ngOnInit called');
    this.loadUserData();
  }

  loadUserData(): void {
    // Load user data from AuthService
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser && this.currentUser.name && this.currentUser.email) {
      this.feedbackForm.patchValue({
        name: this.currentUser.name,
        email: this.currentUser.email
      });
      
      // Check if user has already submitted feedback
      this.checkUserFeedback();
    } else {
      console.log('No valid user found');
    }
  }

  // For development testing only
  createMockUser(): void {
    this.authService.mockUser();
    this.loadUserData();
  }

  logoutUser(): void {
    this.authService.logout();
    this.currentUser = null;
    this.userFeedback = null;
    this.submitted = false;
    this.isEditing = false;
    window.location.reload();
  }

  checkUserFeedback(): void {
    if (!this.currentUser || !this.currentUser.id) {
      console.log('No user ID found, cannot check feedback');
      return;
    }
    
    this.loading = true;
    
    // Check if user has existing feedback in the backend
    this.feedbackService.getFeedbackByUserId(this.currentUser.id).subscribe({
      next: (feedbackList) => {
        console.log('User feedback received:', feedbackList);
        if (feedbackList && feedbackList.length > 0) {
          this.userFeedback = feedbackList[0]; // Use the most recent feedback
          this.prepareForEditing();
        } else {
          console.log('No feedback found for this user');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching user feedback:', error);
        this.loading = false;
        this.errorMessage = 'Error loading your feedback. Using local data if available.';
        
        // Fallback to local storage if API fails
        const storedFeedback = this.currentUser && this.currentUser.id ? 
          localStorage.getItem(`feedback_${this.currentUser.id}`) : null;
          
        if (storedFeedback) {
          try {
            this.userFeedback = JSON.parse(storedFeedback);
            this.prepareForEditing();
          } catch (e) {
            console.error('Error parsing stored feedback:', e);
          }
        }
      }
    });
  }

  prepareForEditing(): void {
    if (!this.userFeedback) return;
    
    this.isEditing = true;
    
    // Patch form with existing values, matching the updated property names
    this.feedbackForm.patchValue({
      name: this.userFeedback.name || '',
      email: this.userFeedback.email || '',
      contactNo: this.userFeedback.contactNo || '',
      overallEventQuality: this.userFeedback.overallEventQuality || 3,
      techContent: this.userFeedback.techContent || 3,
      venueFacilities: this.userFeedback.venueFacilities || 3,
      orgManagement: this.userFeedback.orgManagement || 3,
      comments: this.userFeedback.comments || ''
    });
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      // Mark all fields as touched to trigger validation
      Object.keys(this.feedbackForm.controls).forEach(key => {
        const control = this.feedbackForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Get form values
    const feedbackData: FeedbackForm = {
      ...this.feedbackForm.value,
      userId: this.currentUser?.id || 'anonymous'
    };

    console.log('Preparing to submit feedback data:', feedbackData);

    try {
      if (this.isEditing && this.userFeedback && this.userFeedback.feedbackId) {
        // Update existing feedback
        console.log(`Updating feedback with ID: ${this.userFeedback.feedbackId}`);
        this.feedbackService.updateFeedback(this.userFeedback.feedbackId, feedbackData).subscribe({
          next: (updatedFeedback) => {
            console.log('Feedback updated successfully in database:', updatedFeedback);
            
            // Store the updated feedback
            this.userFeedback = updatedFeedback;
            
            // Also save to localStorage as a backup
            if (this.currentUser?.id) {
              localStorage.setItem(`feedback_${this.currentUser.id}`, JSON.stringify(this.userFeedback));
            }
            
            this.isEditing = false;
            this.submitted = true;
            this.loading = false;
            this.errorMessage = '';
          },
          error: (error: Error) => {
            console.error('Error updating feedback in database:', error);
            this.errorMessage = error.message || 'Failed to update your feedback in the database';
            this.loading = false;
            
            // Fallback to localStorage
            if (this.currentUser?.id) {
              localStorage.setItem(`feedback_${this.currentUser.id}`, JSON.stringify({
                ...feedbackData,
                feedbackId: this.userFeedback?.feedbackId, 
                dateTime: this.userFeedback?.dateTime || new Date()
              }));
              
              // Still mark as submitted even though there was an error
              this.submitted = true;
              this.isEditing = false;
            }
          }
        });
      } else {
        // Create new feedback
        console.log('Creating new feedback');
        this.feedbackService.createFeedback(feedbackData).subscribe({
          next: (newFeedback) => {
            console.log('Feedback created successfully in database:', newFeedback);
            
            // Store the new feedback
            this.userFeedback = newFeedback;
            
            // Also save to localStorage as a backup
            if (this.currentUser?.id) {
              localStorage.setItem(`feedback_${this.currentUser.id}`, JSON.stringify(this.userFeedback));
            }
            
            this.submitted = true;
            this.loading = false;
            this.errorMessage = '';
          },
          error: (error: Error) => {
            console.error('Error submitting feedback to database:', error);
            this.errorMessage = error.message || 'Failed to save your feedback to the database';
            this.loading = false;
            
            // Fallback to localStorage
            const fallbackFeedback = {
              ...feedbackData,
              feedbackId: `local_${Date.now()}`,
              dateTime: new Date()
            };
            
            if (this.currentUser?.id) {
              localStorage.setItem(`feedback_${this.currentUser.id}`, JSON.stringify(fallbackFeedback));
              this.userFeedback = fallbackFeedback;
              this.submitted = true;
            }
          }
        });
      }
    } catch (err) {
      console.error('Exception during form submission:', err);
      this.errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      this.loading = false;
      
      // Fallback to localStorage
      if (this.currentUser?.id) {
        localStorage.setItem(`feedback_${this.currentUser.id}`, JSON.stringify({
          ...feedbackData,
          feedbackId: `local_${Date.now()}`,
          dateTime: new Date()
        }));
        
        this.submitted = true;
      }
    }
  }

  resetForm(): void {
    this.submitted = false;
    this.isEditing = false;
    this.feedbackForm.reset({
      overallEventQuality: 3,
      venueFacilities: 3,
      orgManagement: 3,
      techContent: 3
    });
    
    if (this.currentUser && this.currentUser.name && this.currentUser.email) {
      this.feedbackForm.patchValue({
        name: this.currentUser.name,
        email: this.currentUser.email
      });
    }
  }

  editFeedback(): void {
    this.submitted = false;
    this.isEditing = true;
    if (this.userFeedback) {
      this.prepareForEditing();
    }
  }

  editAgain(): void {
    this.submitted = false;
    this.isEditing = true;
    this.prepareForEditing();
  }

  getStarArray(count: number): number[] {
    return Array(count).fill(0);
  }

  getEmptyStarArray(count: number): number[] {
    return Array(5 - count).fill(0);
  }
} 