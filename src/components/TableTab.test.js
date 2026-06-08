import { render, screen } from '@testing-library/react';
import TableTab, { computeTableData } from './TableTab';
import { createExpense } from './ExpensesTab';

function makeCar(id, brand = 'Brand', make = 'Make') {
  return { id, brand, make };
}

test('converts monthly common expenses to annual and multiplies by ownership duration', () => {
  const expense = createExpense();
  expense.fuelMonthly = 100; // monthly -> 100 * 12 * years
  const cars = [makeCar(1)];
  const { categoryRows } = computeTableData(cars, { 1: expense }, 2);
  const fuel = categoryRows.find((r) => r.key === 'fuel');
  expect(fuel.values[0]).toBe(100 * 12 * 2);
});

test('handles period-based common expenses for year and month', () => {
  const expense = createExpense();
  expense.taxAmount = 50;
  expense.taxPeriod = 'month';
  expense.insuranceAmount = 300;
  expense.insurancePeriod = 'year';
  const { categoryRows } = computeTableData([makeCar(1)], { 1: expense }, 3);
  const tax = categoryRows.find((r) => r.key === 'tax');
  const insurance = categoryRows.find((r) => r.key === 'insurance');
  expect(tax.values[0]).toBe(50 * 12 * 3);
  expect(insurance.values[0]).toBe(300 * 3);
});

test('omits finance rows when all cars are zero in the category', () => {
  const expense = createExpense();
  const { categoryRows } = computeTableData([makeCar(1)], { 1: expense }, 1);
  expect(categoryRows.find((r) => r.key === 'cashTotal')).toBeUndefined();
  expect(categoryRows.find((r) => r.key === 'loanMonthly')).toBeUndefined();
});

test('includes a finance row when at least one car has a non-zero value', () => {
  const e1 = createExpense();
  const e2 = createExpense();
  e2.financeType = 'Loan';
  e2.loan.monthlyPayment = 200;
  const cars = [makeCar(1), makeCar(2)];
  const { categoryRows } = computeTableData(cars, { 1: e1, 2: e2 }, 2);
  const loanMonthly = categoryRows.find((r) => r.key === 'loanMonthly');
  expect(loanMonthly).toBeDefined();
  expect(loanMonthly.values[0]).toBe(0);
  expect(loanMonthly.values[1]).toBe(200 * 12 * 2);
});

test('computes total before sale as the sum of category totals', () => {
  const expense = createExpense();
  expense.fuelMonthly = 100; // 100*12*1 = 1200
  expense.motServicePerYear = 500; // 500*1 = 500
  const { totalBeforeSale } = computeTableData([makeCar(1)], { 1: expense }, 1);
  expect(totalBeforeSale[0]).toBe(1700);
});

test('final cost deducts end of ownership value and row visibility follows non-zero values', () => {
  const e1 = createExpense();
  e1.fuelMonthly = 100; // 1200 over 1 year
  e1.endOfOwnershipValue = 0;
  const noEnd = computeTableData([makeCar(1)], { 1: e1 }, 1);
  expect(noEnd.hasEndOfOwnership).toBe(false);

  const e2 = createExpense();
  e2.fuelMonthly = 100; // 1200
  e2.endOfOwnershipValue = 500;
  const withEnd = computeTableData([makeCar(1)], { 1: e2 }, 1);
  expect(withEnd.hasEndOfOwnership).toBe(true);
  expect(withEnd.finalCost[0]).toBe(1200 - 500);
});

test('renders a column per car and bold total row', () => {
  const e1 = createExpense();
  e1.fuelMonthly = 100;
  render(
    <TableTab
      cars={[makeCar(1, 'Audi', 'A4'), makeCar(2, 'BMW', '3')]}
      expenses={{ 1: e1, 2: createExpense() }}
      ownershipDuration={1}
    />
  );
  expect(screen.getByText('Audi A4')).toBeInTheDocument();
  expect(screen.getByText('BMW 3')).toBeInTheDocument();
  expect(screen.getByText('Total Expense Before Sale')).toBeInTheDocument();
});

test('does not render final cost row when no car has end of ownership value', () => {
  render(
    <TableTab cars={[makeCar(1)]} expenses={{ 1: createExpense() }} ownershipDuration={1} />
  );
  expect(screen.queryByText('Final Cost')).not.toBeInTheDocument();
});

test('renders empty state when there are no cars', () => {
  render(<TableTab cars={[]} expenses={{}} ownershipDuration={1} />);
  expect(screen.getByText('Add a car to see the cost breakdown.')).toBeInTheDocument();
});
