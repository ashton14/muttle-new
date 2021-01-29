import React from 'react';
import {render, screen} from '@testing-library/react';
import App from '../../src/components/App';
import {BrowserRouter} from 'react-router-dom';

test('renders learn react link', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const linkElement = screen.getByText(/muttle/i);
  expect(linkElement).toBeInTheDocument();
});
