import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { STORAGE_KEY } from './utils/storage';
import { createExpense } from './domain/expense';

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

test('invalid maintenance imports leave the current configuration and storage untouched', async () => {
  const original = {
    projectName: 'Keep this project', ownershipDuration: 2,
    cars: [{ id: 1, brand: 'Toyota', make: 'Corolla' }],
    expenses: { 1: createExpense() },
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(original));
  render(<App />);
  const invalid = { ...original, projectName: 'Invalid replacement', expenses: { 1: {
    ...createExpense(), maintenance: { mode: 'historic', firstServiceOffsetMonths: 12, entries: [
      { id: 'bad', date: '2021-02-30', price: 200 },
    ] },
  } } };
  fireEvent.change(screen.getByLabelText('Import configuration file'), { target: { files: [
    new File([JSON.stringify(invalid)], 'bad.json', { type: 'application/json' }),
  ] } });
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('maintenance.entries[0].date'));
  expect(screen.getByLabelText('Project Name')).toHaveValue(original.projectName);
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toEqual(original);
});

function savedMaintenanceState() {
  const e = createExpense();
  e.motServicePerYear = '400';
  e.maintenance = { mode: 'historic', firstServiceOffsetMonths: 6, entries: [
    { id: 'retained-id', date: '2021-01-01', price: 325, notes: 'Brake pads' },
  ] };
  return { projectName: 'History', ownershipDuration: 3, cars: [{ id: 1, brand: 'Toyota', make: 'Corolla' }], expenses: { 1: e } };
}

function openMaintenanceEditor() {
  fireEvent.click(screen.getByRole('button', { name: 'Expenses' }));
  fireEvent.click(screen.getByRole('button', { name: 'Toyota Corolla' }));
}

test('maintenance edits persist through reload and Clear Data resets them', () => {
  const state = savedMaintenanceState();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const firstRender = render(<App />);
  openMaintenanceEditor();
  expect(screen.getByLabelText('Calculation method')).toHaveValue('historic');
  expect(screen.getByLabelText('First maintenance month')).toHaveValue(6);
  expect(screen.getByText('Brake pads')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Edit record 2021-01-01, 325' }));
  fireEvent.change(screen.getByLabelText('Cost'), { target: { value: '123.45' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).expenses[1].maintenance.entries[0])
    .toEqual({ id: 'retained-id', date: '2021-01-01', price: 123.45, notes: 'Brake pads' });
  firstRender.unmount();
  render(<App />);
  openMaintenanceEditor();
  expect(screen.getByRole('button', { name: 'Edit record 2021-01-01, 123.45' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Calculation method'), { target: { value: 'estimated' } });
  expect(screen.getByLabelText('Annual maintenance estimate')).toHaveValue(400);
  fireEvent.change(screen.getByLabelText('Calculation method'), { target: { value: 'historic' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add record' }));
  fireEvent.change(screen.getByLabelText('Cost'), { target: { value: '999' } });
  fireEvent.click(screen.getByRole('button', { name: 'Clear Data' }));
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).expenses).toEqual({});
  expect(screen.queryByLabelText('Cost')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Unnamed Car' }));
  fireEvent.change(screen.getByLabelText('Calculation method'), { target: { value: 'historic' } });
  expect(screen.getByLabelText('First maintenance month')).toHaveValue(12);
  expect(screen.getByText('No maintenance records.')).toBeInTheDocument();
});

test('valid historic import restores all fields into the editor and stored configuration', async () => {
  render(<App />);
  const state = savedMaintenanceState();
  fireEvent.change(screen.getByLabelText('Import configuration file'), { target: { files: [
    new File([JSON.stringify(state)], 'history.json', { type: 'application/json' }),
  ] } });
  await waitFor(() => expect(screen.getByText('CarFin - History')).toBeInTheDocument());
  openMaintenanceEditor();
  expect(screen.getByLabelText('First maintenance month')).toHaveValue(6);
  expect(screen.getByText('Brake pads')).toBeInTheDocument();
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toEqual(state);
});

test('successful import clears an open edit draft even when an imported record has the same ID', async () => {
  const current = savedMaintenanceState();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  render(<App />);
  openMaintenanceEditor();
  fireEvent.click(screen.getByRole('button', { name: 'Edit record 2021-01-01, 325' }));
  fireEvent.change(screen.getByLabelText('Cost'), { target: { value: '999' } });
  fireEvent.change(screen.getByLabelText('Maintenance date'), { target: { value: '2020-01-01' } });

  const imported = savedMaintenanceState();
  imported.projectName = 'Replacement History';
  imported.expenses[1].maintenance.entries = [
    { id: 'retained-id', date: '2021-01-01', price: 777, notes: 'Imported record' },
  ];
  fireEvent.change(screen.getByLabelText('Import configuration file'), { target: { files: [
    new File([JSON.stringify(imported)], 'replacement.json', { type: 'application/json' }),
  ] } });

  await waitFor(() => expect(screen.getByText('CarFin - Replacement History')).toBeInTheDocument());
  expect(screen.queryByLabelText('Cost')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Toyota Corolla' }));
  expect(screen.getByText('Imported record')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Edit record 2021-01-01, 777' }));
  expect(screen.getByLabelText('Cost')).toHaveValue(777);
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toEqual(imported);
});

test('successful import clears an open new-record draft and preserves imported history', async () => {
  const current = savedMaintenanceState();
  current.expenses[1].maintenance.entries = [];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  render(<App />);
  openMaintenanceEditor();
  fireEvent.click(screen.getByRole('button', { name: 'Add record' }));
  fireEvent.change(screen.getByLabelText('Cost'), { target: { value: '999' } });
  fireEvent.change(screen.getByLabelText('Maintenance date'), { target: { value: '2020-01-01' } });

  const imported = savedMaintenanceState();
  imported.projectName = 'Imported While Drafting';
  imported.expenses[1].maintenance.entries = [
    { id: 'imported-id', date: '2022-02-02', price: 222, notes: 'Saved history' },
  ];
  fireEvent.change(screen.getByLabelText('Import configuration file'), { target: { files: [
    new File([JSON.stringify(imported)], 'replacement.json', { type: 'application/json' }),
  ] } });

  await waitFor(() => expect(screen.getByText('CarFin - Imported While Drafting')).toBeInTheDocument());
  expect(screen.queryByLabelText('Cost')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Toyota Corolla' }));
  expect(screen.getByText('Saved history')).toBeInTheDocument();
  expect(screen.queryByText('2020-01-01')).not.toBeInTheDocument();
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toEqual(imported);
});

test('invalid import leaves an open edit draft and saved configuration unchanged', async () => {
  const current = savedMaintenanceState();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  render(<App />);
  openMaintenanceEditor();
  fireEvent.click(screen.getByRole('button', { name: 'Edit record 2021-01-01, 325' }));
  fireEvent.change(screen.getByLabelText('Cost'), { target: { value: '999' } });

  const invalid = savedMaintenanceState();
  invalid.projectName = 'Invalid replacement';
  invalid.expenses[1].maintenance.entries[0].date = '2021-02-30';
  fireEvent.change(screen.getByLabelText('Import configuration file'), { target: { files: [
    new File([JSON.stringify(invalid)], 'invalid.json', { type: 'application/json' }),
  ] } });

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('maintenance.entries[0].date'));
  expect(screen.getByLabelText('Cost')).toHaveValue(999);
  expect(screen.getAllByText('Brake pads')).toHaveLength(2);
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toEqual(current);
});

test.each([undefined, { mode: 'historic', firstServiceOffsetMonths: -1, entries: [] }])('legacy or malformed local maintenance safely retains the annual estimate', (maintenance) => {
  const state = savedMaintenanceState();
  if (maintenance === undefined) delete state.expenses[1].maintenance;
  else state.expenses[1].maintenance = maintenance;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render(<App />);
  openMaintenanceEditor();
  expect(screen.getByLabelText('Calculation method')).toHaveValue('estimated');
  expect(screen.getByLabelText('Annual maintenance estimate')).toHaveValue(400);
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).expenses[1].maintenance).toEqual(maintenance);
});
