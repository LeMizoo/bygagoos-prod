import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';

// Mock du store
const mockUseAuthStore = jest.fn();

jest.mock('../../stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore()
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: { role: 'ADMIN' },
      isAuthenticated: true
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <div>Contenu protégé</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <div>Contenu protégé</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('should redirect to unauthorized when user lacks required role', () => {
    mockUseAuthStore.mockReturnValue({
      user: { role: 'USER' },
      isAuthenticated: true
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <div>Contenu protégé</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });
});