import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders navbar with project name', () => {
  render(<App />);
  expect(screen.getByText('CarFin')).toBeInTheDocument();
});

test('renders export and import buttons', () => {
  render(<App />);
  expect(screen.getByText('Export')).toBeInTheDocument();
  expect(screen.getByText('Import')).toBeInTheDocument();
});

test('renders configuration section tabs', () => {
  render(<App />);
  expect(screen.getByText('General')).toBeInTheDocument();
  expect(screen.getByText('Cars')).toBeInTheDocument();
  expect(screen.getByText('Expenses')).toBeInTheDocument();
});

test('renders result section tabs', () => {
  render(<App />);
  expect(screen.getByText('Chart')).toBeInTheDocument();
  expect(screen.getByText('Table')).toBeInTheDocument();
});

test('shows General placeholder by default in configuration section', () => {
  render(<App />);
  expect(screen.getByText('General content placeholder')).toBeInTheDocument();
});

test('switches configuration tab on click', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Cars'));
  expect(screen.getByText('Cars content placeholder')).toBeInTheDocument();
});

test('shows Chart placeholder by default in result section', () => {
  render(<App />);
  expect(screen.getByText('Chart view placeholder')).toBeInTheDocument();
});

test('switches result tab on click', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Table'));
  expect(screen.getByText('Table view placeholder')).toBeInTheDocument();
});
