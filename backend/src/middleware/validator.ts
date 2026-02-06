import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  // User validation
  createProfile: Joi.object({
    displayName: Joi.string().min(3).max(30).required(),
    bio: Joi.string().max(150).optional().allow(''),
    phoneNumber: Joi.string().optional().allow(''),
  }),

  updateProfile: Joi.object({
    displayName: Joi.string().min(3).max(30).optional(),
    bio: Joi.string().max(150).optional().allow(''),
    phoneNumber: Joi.string().optional().allow(''),
  }),

  // Message validation
  sendMessage: Joi.object({
    chatId: Joi.string().uuid().required(),
    content: Joi.string().max(5000).required(),
    type: Joi.string().valid('TEXT', 'GIF', 'IMAGE').required(),
    replyTo: Joi.string().uuid().optional(),
  }),

  // Friend request validation
  sendFriendRequest: Joi.object({
    receiverId: Joi.string().uuid().required(),
  }),

  // Group chat validation
  createGroup: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional().allow(''),
    memberIds: Joi.array().items(Joi.string().uuid()).min(1).max(100).required(),
  }),

  // FCM notification validation
  sendNotification: Joi.object({
    userId: Joi.string().uuid().required(),
    title: Joi.string().required(),
    body: Joi.string().required(),
    data: Joi.object().optional(),
  }),
};