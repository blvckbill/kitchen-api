import { registerSchema, loginSchema } from '../validators/customer.validator.js';
import { CustomerService } from '../services/customer.service.js';
import { successResponse } from '../utils/response.js';

const customerService = new CustomerService();

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await customerService.register(data);
    return successResponse(res, result, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await customerService.login(data);
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      throw new UnauthorizedError('Refresh token is required');
    }
    const result = await customerService.refreshToken(refresh_token);
    return successResponse(res, result, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      throw new UnauthorizedError('Refresh token is required');
    }
    await customerService.logout(refresh_token);
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

