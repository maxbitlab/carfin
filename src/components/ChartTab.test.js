import { render, screen } from '@testing-library/react';
import ChartTab, { computeChartSeries, expenseBuckets } from './ChartTab';
import { createExpense } from './ExpensesTab';

// echarts relies on canvas/layout APIs that jsdom does not implement, so we
// mock it for the rendering tests. The pure computation functions are tested
// directly without involving echarts.
jest.mock('echarts', () => ({
  init: () => ({
    setOption: jest.fn(),
    resize: jest.fn(),
    dispose: jest.fn(),
  }),
}));

function makeCar(id, brand = 'Brand', make = 'Make') {
  return { id, brand, make };
}

describe('expenseBuckets', () => {
  it('returns zeros for a missing expense', () => {
    expect(expenseBuckets(null)).toEqual({ initial: 0, annual: 0, monthly: 0 });
  });

  it('splits expenses into initial, annual and monthly buckets', () => {
    const e = createExpense();
    e.financeType = 'Loan';
    e.loan.initialPayment = 1000;
    e.loan.monthlyPayment = 200;
    e.motServicePerYear = 500;
    e.taxAmount = 50;
    e.taxPeriod = 'month';
    e.insuranceAmount = 300;
    e.insurancePeriod = 'year';
    e.fuelMonthly = 100;

    const buckets = expenseBuckets(e);
    expect(buckets.initial).toBe(1000);
    expect(buckets.annual).toBe(500 + 300);
    expect(buckets.monthly).toBe(100 + 200 + 50);
  });
});

describe('computeChartSeries', () => {
  it('creates one month entry per month including month 0', () => {
    const { months } = computeChartSeries([makeCar(1)], {}, 2);
    expect(months).toHaveLength(25); // 0..24
    expect(months[0]).toBe(0);
    expect(months[24]).toBe(24);
  });

  it('does not evaluate beyond the ownership duration', () => {
    const { months } = computeChartSeries([makeCar(1)], {}, 1);
    expect(months[months.length - 1]).toBe(12);
  });

  it('adds the initial expense at month 0', () => {
    const e = createExpense();
    e.financeType = 'Cash';
    e.cash.totalAmount = 5000;
    const { series } = computeChartSeries([makeCar(1)], { 1: e }, 1);
    expect(series[0].data[0]).toBe(5000);
  });

  it('adds annual expense at month 0 and every 12 months', () => {
    const e = createExpense();
    e.motServicePerYear = 400; // annual only
    const { series } = computeChartSeries([makeCar(1)], { 1: e }, 2);
    const data = series[0].data;
    expect(data[0]).toBe(400); // month 0 -> 1 occurrence
    expect(data[11]).toBe(400); // before month 12 -> still 1
    expect(data[12]).toBe(800); // month 12 -> 2 occurrences
    expect(data[24]).toBe(1200); // month 24 -> 3 occurrences
  });

  it('adds monthly expense every month and accumulates', () => {
    const e = createExpense();
    e.fuelMonthly = 100; // monthly only
    const { series } = computeChartSeries([makeCar(1)], { 1: e }, 1);
    const data = series[0].data;
    expect(data[0]).toBe(0); // no monthly payment yet at month 0
    expect(data[1]).toBe(100);
    expect(data[12]).toBe(1200);
  });

  it('produces a series for each car', () => {
    const { series } = computeChartSeries(
      [makeCar(1, 'Audi', 'A4'), makeCar(2, 'BMW', '3')],
      {},
      1
    );
    expect(series).toHaveLength(2);
    expect(series[0].name).toBe('Audi A4');
    expect(series[1].name).toBe('BMW 3');
  });

  it('combines initial, annual and monthly costs cumulatively', () => {
    const e = createExpense();
    e.financeType = 'Cash';
    e.cash.totalAmount = 1000; // initial
    e.motServicePerYear = 120; // annual
    e.fuelMonthly = 10; // monthly
    const { series } = computeChartSeries([makeCar(1)], { 1: e }, 1);
    const data = series[0].data;
    expect(data[0]).toBe(1000 + 120); // initial + 1 annual
    expect(data[12]).toBe(1000 + 120 * 2 + 10 * 12);
  });
});

describe('ChartTab rendering', () => {
  it('renders the empty state when there are no cars', () => {
    render(<ChartTab cars={[]} expenses={{}} ownershipDuration={1} />);
    expect(screen.getByText('Add a car to see the cost chart.')).toBeInTheDocument();
  });

  it('renders a chart container when cars are present', () => {
    const { container } = render(
      <ChartTab cars={[makeCar(1)]} expenses={{ 1: createExpense() }} ownershipDuration={1} />
    );
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});
