import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';

test('renders Clear Data button', () => {
  render(<Navbar onExport={() => {}} onImport={() => {}} onClearData={() => {}} projectName="" />);
  expect(screen.getByText('Clear Data')).toBeInTheDocument();
});

test('calls onClearData when Clear Data button is clicked', () => {
  const handleClear = jest.fn();
  render(<Navbar onExport={() => {}} onImport={() => {}} onClearData={handleClear} projectName="" />);
  fireEvent.click(screen.getByText('Clear Data'));
  expect(handleClear).toHaveBeenCalledTimes(1);
});
