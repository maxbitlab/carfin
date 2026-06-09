import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { STORAGE_KEY } from './utils/storage';

// echarts relies on canvas/layout APIs that jsdom does not implement.
jest.mock('echarts', () => ({
  init: () => ({
    setOption: jest.fn(),
    resize: jest.fn(),
    dispose: jest.fn(),
  }),
}));

beforeEach(() => {
  window.localStorage.clear();
});

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

test('shows Chart tab by default in result section', () => {
  render(<App />);
  // The General tab is active so all cars are unnamed; the chart container is
  // rendered (echarts is mocked) rather than the table totals.
  expect(screen.queryByText('Total Expense Before Sale')).not.toBeInTheDocument();
});

test('switches result tab on click', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Table'));
  expect(screen.getByText('Total Expense Before Sale')).toBeInTheDocument();
});

test('clicking export triggers a JSON download', () => {
  const createObjectURL = jest.fn(() => 'blob:url');
  const revokeObjectURL = jest.fn();
  global.URL.createObjectURL = createObjectURL;
  global.URL.revokeObjectURL = revokeObjectURL;
  const clickSpy = jest
    .spyOn(window.HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});

  render(<App />);
  fireEvent.click(screen.getByText('Export'));

  expect(createObjectURL).toHaveBeenCalledTimes(1);
  expect(clickSpy).toHaveBeenCalledTimes(1);
  clickSpy.mockRestore();
});

test('importing a valid file loads the configuration and clears old data', async () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Project Name'), {
    target: { value: 'Old Project' },
  });

  const fileInput = screen.getByLabelText('Import configuration file');
  const config = {
    projectName: 'Imported Project',
    ownershipDuration: 7,
    cars: [{ id: 1, name: 'Imported Car' }],
    expenses: { 1: { fuel: 50 } },
  };
  const file = new File([JSON.stringify(config)], 'config.json', {
    type: 'application/json',
  });

  fireEvent.change(fileInput, { target: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByText('CarFin - Imported Project')).toBeInTheDocument();
  });
  const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
  expect(stored.projectName).toBe('Imported Project');
  expect(stored.ownershipDuration).toBe(7);
});

test('importing an invalid file shows an error message', async () => {
  render(<App />);
  const fileInput = screen.getByLabelText('Import configuration file');
  const file = new File(['{not valid json'], 'bad.json', {
    type: 'application/json',
  });

  fireEvent.change(fileInput, { target: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
