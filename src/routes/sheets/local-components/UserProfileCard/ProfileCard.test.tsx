import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileCard from './ProfileCard.js';
import { vi } from 'vitest';
import { mockUseAuth, mockReactQuery } from '../../../../test-utils/CommonMocks.js';
import { useQuery } from 'react-query';
import axiosInstance from '../../../../config/axios-config.js';
import { fetchUserInfo } from './ProfileCard.js';

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

describe('fetchUserInfo', () => {
  it('fetches user info with correct API call and returns data', async () => {
    const mockData = { username: 'janedoe', firstname: 'Jane', lastname: 'Doe', avatar_url: 'https://example.com/jane.jpg' };
    const mockResponse = { data: mockData };
    const getSpy = vi.spyOn(axiosInstance, 'get').mockResolvedValueOnce(mockResponse);

    const result = await fetchUserInfo();

    expect(getSpy).toHaveBeenCalledWith('/api/v1/users/info');
    expect(result).toEqual(mockData);
  });
});
