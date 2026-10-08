import { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpensesTab from './ExpensesTab';
import { createExpense } from '../../domain/expense';

const cars = [
  { id: 1, brand: 'Toyota', make: 'Corolla' },
  { id: 2, brand: '', make: '' },
];

test('createExpense initializes all values to 0 with Cash finance', () => {
  const e = createExpense();
  expect(e.taxAmount).toBe(0);
  expect(e.insuranceAmount).toBe(0);
  expect(e.motServicePerYear).toBe(0);
  expect(e.fuelMonthly).toBe(0);
  expect(e.financeType).toBe('Cash');
  expect(e.cash.totalAmount).toBe(0);
  expect(e.loan.initialPayment).toBe(0);
  expect(e.loan.monthlyPayment).toBe(0);
  expect(e.loan.duration).toBe(0);
  expect(e.loan.buyOutValue).toBe(0);
  expect(e.lease.initialPayment).toBe(0);
  expect(e.lease.monthlyPayment).toBe(0);
  expect(e.lease.duration).toBe(0);
  expect(e.endOfOwnershipValue).toBe(0);
  expect(e.maintenance).toEqual({ mode: 'estimated', firstServiceOffsetMonths: 12, entries: [] });
});

test('lists cars from the cars tab', () => {
  render(<ExpensesTab cars={cars} expenses={{}} onExpensesChange={() => {}} />);
  expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
  expect(screen.getByText('Unnamed Car')).toBeInTheDocument();
});

test('shows placeholder when no car selected', () => {
  render(<ExpensesTab cars={cars} expenses={{}} onExpensesChange={() => {}} />);
  expect(screen.getByText('Select a car to edit its expenses.')).toBeInTheDocument();
});

test('initializes an expense when a car is selected', () => {
  const handleChange = jest.fn();
  render(<ExpensesTab cars={cars} expenses={{}} onExpensesChange={handleChange} />);
  fireEvent.click(screen.getByText('Toyota Corolla'));
  expect(handleChange).toHaveBeenCalledWith({ 1: createExpense() });
});

test('renders expense parameters for a selected car', () => {
  const expenses = { 1: createExpense() };
  render(<ExpensesTab cars={cars} expenses={expenses} onExpensesChange={() => {}} />);
  fireEvent.click(screen.getByText('Toyota Corolla'));
  expect(screen.getByLabelText('Tax')).toBeInTheDocument();
  expect(screen.getByLabelText('Insurance')).toBeInTheDocument();
  expect(screen.getByLabelText('Annual maintenance estimate')).toBeInTheDocument();
  expect(screen.getByLabelText('Fuel (monthly)')).toBeInTheDocument();
  expect(screen.getByLabelText('Finance Type')).toBeInTheDocument();
  expect(screen.getByLabelText('End of Ownership Value')).toBeInTheDocument();
});

test('shows Cash total amount by default', () => {
  const expenses = { 1: createExpense() };
  render(<ExpensesTab cars={cars} expenses={expenses} onExpensesChange={() => {}} />);
  fireEvent.click(screen.getByText('Toyota Corolla'));
  expect(screen.getByLabelText('Total Amount')).toBeInTheDocument();
});

test('switching finance to Loan shows loan parameters', () => {
  const handleChange = jest.fn();
  const expenses = { 1: createExpense() };
  render(<ExpensesTab cars={cars} expenses={expenses} onExpensesChange={handleChange} />);
  fireEvent.click(screen.getByText('Toyota Corolla'));
  fireEvent.change(screen.getByLabelText('Finance Type'), { target: { value: 'Loan' } });
  expect(handleChange).toHaveBeenCalledWith({ 1: { ...createExpense(), financeType: 'Loan' } });
});

test('renders loan parameters when finance type is Loan', () => {
  const expenses = { 1: { ...createExpense(), financeType: 'Loan' } };
  render(<ExpensesTab cars={cars} expenses={expenses} onExpensesChange={() => {}} />);
  fireEvent.click(screen.getByText('Toyota Corolla'));
  expect(screen.getByLabelText('Initial Payment')).toBeInTheDocument();
  expect(screen.getByLabelText('Monthly Payment')).toBeInTheDocument();
  expect(screen.getByLabelText('Duration (months)')).toBeInTheDocument();
  expect(screen.getByLabelText('Buy Out Option Value')).toBeInTheDocument();
});

test('renders lease parameters when finance type is Lease', () => {
  const expenses = { 1: { ...createExpense(), financeType: 'Lease' } };
  render(<ExpensesTab cars={cars} expenses={expenses} onExpensesChange={() => {}} />);
  fireEvent.click(screen.getByText('Toyota Corolla'));
  expect(screen.getByLabelText('Initial Payment')).toBeInTheDocument();
  expect(screen.getByLabelText('Monthly Payment')).toBeInTheDocument();
  expect(screen.getByLabelText('Duration (months)')).toBeInTheDocument();
  expect(screen.queryByLabelText('Buy Out Option Value')).not.toBeInTheDocument();
});

test('editing a common expense calls onExpensesChange', () => {
  const handleChange = jest.fn();
  const expenses = { 1: createExpense() };
  render(<ExpensesTab cars={cars} expenses={expenses} onExpensesChange={handleChange} />);
  fireEvent.click(screen.getByText('Toyota Corolla'));
  fireEvent.change(screen.getByLabelText('Tax'), { target: { value: '120' } });
  expect(handleChange).toHaveBeenCalledWith({ 1: { ...createExpense(), taxAmount: '120' } });
});

function StatefulExpenses({ initialExpenses = { 1: createExpense(), 2: createExpense() }, onUpdate = () => {} }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  return <ExpensesTab cars={cars} expenses={expenses} onExpensesChange={(updated) => { setExpenses(updated); onUpdate(updated); }} />;
}

function selectHistoric() {
  fireEvent.click(screen.getByRole('button', { name: 'Toyota Corolla' }));
  fireEvent.change(screen.getByLabelText('Calculation method'), { target: { value: 'historic' } });
}

function addEntry(price, date, notes = '') {
  fireEvent.click(screen.getByRole('button', { name: 'Add record' }));
  fireEvent.change(screen.getByLabelText('Cost'), { target: { value: price } });
  fireEvent.change(screen.getByLabelText('Maintenance date'), { target: { value: date } });
  fireEvent.change(screen.getByLabelText('Notes (optional)'), { target: { value: notes } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
}

test('relocates the estimate into one Maintenance section and preserves legacy values', () => {
  const legacy = { ...createExpense(), motServicePerYear: '400' };
  delete legacy.maintenance;
  render(<StatefulExpenses initialExpenses={{ 1: legacy }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Toyota Corolla' }));
  expect(screen.getByLabelText('Calculation method')).toHaveValue('estimated');
  expect(within(screen.getByRole('group', { name: 'Common' })).queryByLabelText('Annual maintenance estimate')).not.toBeInTheDocument();
  expect(within(screen.getByRole('group', { name: 'Maintenance' })).getByLabelText('Annual maintenance estimate')).toHaveValue(400);
  expect(screen.getByRole('option', { name: 'Annual estimate' })).toHaveValue('estimated');
  expect(screen.getByRole('option', { name: 'Recorded costs' })).toHaveValue('historic');
  fireEvent.change(screen.getByLabelText('Calculation method'), { target: { value: 'historic' } });
  expect(screen.getByLabelText('First maintenance month')).toHaveValue(12);
  expect(screen.getByText('No maintenance records.')).toBeInTheDocument();
  expect(screen.getByText('How scheduling works')).toBeInTheDocument();
});

test('complete add/edit/cancel/delete flow updates committed values and the observation average', () => {
  const onUpdate = jest.fn();
  render(<StatefulExpenses onUpdate={onUpdate} />);
  selectHistoric();
  addEntry('300', '2021-01-01');
  const saved = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0][1].maintenance.entries[0];
  expect(saved).toMatchObject({ price: 300, date: '2021-01-01', notes: '' });
  expect(typeof saved.id).toBe('string');
  expect(screen.getByText(/Annualized history average/)).toHaveTextContent('300');
  expect(screen.getByText('Uses all maintenance records over at least 12 months. Informational only; totals use scheduled costs.')).toBeInTheDocument();
  expect(screen.getByText('Averaging span: 12 months (2021-01-01 to 2021-01-01)')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Edit record 2021-01-01, 300' }));
  fireEvent.change(screen.getByLabelText('Cost'), { target: { value: '325' } });
  fireEvent.change(screen.getByLabelText('Maintenance date'), { target: { value: '2020-12-31' } });
  fireEvent.change(screen.getByLabelText('Notes (optional)'), { target: { value: 'Brake pads <checked>' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0][1].maintenance.entries[0])
    .toEqual({ ...saved, price: 325, date: '2020-12-31', notes: 'Brake pads <checked>' });
  expect(screen.getByText('Brake pads <checked>')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Edit record 2020-12-31, 325' }));
  fireEvent.change(screen.getByLabelText('Cost'), { target: { value: '999' } });
  const count = onUpdate.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onUpdate).toHaveBeenCalledTimes(count);
  expect(screen.getByText(/Annualized history average/)).toHaveTextContent('325');
  fireEvent.click(screen.getByRole('button', { name: 'Delete record 2020-12-31, 325' }));
  expect(screen.getByText('No maintenance records.')).toBeInTheDocument();
  expect(screen.getByText(/Annualized history average/)).toHaveTextContent('0');
});

test('sorts by date and retains stable IDs after edits while allowing shared dates and decimal/zero prices', () => {
  const onUpdate = jest.fn();
  render(<StatefulExpenses onUpdate={onUpdate} />);
  selectHistoric();
  addEntry('123.45', '2022-07-01');
  addEntry('0', '2021-01-01');
  addEntry('50', '2021-01-01');
  const records = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0][1].maintenance.entries;
  expect(records.map((r) => r.date)).toEqual(['2021-01-01', '2021-01-01', '2022-07-01']);
  expect(new Set(records.map((r) => r.id)).size).toBe(3);
  const id = records[2].id;
  fireEvent.click(screen.getByRole('button', { name: 'Edit record 2022-07-01, 123.45' }));
  fireEvent.change(screen.getByLabelText('Maintenance date'), { target: { value: '2020-01-01' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0][1].maintenance.entries[0].id).toBe(id);
  const buttons = screen.getAllByRole('button', { name: /^Edit record/ });
  expect(buttons[0]).toHaveAccessibleName('Edit record 2020-01-01, 123.45');
});

test('invalid new and edited entries show associated errors without committing drafts', () => {
  const onUpdate = jest.fn();
  render(<StatefulExpenses onUpdate={onUpdate} />);
  selectHistoric();
  fireEvent.click(screen.getByRole('button', { name: 'Add record' }));
  const count = onUpdate.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByLabelText('Cost')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText('Cost')).toHaveAccessibleDescription('Enter a cost of 0 or more.');
  expect(screen.getByLabelText('Maintenance date')).toHaveAccessibleDescription('Enter a valid maintenance date.');
  for (const price of ['-1', 'Infinity', 'NaN']) {
    fireEvent.change(screen.getByLabelText('Cost'), { target: { value: price } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  }
  expect(onUpdate).toHaveBeenCalledTimes(count);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  addEntry('300', '2021-01-01');
  fireEvent.click(screen.getByRole('button', { name: 'Edit record 2021-01-01, 300' }));
  fireEvent.change(screen.getByLabelText('Maintenance date'), { target: { value: '2021-02-30' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByLabelText('Maintenance date')).toHaveAttribute('aria-invalid', 'true');
  expect(onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0][1].maintenance.entries[0].date).toBe('2021-01-01');
});

test('mode switches retain both data sets and offsets reject invalid drafts', () => {
  const onUpdate = jest.fn();
  render(<StatefulExpenses onUpdate={onUpdate} />);
  fireEvent.click(screen.getByRole('button', { name: 'Toyota Corolla' }));
  fireEvent.change(screen.getByLabelText('Annual maintenance estimate'), { target: { value: '400' } });
  fireEvent.change(screen.getByLabelText('Calculation method'), { target: { value: 'historic' } });
  addEntry('300', '2021-01-01');
  fireEvent.change(screen.getByLabelText('First maintenance month'), { target: { value: '0' } });
  const count = onUpdate.mock.calls.length;
  for (const offset of ['', '-1', '1.5', 'Infinity']) {
    fireEvent.change(screen.getByLabelText('First maintenance month'), { target: { value: offset } });
    expect(screen.getByLabelText('First maintenance month')).toHaveAttribute('aria-invalid', 'true');
  }
  expect(screen.getByLabelText('First maintenance month')).toHaveAccessibleDescription('Months after ownership starts. 0 means immediately. Enter a whole number of months, 0 or more.');
  expect(onUpdate).toHaveBeenCalledTimes(count);
  fireEvent.change(screen.getByLabelText('Calculation method'), { target: { value: 'estimated' } });
  expect(screen.getByLabelText('Annual maintenance estimate')).toHaveValue(400);
  fireEvent.change(screen.getByLabelText('Calculation method'), { target: { value: 'historic' } });
  expect(screen.getByLabelText('First maintenance month')).toHaveValue(0);
  expect(screen.getByRole('button', { name: 'Edit record 2021-01-01, 300' })).toBeInTheDocument();
});

test('drafts reset on car selection and committed histories and offsets remain isolated', () => {
  const onUpdate = jest.fn();
  render(<StatefulExpenses onUpdate={onUpdate} />);
  selectHistoric();
  addEntry('300', '2021-01-01');
  fireEvent.change(screen.getByLabelText('First maintenance month'), { target: { value: '6' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add record' }));
  fireEvent.change(screen.getByLabelText('Cost'), { target: { value: '999' } });
  fireEvent.click(screen.getByRole('button', { name: 'Unnamed Car' }));
  expect(screen.queryByLabelText('Cost')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Calculation method')).toHaveValue('estimated');
  fireEvent.change(screen.getByLabelText('Calculation method'), { target: { value: 'historic' } });
  expect(screen.getByLabelText('First maintenance month')).toHaveValue(12);
  expect(screen.getByText('No maintenance records.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Toyota Corolla' }));
  expect(screen.getByLabelText('First maintenance month')).toHaveValue(6);
  expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  const state = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
  expect(state[1].maintenance.entries).toHaveLength(1);
  expect(state[2].maintenance.entries).toHaveLength(0);
});

test('ordinary expense edits retain the selected car and an open maintenance draft', () => {
  render(<StatefulExpenses />);
  selectHistoric();
  fireEvent.click(screen.getByRole('button', { name: 'Add record' }));
  fireEvent.change(screen.getByLabelText('Cost'), { target: { value: '999' } });
  fireEvent.change(screen.getByLabelText('Tax'), { target: { value: '50' } });

  expect(screen.getByRole('button', { name: 'Toyota Corolla' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByLabelText('Cost')).toHaveValue(999);
  expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
});

test('new controls are keyboard reachable and selection activates with Enter', () => {
  render(<StatefulExpenses />);
  userEvent.tab();
  expect(screen.getByRole('button', { name: 'Toyota Corolla' })).toHaveFocus();
  userEvent.keyboard('{Enter}');
  expect(screen.getByLabelText('Calculation method')).toBeInTheDocument();
  screen.getByLabelText('Calculation method').focus();
  userEvent.selectOptions(screen.getByLabelText('Calculation method'), 'historic');
  userEvent.tab();
  expect(screen.getByLabelText('First maintenance month')).toHaveFocus();
  userEvent.tab();
  expect(screen.getByRole('button', { name: 'Add record' })).toHaveFocus();
  userEvent.keyboard('{Enter}');
  expect(screen.getByLabelText('Cost')).toHaveFocus();
  userEvent.tab();
  expect(screen.getByLabelText('Maintenance date')).toHaveFocus();
  userEvent.tab();
  expect(screen.getByLabelText('Notes (optional)')).toHaveFocus();
  userEvent.tab();
  expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
  userEvent.tab();
  userEvent.keyboard('{Enter}');
  expect(screen.getByRole('button', { name: 'Add record' })).toHaveFocus();
});
