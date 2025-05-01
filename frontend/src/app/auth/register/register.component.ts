import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['user', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ notMatch: true });
      return { notMatch: true };
    } else {
      return null;
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    const { name, email, password, role } = this.registerForm.value;
    
    this.authService.register(name, email, password).subscribe({
      next: (user) => {
        // Save user to local storage
        this.authService.saveUserToLocalStorage(user);
        
        // Navigate based on user role
        this.router.navigate(['/feedback']);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
} 