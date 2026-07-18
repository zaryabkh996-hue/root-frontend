// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  error?: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed',
          error: data.error || 'An error occurred',
        };
      }

      // Store token and user data (fall back to 'session-active' flag if BFF stripped it for HttpOnly cookie)
      const token = data.data?.token || 'session-active';
      localStorage.setItem('authToken', token);
      if (data.data?.user) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return {
        success: true,
        message: 'Login successful',
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error',
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }

  static async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Signup failed',
          error: result.error || 'An error occurred',
        };
      }

      // Store token and user data (fall back to 'session-active' flag if BFF stripped it for HttpOnly cookie)
      const token = result.data?.token || 'session-active';
      localStorage.setItem('authToken', token);
      if (result.data?.user) {
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }

      return {
        success: true,
        message: 'Signup successful',
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error',
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }

  static logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    localStorage.removeItem('token');

    localStorage.removeItem('oauth_user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('ourroots_progress');

    // Terminate secure HttpOnly session cookie on frontend BFF
    fetch('/backend-api/logout', { method: 'POST' }).catch(() => {});
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  static getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }
}
