import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';

const routes: Routes = [
  { path: '', component: FeedbackFormComponent }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    FeedbackFormComponent
  ]
})
export class FeedbackModule { } 