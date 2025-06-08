import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileCard from './ProfileCard';
import { vi } from 'vitest';
import { mockUseAuth, mockReactQuery } from '../../../../test-utils/CommonMocks.js';
import { useQuery } from 'react-query';

mockUseAuth();
mockReactQuery();

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

const mockUser = {
  username: 'johndoe',
  firstname: 'john',
  lastname: 'doe',
  avatar_url: 'https://example.com/avatar.jpg'
};

describe('ProfileCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user info when loaded', () => {
    useQuery.mockReturnValue({
      data: mockUser,
      isLoading: false
    });
    render(<ProfileCard />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByAltText('Profile')).toHaveAttribute('src', mockUser.avatar_url);
  });

  it('shows loading state', () => {
    useQuery.mockReturnValue({
      data: null,
      isLoading: true
    });
    render(<ProfileCard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
