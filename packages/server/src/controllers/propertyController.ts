import type { Response } from 'express';
import { Op } from 'sequelize';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { Property, User } from '../models/index.js';

export class PropertyController {
  /**
   * Create a new property (Hotel or Restaurant)
   * Only Master Admin can create properties
   */
  static async createProperty(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can create properties',
        });
        return;
      }

      const {
        code,
        name,
        property_type,
        address_line1,
        address_line2,
        city,
        state,
        country,
        postal_code,
        timezone,
        gstin,
        phone,
        email,
        website,
      } = req.body;

      // Check if property code already exists
      const existingProperty = await Property.findOne({ where: { code } });
      if (existingProperty) {
        res.status(400).json({
          success: false,
          message: 'Property with this code already exists',
        });
        return;
      }

      // Create property
      const property = await Property.create({
        code,
        name,
        property_type,
        address_line1,
        address_line2,
        city,
        state,
        country,
        postal_code,
        timezone: timezone || 'Asia/Kolkata',
        gstin,
        phone,
        email,
        website,
        is_active: true,
      });

      res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: { property },
      });
    } catch (error) {
      console.error('Create property error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating property',
      });
    }
  }

  /**
   * Get all properties with pagination and filtering
   */
  static async getProperties(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const {
        page = 1,
        limit = 10,
        property_type,
        search,
        is_active,
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Build where conditions
      const whereConditions: any = {};

      if (property_type) {
        whereConditions.property_type = property_type;
      }

      if (is_active !== undefined) {
        whereConditions.is_active = is_active === 'true';
      }

      if (search) {
        whereConditions[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } },
          { city: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows: properties } = await Property.findAndCountAll({
        where: whereConditions,
        limit: Number(limit),
        offset,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'full_name', 'email', 'user_type'],
          },
        ],
      });

      res.status(200).json({
        success: true,
        data: {
          properties,
          pagination: {
            current_page: Number(page),
            total_pages: Math.ceil(count / Number(limit)),
            total_items: count,
            items_per_page: Number(limit),
          },
        },
      });
    } catch (error) {
      console.error('Get properties error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching properties',
      });
    }
  }

  /**
   * Get property by ID
   */
  static async getPropertyById(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;

      const property = await Property.findByPk(id, {
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'full_name', 'email', 'user_type', 'is_active'],
          },
        ],
      });

      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Property not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { property },
      });
    } catch (error) {
      console.error('Get property error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching property',
      });
    }
  }

  /**
   * Update property
   * Master Admin can update any property
   * Property Admin can update their own property
   */
  static async updateProperty(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      console.log('🔄 Update property request:', {
        id,
        updateData,
        user: req.user.id,
        userType: req.user.user_type,
      });

      const property = await Property.findByPk(id);
      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Property not found',
        });
        return;
      }

      console.log('📝 Property before update:', property.toJSON());

      // Check permissions
      const canUpdate =
        req.user.user_type === 'MASTER_ADMIN' ||
        (req.user.user_type === 'PROPERTY_ADMIN' &&
          req.user.property_id === property.id);

      if (!canUpdate) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to update this property',
        });
        return;
      }

      // Don't allow changing property_type after creation
      delete updateData.property_type;
      delete updateData.id;

      // Check if code is being updated and if it conflicts with existing properties
      if (updateData.code && updateData.code !== property.code) {
        const existingProperty = await Property.findOne({
          where: { code: updateData.code },
        });
        if (existingProperty && existingProperty.id !== property.id) {
          res.status(400).json({
            success: false,
            message: 'Property with this code already exists',
          });
          return;
        }
      }

      console.log('📋 Final update data:', updateData);

      const updatedProperty = await property.update(updateData);
      console.log(
        '✅ Update result - property updated:',
        updatedProperty.toJSON(),
      );

      res.status(200).json({
        success: true,
        message: 'Property updated successfully',
        data: { property: updatedProperty },
      });
    } catch (error) {
      console.error('Update property error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating property',
      });
    }
  }

  /**
   * Delete property
   * Only Master Admin can delete properties
   */
  static async deleteProperty(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can delete properties',
        });
        return;
      }

      const { id } = req.params;

      const property = await Property.findByPk(id);
      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Property not found',
        });
        return;
      }

      // Check if property has associated users
      const userCount = await User.count({ where: { property_id: id } });
      if (userCount > 0) {
        res.status(400).json({
          success: false,
          message:
            'Cannot delete property with associated users. Please reassign or remove users first.',
          user_count: userCount,
        });
        return;
      }

      await property.destroy();

      res.status(200).json({
        success: true,
        message: 'Property deleted successfully',
      });
    } catch (error) {
      console.error('Delete property error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting property',
      });
    }
  }

  /**
   * Toggle property active status
   */
  static async togglePropertyStatus(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can change property status',
        });
        return;
      }

      const { id } = req.params;

      const property = await Property.findByPk(id);
      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Property not found',
        });
        return;
      }

      await property.update({ is_active: !property.is_active });

      res.status(200).json({
        success: true,
        message: `Property ${
          property.is_active ? 'activated' : 'deactivated'
        } successfully`,
        data: { property },
      });
    } catch (error) {
      console.error('Toggle property status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while changing property status',
      });
    }
  }

  /**
   * Get property statistics
   */
  static async getPropertyStats(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can view property statistics',
        });
        return;
      }

      const totalProperties = await Property.count();
      const activeProperties = await Property.count({
        where: { is_active: true },
      });
      const hotels = await Property.count({
        where: { property_type: 'HOTEL' },
      });
      const restaurants = await Property.count({
        where: { property_type: 'RESTAURANT' },
      });

      const propertiesWithUsers = await Property.findAll({
        attributes: ['id', 'name', 'property_type'],
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'user_type'],
          },
        ],
      });

      const userStats = propertiesWithUsers.map((property) => ({
        property_id: property.id,
        property_name: property.name,
        property_type: property.property_type,
        total_users: property.users?.length || 0,
        admins:
          property.users?.filter((u) => u.user_type === 'PROPERTY_ADMIN')
            .length || 0,
        staff:
          property.users?.filter((u) => u.user_type === 'STAFF').length || 0,
      }));

      res.status(200).json({
        success: true,
        data: {
          overview: {
            total_properties: totalProperties,
            active_properties: activeProperties,
            inactive_properties: totalProperties - activeProperties,
            hotels,
            restaurants,
          },
          property_details: userStats,
        },
      });
    } catch (error) {
      console.error('Get property stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching property statistics',
      });
    }
  }
}
