import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['user', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      // Mark fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    const { email, password, role } = this.loginForm.value;
    
    this.authService.login(email, password, role).subscribe({
      next: (user) => {
        // Save user to local storage
        this.authService.saveUserToLocalStorage(user);
        
        // Navigate based on user role
        if (role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/feedback']);
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
} 