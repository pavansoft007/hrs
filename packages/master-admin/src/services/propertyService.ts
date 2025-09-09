import axios from '../utils/api';

export interface PropertyFormData {
  code: string;
  name: string;
  property_type: 'HOTEL' | 'RESTAURANT';
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  gstin?: string;
}

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
  timezone?: string;
  gstin?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyStats {
  total_properties: number;
  active_properties: number;
  inactive_properties: number;
  hotels: number;
  restaurants: number;
}

export interface PropertiesResponse {
  success: boolean;
  data: {
    properties: Property[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
}

export interface PropertyResponse {
  success: boolean;
  data: {
    property: Property;
  };
}

export interface StatsResponse {
  success: boolean;
  data: {
    overview: PropertyStats;
    property_details: Array<{
      property_id: number;
      property_name: string;
      property_type: string;
      total_users: number;
      admins: number;
      staff: number;
    }>;
  };
}

export const propertyService = {
  // Create a new property (hotel or restaurant)
  async createProperty(data: PropertyFormData): Promise<PropertyResponse> {
    const response = await axios.post('/properties', data);
    return response.data;
  },

  // Get all properties with filtering
  async getProperties(params?: {
    page?: number;
    limit?: number;
    property_type?: 'HOTEL' | 'RESTAURANT';
    search?: string;
    is_active?: boolean;
  }): Promise<PropertiesResponse> {
    const response = await axios.get('/properties', { params });
    return response.data;
  },

  // Get property by ID
  async getPropertyById(id: number): Promise<PropertyResponse> {
    const response = await axios.get(`/properties/${id}`);
    return response.data;
  },

  // Update property
  async updateProperty(
    id: number,
    data: Partial<PropertyFormData>,
  ): Promise<PropertyResponse> {
    const response = await axios.put(`/properties/${id}`, data);
    return response.data;
  },

  // Delete property
  async deleteProperty(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(`/properties/${id}`);
    return response.data;
  },

  // Toggle property status
  async togglePropertyStatus(id: number): Promise<PropertyResponse> {
    const response = await axios.patch(`/properties/${id}/toggle-status`);
    return response.data;
  },

  // Get property statistics
  async getPropertyStats(): Promise<StatsResponse> {
    const response = await axios.get('/properties/stats');
    return response.data;
  },

  // Get hotels only
  async getHotels(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PropertiesResponse> {
    return this.getProperties({ ...params, property_type: 'HOTEL' });
  },

  // Get restaurants only
  async getRestaurants(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PropertiesResponse> {
    return this.getProperties({ ...params, property_type: 'RESTAURANT' });
  },

  // Create hotel specifically
  async createHotel(
    data: Omit<PropertyFormData, 'property_type'>,
  ): Promise<PropertyResponse> {
    return this.createProperty({ ...data, property_type: 'HOTEL' });
  },

  // Create restaurant specifically
  async createRestaurant(
    data: Omit<PropertyFormData, 'property_type'>,
  ): Promise<PropertyResponse> {
    return this.createProperty({ ...data, property_type: 'RESTAURANT' });
  },
};

export default propertyService;
