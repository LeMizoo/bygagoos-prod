const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockGenerateAccessToken = jest.fn();
const mockBcryptHash = jest.fn();
const mockBcryptCompare = jest.fn();
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};
const mockRefreshTokenService = {
  generateToken: jest.fn(),
  storeToken: jest.fn(),
  verifyToken: jest.fn(),
  rotateToken: jest.fn(),
  revokeToken: jest.fn(),
  revokeAllUserTokens: jest.fn(),
};

jest.mock('../../users/user.model', () => ({
  __esModule: true,
  default: {
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: mockBcryptHash,
    compare: mockBcryptCompare,
  },
}));

jest.mock('../utils/jwt', () => ({
  __esModule: true,
  generateAccessToken: mockGenerateAccessToken,
}));

jest.mock('../refreshToken.service', () => ({
  __esModule: true,
  RefreshTokenService: mockRefreshTokenService,
}));

jest.mock('../../../core/utils/logger', () => ({
  __esModule: true,
  default: mockLogger,
}));

import authService from '../auth.service';

type MockUser = {
  id: string;
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  phone: string;
  avatar: null;
  address: null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  save: jest.Mock;
  toObject: jest.Mock;
};

const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => {
  const user: MockUser = {
    id: 'user-1',
    _id: 'user-1',
    email: 'demo@bygagoos.com',
    firstName: 'Demo',
    lastName: 'User',
    name: 'Demo User',
    role: 'CLIENT',
    phone: '0340000000',
    avatar: null,
    address: null,
    isActive: true,
    lastLogin: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    password: 'hashed-password',
    save: jest.fn().mockResolvedValue(undefined),
    toObject: jest.fn(),
  };

  Object.assign(user, overrides);
  user.toObject.mockReturnValue({ ...user });
  return user;
};

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGenerateAccessToken.mockReturnValue('access-token');
    mockRefreshTokenService.generateToken.mockReturnValue('refresh-token');
    mockRefreshTokenService.storeToken.mockResolvedValue(undefined);
    mockRefreshTokenService.revokeToken.mockResolvedValue(true);
    mockRefreshTokenService.rotateToken.mockResolvedValue('rotated-refresh-token');
    mockRefreshTokenService.revokeAllUserTokens.mockResolvedValue(0);
    mockBcryptHash.mockResolvedValue('hashed-password');
    mockBcryptCompare.mockResolvedValue(true);
  });

  it('normalizes email before creating a new account', async () => {
    const createdUser = createMockUser({
      id: 'user-2',
      _id: 'user-2',
      email: 'new.client@bygagoos.com',
      firstName: 'New',
      lastName: 'Client',
      name: 'New Client',
    });

    mockFindOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null),
    }));
    mockCreate.mockResolvedValue(createdUser);

    const result = await authService.register({
      email: '  New.Client@Bygagoos.com ',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'Client',
    });

    expect(mockFindOne).toHaveBeenCalledWith({ email: 'new.client@bygagoos.com' });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new.client@bygagoos.com',
        password: 'hashed-password',
        firstName: 'New',
        lastName: 'Client',
        name: 'New Client',
        role: 'CLIENT',
        isActive: true,
      })
    );
    expect(result.user.email).toBe('new.client@bygagoos.com');
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
  });

  it('falls back to a case-insensitive lookup during login', async () => {
    const legacyUser = createMockUser({
      id: 'user-3',
      _id: 'user-3',
      email: 'LEGACY.USER@Bygagoos.com',
      firstName: 'Legacy',
      lastName: 'User',
      name: 'Legacy User',
    });

    mockFindOne.mockImplementation((query: { email?: unknown }) => ({
      select: jest.fn().mockResolvedValue(typeof query.email === 'string' ? null : legacyUser),
    }));

    const result = await authService.login({
      email: '  legacy.user@Bygagoos.com ',
      password: 'Password123!',
    });

    expect(mockFindOne).toHaveBeenNthCalledWith(1, {
      email: 'legacy.user@bygagoos.com',
    });
    expect(mockFindOne).toHaveBeenNthCalledWith(2, {
      email: {
        $regex: '^legacy\\.user@bygagoos\\.com$',
        $options: 'i',
      },
    });
    expect(mockBcryptCompare).toHaveBeenCalledWith('Password123!', 'hashed-password');
    expect(legacyUser.save).toHaveBeenCalled();
    expect(mockGenerateAccessToken).toHaveBeenCalledWith('user-3', 'LEGACY.USER@Bygagoos.com', 'CLIENT');
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user.email).toBe('LEGACY.USER@Bygagoos.com');
  });
});
