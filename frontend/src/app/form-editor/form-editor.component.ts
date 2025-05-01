import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-form-editor',
  templateUrl: './form-editor.component.html',
  styleUrls: ['./form-editor.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class FormEditorComponent implements OnInit {
  formEditorForm: FormGroup = new FormGroup({});
  isSubmitting = false;
  showSuccessAlert = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.formEditorForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      fields: this.fb.array([])
    });
    this.addField(); // Add an initial empty field
  }

  get fields(): FormArray {
    return this.formEditorForm.get('fields') as FormArray;
  }

  addField(): void {
    const fieldGroup = this.fb.group({
      label: ['', Validators.required],
      type: ['text', Validators.required],
      required: [false],
      options: [''] // For select, radio, checkbox types
    });
    
    this.fields.push(fieldGroup);
  }

  removeField(index: number): void {
    this.fields.removeAt(index);
  }

  getFieldTypeOptions(): string[] {
    return ['text', 'textarea', 'email', 'number', 'select', 'radio', 'checkbox', 'date'];
  }

  onSubmit(): void {
    if (this.formEditorForm.invalid) {
      Object.keys(this.formEditorForm.controls).forEach(key => {
        const control = this.formEditorForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    
    // Here you would typically save the form to a backend service
    // For demonstration, we'll just simulate a successful save
    setTimeout(() => {
      this.isSubmitting = false;
      this.showSuccessAlert = true;
      
      // Hide success alert after 3 seconds
      setTimeout(() => {
        this.showSuccessAlert = false;
      }, 3000);
      
      // Reset form
      this.formEditorForm.reset();
      this.fields.clear();
      this.addField();
    }, 1000);
  }
} 