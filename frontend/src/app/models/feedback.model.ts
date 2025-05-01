export interface Feedback {
  id?: string;
  userId: string;
  name: string;
  email: string;
  contactNo: string;
  overallRating: number;
  venueFacilitiesRating: number;
  organizationManagementRating: number;
  technicalContentRating: number;
  comments?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 