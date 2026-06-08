import { render, screen, fireEvent } from '@testing-library/react';
import ExpensesTab, { createExpense } from './ExpensesTab';

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
  expect(screen.getByLabelText('MOT and Service (per year)')).toBeInTheDocument();
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
