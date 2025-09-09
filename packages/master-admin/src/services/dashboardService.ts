import axios from '../utils/api';

export interface DashboardStats {
  totalHotels: number;
  totalRestaurants: number;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRoles: number;
  usersByType: {
    MASTER_ADMIN: number;
    PROPERTY_ADMIN: number;
    STAFF: number;
  };
  propertiesByType: {
    HOTEL: number;
    RESTAURANT: number;
  };
  recentUsers: number;
  recentProperties: number;
}

export interface MonthlyStats {
  userChart: Array<{
    month: string;
    users: number;
  }>;
  propertyChart: Array<{
    month: string;
    hotels: number;
    restaurants: number;
  }>;
  year: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
  message: string;
}

export interface MonthlyStatsResponse {
  success: boolean;
  data: MonthlyStats;
  message: string;
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await axios.get<DashboardStatsResponse>(
      '/dashboard/stats',
    );
    return response.data.data;
  },

  /**
   * Get monthly statistics for charts
   */
  async getMonthlyStats(year?: number): Promise<MonthlyStats> {
    const params = year ? { year } : {};
    const response = await axios.get<MonthlyStatsResponse>(
      '/dashboard/monthly-stats',
      { params },
    );
    return response.data.data;
  },
};
