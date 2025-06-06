import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageElement from './ImageElement';

describe('ImageElement Component', () => {
  const defaultProps = {
    attributes: { 'data-testid': 'image-element' },
    children: <span>Child content</span>,
    element: {
      src: 'https://example.com/image.jpg',
      url: 'https://example.com/image',
      alt: 'Test image'
    }
  };

  test('renders image with correct attributes when src is provided', () => {
    render(<ImageElement {...defaultProps} />);
    
    const image = screen.getByAltText(defaultProps.element.alt);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', defaultProps.element.src);
    expect(image).toHaveAttribute('alt', defaultProps.element.alt);
    expect(image).toHaveClass('sheet-image');
    expect(image).toHaveStyle({ maxWidth: '100%', height: 'auto' });
  });
});