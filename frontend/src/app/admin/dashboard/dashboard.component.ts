import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { FeedbackService, Feedback, FeedbackStatistics } from '../../services/feedback.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, HeaderComponent, FooterComponent]
})
export class DashboardComponent implements OnInit {
  activeSection: string = 'overview';
  loading: boolean = false;
  error: string | null = null;
  
  // Feedback data
  feedbackList: Feedback[] = [];
  filteredFeedbackList: Feedback[] = [];
  selectedFeedback: Feedback | null = null;
  searchTerm: string = '';
  
  // Statistics
  feedbackCount: number = 0;
  participantCount: number = 0;
  averageRating: number = 0;
  completionRate: string = '0%';
  techContentAvg: number = 0;
  venueAvg: number = 0;
  orgAvg: number = 0;
  ratingDistribution: {[key: number]: number} = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  constructor(private feedbackService: FeedbackService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    
    // Get feedback statistics
    this.feedbackService.getStatistics().subscribe({
      next: (stats: FeedbackStatistics) => {
        console.log('Statistics loaded:', stats);
        this.feedbackCount = stats.count;
        this.averageRating = stats.averageRating;
        this.techContentAvg = stats.averageTechContent;
        this.venueAvg = stats.averageVenueFacilities;
        this.orgAvg = stats.averageOrgManagement;
        this.participantCount = stats.uniqueParticipants;
        
        // Calculate completionRate if not provided
        if (this.feedbackCount > 0) {
          const rate = (this.participantCount / this.feedbackCount) * 100;
          this.completionRate = Math.round(rate) + '%';
        } else {
          this.completionRate = '0%';
        }
        
        // Convert rating distribution from object with number keys
        this.ratingDistribution = stats.ratingDistribution as {[key: number]: number};
        
        // Now load the feedback list
        this.loadFeedbackList();
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
        this.error = err.message || 'Failed to load dashboard statistics';
        this.loading = false;
        
        // Try to load the feedback list anyway
        this.loadFeedbackList();
      }
    });
  }

  loadFeedbackList(): void {
    this.loading = true;
    
    this.feedbackService.getAllFeedback().subscribe({
      next: (feedbackList) => {
        console.log('Feedback list loaded:', feedbackList);
        this.feedbackList = feedbackList;
        this.filteredFeedbackList = [...feedbackList];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading feedback list:', err);
        this.error = err.message || 'Failed to load feedback list';
        this.loading = false;
      }
    });
  }

  refreshFeedbackList(): void {
    this.loadFeedbackList();
  }

  filterFeedback(): void {
    if (!this.searchTerm.trim()) {
      this.filteredFeedbackList = [...this.feedbackList];
      return;
    }
    
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredFeedbackList = this.feedbackList.filter(feedback => 
      feedback.name.toLowerCase().includes(searchLower) || 
      feedback.email.toLowerCase().includes(searchLower)
    );
  }

  navigateToSection(section: string): void {
    this.activeSection = section;
    
    // If navigating to the feedback section, refresh the list
    if (section === 'feedback') {
      this.refreshFeedbackList();
    }
  }

  viewFeedback(feedback: Feedback): void {
    this.selectedFeedback = feedback;
  }

  editFeedback(feedback: Feedback): void {
    // You could navigate to a form page or open a modal for editing
    console.log('Edit feedback:', feedback);
    // For now, just view the feedback
    this.selectedFeedback = feedback;
  }

  deleteFeedback(feedback: Feedback): void {
    if (!feedback.id) {
      console.error('Cannot delete feedback without an ID');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete the feedback from ${feedback.name}?`)) {
      return;
    }
    
    this.loading = true;
    this.feedbackService.deleteFeedback(feedback.id).subscribe({
      next: () => {
        console.log('Feedback deleted successfully');
        // Remove from the lists
        this.feedbackList = this.feedbackList.filter(f => f.id !== feedback.id);
        this.filteredFeedbackList = this.filteredFeedbackList.filter(f => f.id !== feedback.id);
        // Update statistics
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error deleting feedback:', err);
        this.error = err.message || 'Failed to delete feedback';
        this.loading = false;
      }
    });
  }

  closeModal(): void {
    this.selectedFeedback = null;
  }

  // Helper methods for star ratings
  getStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    return Array(fullStars).fill(0).map((_, i) => i);
  }

  getEmptyStarArray(rating: number): number[] {
    const emptyStars = 5 - Math.ceil(rating);
    return Array(emptyStars < 0 ? 0 : emptyStars).fill(0).map((_, i) => i);
  }

  // Helper methods for charts
  getRatingPercentage(rating: number): number {
    if (this.feedbackCount === 0) return 0;
    
    const count = this.ratingDistribution[rating] || 0;
    return Math.round((count / this.feedbackCount) * 100);
  }

  getRatingCount(rating: number): number {
    return this.ratingDistribution[rating] || 0;
  }
} 