export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  roles?: string[];
  // Add more fields as needed, but no sensitive info
}
