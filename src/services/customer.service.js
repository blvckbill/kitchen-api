import bcrypt from 'bcryptjs';
import { CustomerRepository, RefreshTokenRepository } from '../repositories/customer.repository.js';
import { generateCustomerToken, generateCustomerRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';

const customerRepository = new CustomerRepository();
const refreshTokenRepository = new RefreshTokenRepository();

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const getRefreshTokenExpiry = () => {
  const date = new Date();
  date.setDate(date.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return date;
};

const issueTokenPair = async (customer) => {
  const accessToken = generateCustomerToken(customer);
  const refreshToken = generateCustomerRefreshToken(customer);
  const expiresAt = getRefreshTokenExpiry();

  await refreshTokenRepository.create(customer.id, refreshToken, expiresAt);

  return { accessToken, refreshToken };
};

const sanitizeCustomer = (customer) => ({
  id: customer.id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  created_at: customer.created_at,
});

export class CustomerService {
  async register(data) {
    const existing = await customerRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const customer = await customerRepository.create({
      ...data,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = await issueTokenPair(customer);

    return {
      customer: sanitizeCustomer(customer),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async login(data) {
    const customer = await customerRepository.findByEmail(data.email);
    if (!customer) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(data.password, customer.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { accessToken, refreshToken } = await issueTokenPair(customer);

    return {
      customer: sanitizeCustomer(customer),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(token) {
    // Verify token signature first
    const decoded = verifyRefreshToken(token);

    // Check it exists in DB and is not revoked
    const storedToken = await refreshTokenRepository.findByToken(token);
    if (!storedToken) {
      throw new UnauthorizedError('Refresh token is invalid or expired');
    }

    const customer = await customerRepository.findById(decoded.sub);
    if (!customer) {
      throw new UnauthorizedError('Customer not found');
    }

    // Rotate — revoke old, issue new pair
    await refreshTokenRepository.revokeToken(token);
    const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(customer);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(token) {
    await refreshTokenRepository.revokeToken(token);
  }
}