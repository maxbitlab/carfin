import { render, screen, fireEvent } from '@testing-library/react';
import GeneralTab from './GeneralTab';

test('renders project name and ownership duration fields', () => {
  render(<GeneralTab projectName="" onProjectNameChange={() => {}} ownershipDuration={1} onOwnershipDurationChange={() => {}} />);
  expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
  expect(screen.getByLabelText('Ownership Duration (years)')).toBeInTheDocument();
});

test('displays provided project name value', () => {
  render(<GeneralTab projectName="My Car" onProjectNameChange={() => {}} ownershipDuration={1} onOwnershipDurationChange={() => {}} />);
  expect(screen.getByLabelText('Project Name').value).toBe('My Car');
});

test('calls onProjectNameChange when typing', () => {
  const handleChange = jest.fn();
  render(<GeneralTab projectName="" onProjectNameChange={handleChange} ownershipDuration={1} onOwnershipDurationChange={() => {}} />);
  fireEvent.change(screen.getByLabelText('Project Name'), { target: { value: 'New' } });
  expect(handleChange).toHaveBeenCalledWith('New');
});

test('displays provided ownership duration value', () => {
  render(<GeneralTab projectName="" onProjectNameChange={() => {}} ownershipDuration={3} onOwnershipDurationChange={() => {}} />);
  expect(screen.getByLabelText('Ownership Duration (years)').value).toBe('3');
});

test('calls onOwnershipDurationChange when changing duration', () => {
  const handleChange = jest.fn();
  render(<GeneralTab projectName="" onProjectNameChange={() => {}} ownershipDuration={1} onOwnershipDurationChange={handleChange} />);
  fireEvent.change(screen.getByLabelText('Ownership Duration (years)'), { target: { value: '5' } });
  expect(handleChange).toHaveBeenCalledWith(5);
});

test('enforces minimum ownership duration of 1', () => {
  const handleChange = jest.fn();
  render(<GeneralTab projectName="" onProjectNameChange={() => {}} ownershipDuration={1} onOwnershipDurationChange={handleChange} />);
  fireEvent.change(screen.getByLabelText('Ownership Duration (years)'), { target: { value: '0' } });
  expect(handleChange).toHaveBeenCalledWith(1);
});

test('shows placeholder text in project name input', () => {
  render(<GeneralTab projectName="" onProjectNameChange={() => {}} ownershipDuration={1} onOwnershipDurationChange={() => {}} />);
  expect(screen.getByPlaceholderText('Enter project name')).toBeInTheDocument();
});
