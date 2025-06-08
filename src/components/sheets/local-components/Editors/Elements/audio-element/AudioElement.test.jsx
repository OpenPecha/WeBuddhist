import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioElement from './AudioElement';

describe('AudioElement Component', () => {
  const defaultProps = {
    attributes: { 'data-testid': 'audio-element' },
    children: <span>Child content</span>,
    element: {
      src: 'https://example.com/audio-embed',
      url: 'https://example.com/audio'
    }
  };

  test('renders audio iframe when src is provided', () => {
    render(<AudioElement {...defaultProps} />);
    
    const iframe = screen.getByTitle('Audio Player');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', defaultProps.element.src);
    expect(iframe).toHaveAttribute('width', '100%');
    expect(iframe).toHaveAttribute('height', '166');
  });

  test('renders audio link when src is not provided', () => {
    const propsWithoutSrc = {
      ...defaultProps,
      element: {
        url: 'https://example.com/audio'
      }
    };

    render(<AudioElement {...propsWithoutSrc} />);
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', propsWithoutSrc.element.url);
    expect(link).toHaveTextContent(propsWithoutSrc.element.url);
  });

  test('displays error message when error is present', () => {
    const propsWithError = {
      ...defaultProps,
      element: {
        url: 'https://example.com/audio',
        error: 'Invalid audio URL'
      }
    };

    render(<AudioElement {...propsWithError} />);
    
    const errorMessage = screen.getByText(/Error: Invalid audio URL/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

});