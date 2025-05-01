import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { Feedback, FeedbackService } from '../services/feedback.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent]
})
export class DashboardComponent implements OnInit {
  feedbackList: Feedback[] = [];
  isLoading = true;
  
  // For analytics
  averageRatings = {
    overall: 0,
    venue: 0,
    organization: 0,
    technical: 0
  };
  totalResponses = 0;
  
  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.isLoading = true;
    this.feedbackService.getAllFeedback().subscribe({
      next: (feedbacks) => {
        this.feedbackList = feedbacks;
        this.calculateAnalytics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading feedbacks:', error);
        this.isLoading = false;
        
        // Fallback to localStorage if API fails
        const allFeedbacks: Feedback[] = [];
        
        // Get all items from localStorage that start with 'feedback_'
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('feedback_')) {
            const feedbackStr = localStorage.getItem(key);
            if (feedbackStr) {
              try {
                const feedback = JSON.parse(feedbackStr);
                allFeedbacks.push(feedback);
              } catch (e) {
                console.error('Error parsing feedback:', e);
              }
            }
          }
        }
        
        this.feedbackList = allFeedbacks;
        this.calculateAnalytics();
      }
    });
  }

  calculateAnalytics(): void {
    if (this.feedbackList.length === 0) return;
    
    this.totalResponses = this.feedbackList.length;
    
    // Calculate average ratings
    const totalRatings = this.feedbackList.reduce((acc, feedback) => {
      return {
        overall: acc.overall + feedback.overallEventQuality,
        venue: acc.venue + feedback.venueFacilities,
        organization: acc.organization + feedback.orgManagement,
        technical: acc.technical + feedback.techContent
      };
    }, { overall: 0, venue: 0, organization: 0, technical: 0 });
    
    this.averageRatings = {
      overall: +(totalRatings.overall / this.totalResponses).toFixed(1),
      venue: +(totalRatings.venue / this.totalResponses).toFixed(1),
      organization: +(totalRatings.organization / this.totalResponses).toFixed(1),
      technical: +(totalRatings.technical / this.totalResponses).toFixed(1)
    };
  }

  exportToExcel(): void {
    // This would typically use a library like xlsx in a real application
    // For this demo, we'll just create a simple CSV
    let csvContent = "Name,Email,Contact,Overall Rating,Venue Rating,Organization Rating,Technical Rating,Comments\n";
    
    this.feedbackList.forEach(feedback => {
      const row = [
        feedback.name,
        feedback.email,
        feedback.contactNo,
        feedback.overallEventQuality,
        feedback.venueFacilities,
        feedback.orgManagement,
        feedback.techContent,
        feedback.comments || ''
      ].map(cell => `"${cell}"`).join(',');
      
      csvContent += row + "\n";
    });
    
    // Create a CSV download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'feedback_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getStarArray(count: number): number[] {
    return Array(Math.round(count)).fill(0);
  }

  getEmptyStarArray(count: number): number[] {
    return Array(5 - Math.round(count)).fill(0);
  }
} 