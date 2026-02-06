import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseHelper {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(meta && { meta }),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        message,
        ...(code && { code }),
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): Response {
    return ResponseHelper.success(res, data, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  }
}

export default ResponseHelper;