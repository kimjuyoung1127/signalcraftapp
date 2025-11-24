import { AuthService } from '../auth';
import api from '../api';
import { ENV } from '../../config/env';

// Mock the API module
jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

// Mock the environment
jest.mock('../../config/env', () => ({
  ENV: {
    IS_DEMO_MODE: false,
  },
}));

describe('AuthService', () => {
  const mockEmail = 'test@example.com';
  const mockPassword = 'password123';
  const mockUsername = 'testuser';
  const mockFullName = 'Test User';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'user',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          access_token: 'mock-token',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AuthService.login(mockEmail, mockPassword);

      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        email: mockEmail,
        password: mockPassword,
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        user: mockResponse.data.user,
        access_token: mockResponse.data.access_token,
      });
    });

    it('should return error when login fails', async () => {
      const mockError = {
        response: {
          data: {
            detail: 'Invalid credentials',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(mockError);

      const result = await AuthService.login(mockEmail, mockPassword);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Invalid credentials');
    });

    it('should return demo response when demo mode is enabled', async () => {
      // Temporarily change the mock to enable demo mode
      jest.mock('../../config/env', () => ({
        ENV: {
          IS_DEMO_MODE: true,
        },
      }));

      // Need to re-require the AuthService since we changed the mock
      const reloadedAuthService = await import('../auth');
      const result = await reloadedAuthService.AuthService.login(mockEmail, mockPassword);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.access_token).toBe('demo-token-bypass');
    });
  });

  describe('signup', () => {
    it('should successfully sign up with valid data', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'user',
            is_active: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AuthService.signup(
        mockEmail,
        mockPassword,
        mockUsername,
        mockFullName
      );

      expect(api.post).toHaveBeenCalledWith('/api/auth/signup', {
        email: mockEmail,
        password: mockPassword,
        username: mockUsername,
        full_name: mockFullName,
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        user: mockResponse.data.user,
      });
    });

    it('should return error when signup fails', async () => {
      const mockError = {
        response: {
          data: {
            detail: 'User already exists',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(mockError);

      const result = await AuthService.signup(
        mockEmail,
        mockPassword,
        mockUsername,
        mockFullName
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('User already exists');
    });
  });

  describe('loginDemo', () => {
    it('should return mock demo data', async () => {
      const result = await AuthService.loginDemo();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.access_token).toBe('demo-token-bypass');
      expect(result.data?.user.id).toBe(999);
    });
  });
});