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

test('shows General tab form by default in configuration section', () => {
  render(<App />);
  expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
  expect(screen.getByLabelText('Ownership Duration (years)')).toBeInTheDocument();
});

test('typing project name updates navbar title', () => {
  render(<App />);
  const input = screen.getByLabelText('Project Name');
  fireEvent.change(input, { target: { value: 'My Project' } });
  expect(screen.getByText('CarFin - My Project')).toBeInTheDocument();
});

test('typing project name updates document title', () => {
  render(<App />);
  const input = screen.getByLabelText('Project Name');
  fireEvent.change(input, { target: { value: 'Test' } });
  expect(document.title).toBe('CarFin - Test');
});

test('empty project name shows plain CarFin in navbar and title', () => {
  render(<App />);
  expect(screen.getByText('CarFin')).toBeInTheDocument();
  expect(document.title).toBe('CarFin');
});

test('ownership duration defaults to 1 and can be changed', () => {
  render(<App />);
  const input = screen.getByLabelText('Ownership Duration (years)');
  expect(input.value).toBe('1');
  fireEvent.change(input, { target: { value: '5' } });
  expect(input.value).toBe('5');
});

test('switches configuration tab on click', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Cars'));
  expect(screen.getByLabelText('Add car')).toBeInTheDocument();
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
