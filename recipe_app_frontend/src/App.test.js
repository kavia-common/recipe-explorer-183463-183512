import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app shell', () => {
  render(<App />);
  const brand = screen.getByText(/Recipe Explorer/i);
  expect(brand).toBeInTheDocument();
});
