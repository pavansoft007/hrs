import Joi from 'joi';

export const registerSchema = Joi.object({
  full_name: Joi.string().min(2).max(120).required().messages({
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name must not exceed 120 characters',
    'any.required': 'Full name is required',
  }),
  email: Joi.string().email().max(254).required().messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email must not exceed 254 characters',
    'any.required': 'Email is required',
  }),
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
  user_type: Joi.string()
    .valid('MASTER_ADMIN', 'PROPERTY_ADMIN', 'STAFF')
    .default('STAFF'),
  property_id: Joi.number().integer().positive().optional().allow(null),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
    }),
});

export const propertySchema = Joi.object({
  code: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Property code must be at least 2 characters long',
    'string.max': 'Property code must not exceed 50 characters',
    'any.required': 'Property code is required',
  }),
  name: Joi.string().min(2).max(150).required().messages({
    'string.min': 'Property name must be at least 2 characters long',
    'string.max': 'Property name must not exceed 150 characters',
    'any.required': 'Property name is required',
  }),
  address_line1: Joi.string().max(200).optional().allow(''),
  address_line2: Joi.string().max(200).optional().allow(''),
  city: Joi.string().max(80).optional().allow(''),
  state: Joi.string().max(80).optional().allow(''),
  country: Joi.string().max(80).optional().allow(''),
  postal_code: Joi.string().max(20).optional().allow(''),
  timezone: Joi.string().max(64).default('Asia/Kolkata'),
  gstin: Joi.string().max(20).optional().allow(''),
});

export const createPropertySchema = Joi.object({
  code: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Property code must be at least 2 characters long',
    'string.max': 'Property code must not exceed 50 characters',
    'any.required': 'Property code is required',
  }),
  name: Joi.string().min(2).max(150).required().messages({
    'string.min': 'Property name must be at least 2 characters long',
    'string.max': 'Property name must not exceed 150 characters',
    'any.required': 'Property name is required',
  }),
  property_type: Joi.string().valid('HOTEL', 'RESTAURANT').required().messages({
    'any.only': 'Property type must be either HOTEL or RESTAURANT',
    'any.required': 'Property type is required',
  }),
  address_line1: Joi.string().max(200).optional().allow(''),
  address_line2: Joi.string().max(200).optional().allow(''),
  city: Joi.string().max(80).optional().allow(''),
  state: Joi.string().max(80).optional().allow(''),
  country: Joi.string().max(80).optional().allow(''),
  postal_code: Joi.string().max(20).optional().allow(''),
  timezone: Joi.string().max(64).default('Asia/Kolkata'),
  gstin: Joi.string().max(20).optional().allow(''),
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
  email: Joi.string().email().max(254).optional().allow('').messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email must not exceed 254 characters',
  }),
  website: Joi.string().uri().max(200).optional().allow('').messages({
    'string.uri': 'Please provide a valid website URL',
    'string.max': 'Website URL must not exceed 200 characters',
  }),
});

export const updatePropertySchema = Joi.object({
  name: Joi.string().min(2).max(150).optional().messages({
    'string.min': 'Property name must be at least 2 characters long',
    'string.max': 'Property name must not exceed 150 characters',
  }),
  address_line1: Joi.string().max(200).optional().allow(''),
  address_line2: Joi.string().max(200).optional().allow(''),
  city: Joi.string().max(80).optional().allow(''),
  state: Joi.string().max(80).optional().allow(''),
  country: Joi.string().max(80).optional().allow(''),
  postal_code: Joi.string().max(20).optional().allow(''),
  timezone: Joi.string().max(64).optional(),
  gstin: Joi.string().max(20).optional().allow(''),
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
  email: Joi.string().email().max(254).optional().allow('').messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email must not exceed 254 characters',
  }),
  website: Joi.string().uri().max(200).optional().allow('').messages({
    'string.uri': 'Please provide a valid website URL',
    'string.max': 'Website URL must not exceed 200 characters',
  }),
});

export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(80).required().messages({
    'string.min': 'Role name must be at least 2 characters long',
    'string.max': 'Role name must not exceed 80 characters',
    'any.required': 'Role name is required',
  }),
  description: Joi.string().max(255).optional().allow('').messages({
    'string.max': 'Description must not exceed 255 characters',
  }),
});

export const createPermissionSchema = Joi.object({
  code: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Permission code must be at least 2 characters long',
    'string.max': 'Permission code must not exceed 100 characters',
    'any.required': 'Permission code is required',
  }),
  description: Joi.string().max(255).optional().allow('').messages({
    'string.max': 'Description must not exceed 255 characters',
  }),
});

export const assignPermissionsSchema = Joi.object({
  permissionIds: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one permission ID is required',
      'any.required': 'Permission IDs are required',
    }),
});

export const assignRolesSchema = Joi.object({
  roleIds: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one role ID is required',
      'any.required': 'Role IDs are required',
    }),
});

export const createUserSchema = Joi.object({
  full_name: Joi.string().min(2).max(120).required().messages({
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name must not exceed 120 characters',
    'any.required': 'Full name is required',
  }),
  email: Joi.string().email().max(254).optional().allow('').messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email must not exceed 254 characters',
  }),
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .optional()
    .allow('')
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
  user_type: Joi.string()
    .valid('MASTER_ADMIN', 'PROPERTY_ADMIN', 'STAFF')
    .default('STAFF'),
  property_id: Joi.number().integer().positive().optional().allow(null),
  role_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Role IDs must be an array',
    }),
});

export const updateUserSchema = Joi.object({
  full_name: Joi.string().min(2).max(120).optional().messages({
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name must not exceed 120 characters',
  }),
  email: Joi.string().email().max(254).optional().allow('').messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email must not exceed 254 characters',
  }),
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .optional()
    .allow('')
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
  user_type: Joi.string()
    .valid('MASTER_ADMIN', 'PROPERTY_ADMIN', 'STAFF')
    .optional(),
  property_id: Joi.number().integer().positive().optional().allow(null),
  is_active: Joi.boolean().optional(),
  role_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Role IDs must be an array',
    }),
});
