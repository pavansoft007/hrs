import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Property, User } from '../models/index.js';

interface DashboardStats {
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
  recentUsers: number; // users created in last 30 days
  recentProperties: number; // properties created in last 30 days
}

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total properties by type
    const totalHotels = await Property.count({
      where: { property_type: 'HOTEL', is_active: true },
    });

    const totalRestaurants = await Property.count({
      where: { property_type: 'RESTAURANT', is_active: true },
    });

    // Get total users
    const totalUsers = await User.count();

    const activeUsers = await User.count({
      where: { is_active: true },
    });

    const inactiveUsers = totalUsers - activeUsers;

    // Get users by type
    const usersByType = (await User.findAll({
      attributes: [
        'user_type',
        [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count'],
      ],
      group: ['user_type'],
      raw: true,
    })) as unknown as Array<{ user_type: string; count: number }>;

    const userTypeStats = {
      MASTER_ADMIN: 0,
      PROPERTY_ADMIN: 0,
      STAFF: 0,
    };

    usersByType.forEach(item => {
      if (item.user_type in userTypeStats) {
        userTypeStats[item.user_type as keyof typeof userTypeStats] = Number(
          item.count,
        );
      }
    });

    // Get recent users (last 30 days)
    const recentUsers = await User.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    });

    // Get recent properties (last 30 days)
    const recentProperties = await Property.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    });

    // Get properties by type for charts
    const propertiesByType = {
      HOTEL: totalHotels,
      RESTAURANT: totalRestaurants,
    };

    const stats: DashboardStats = {
      totalHotels,
      totalRestaurants,
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalRoles: 3, // We have 3 user types: MASTER_ADMIN, PROPERTY_ADMIN, STAFF
      usersByType: userTypeStats,
      propertiesByType,
      recentUsers,
      recentProperties,
    };

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export const getMonthlyStats = async (req: Request, res: Response) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    // Get monthly user registrations for the year
    const monthlyUsers = (await User.findAll({
      attributes: [
        [
          User.sequelize!.fn('MONTH', User.sequelize!.col('created_at')),
          'month',
        ],
        [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count'],
      ],
      where: {
        created_at: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lt]: new Date(`${Number(year) + 1}-01-01`),
        },
      },
      group: [User.sequelize!.fn('MONTH', User.sequelize!.col('created_at'))],
      order: [
        [User.sequelize!.fn('MONTH', User.sequelize!.col('created_at')), 'ASC'],
      ],
      raw: true,
    })) as unknown as Array<{ month: number; count: number }>;

    // Get monthly property registrations for the year
    const monthlyProperties = (await Property.findAll({
      attributes: [
        [
          Property.sequelize!.fn(
            'MONTH',
            Property.sequelize!.col('created_at'),
          ),
          'month',
        ],
        'property_type',
        [
          Property.sequelize!.fn('COUNT', Property.sequelize!.col('id')),
          'count',
        ],
      ],
      where: {
        created_at: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lt]: new Date(`${Number(year) + 1}-01-01`),
        },
      },
      group: [
        Property.sequelize!.fn('MONTH', Property.sequelize!.col('created_at')),
        'property_type',
      ],
      order: [
        [
          Property.sequelize!.fn(
            'MONTH',
            Property.sequelize!.col('created_at'),
          ),
          'ASC',
        ],
      ],
      raw: true,
    })) as unknown as Array<{
      month: number;
      property_type: 'HOTEL' | 'RESTAURANT';
      count: number;
    }>;

    // Format the data for charts
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const userChart = monthNames.map((month, index) => {
      const monthData = monthlyUsers.find(item => item.month === index + 1);
      return {
        month,
        users: monthData ? Number(monthData.count) : 0,
      };
    });

    const propertyChart = monthNames.map((month, index) => {
      const hotelData = monthlyProperties.find(
        item => item.month === index + 1 && item.property_type === 'HOTEL',
      );
      const restaurantData = monthlyProperties.find(
        item => item.month === index + 1 && item.property_type === 'RESTAURANT',
      );

      return {
        month,
        hotels: hotelData ? Number(hotelData.count) : 0,
        restaurants: restaurantData ? Number(restaurantData.count) : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        userChart,
        propertyChart,
        year: Number(year),
      },
      message: 'Monthly statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};
