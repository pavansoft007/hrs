// API response and request types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Property types (minimal for auth user property reference)
export interface Property {
  id: number;
  code: string;
  name: string;
  property_type: 'HOTEL' | 'RESTAURANT';
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  gstin?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// User types (minimal for authentication)
export interface User {
  id: number;
  full_name: string;
  email: string;
  user_type: 'MASTER_ADMIN' | 'PROPERTY_ADMIN' | 'STAFF';
  property_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  property?: Property;
}
