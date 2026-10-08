import {
  computeChartSeries, computeTableData, expenseBuckets,
  historicMaintenanceSchedule, historicMaintenanceAverage,
} from './calculations';
import { createExpense } from './expense';

const cars = [{ id: 1, brand: 'Historic', make: 'Car' }, { id: 2, brand: 'Estimated', make: 'Car' }];
const entries = [
  { id: 'first', price: 300, date: '2021-01-01', notes: '' },
  { id: 'second', price: 400, date: '2022-01-01', notes: 'MOT' },
  { id: 'third', price: 500, date: '2022-07-01', notes: '' },
];
function historic(records = entries, offset = 12) {
  return { ...createExpense(), motServicePerYear: 999, maintenance: {
    mode: 'historic', firstServiceOffsetMonths: offset, entries: records,
  } };
}
function maintenanceTotal(expense, years) {
  return computeTableData([cars[0]], { 1: expense }, years).categoryRows.find((r) => r.key === 'motService').values[0];
}

test('historic charges preserve nonuniform gaps and exclude the inactive estimate', () => {
  const e = historic([...entries].reverse());
  const original = JSON.stringify(e);
  expect(historicMaintenanceSchedule(e, 3).map((r) => [r.id, r.month, r.included])).toEqual([
    ['first', 12, true], ['second', 24, true], ['third', 30, true],
  ]);
  const data = computeChartSeries([cars[0]], { 1: e }, 3).series[0].data;
  expect([data[0], data[11], data[12], data[23], data[24], data[29], data[30], data[36]])
    .toEqual([0, 0, 300, 300, 700, 700, 1200, 1200]);
  expect(maintenanceTotal(e, 3)).toBe(1200);
  expect(expenseBuckets(e).annual).toBe(0);
  expect(JSON.stringify(e)).toBe(original);
});

test('series carry each car ID and maintenance mode when cars are reordered', () => {
  const historicExpense = historic();
  const estimatedExpense = { ...createExpense(), motServicePerYear: 400 };
  const original = JSON.stringify({ historicExpense, estimatedExpense });
  const { series } = computeChartSeries(
    [cars[1], cars[0]],
    { 1: historicExpense, 2: estimatedExpense },
    2
  );

  expect(series.map(({ carId, maintenanceMode }) => [carId, maintenanceMode]))
    .toEqual([[2, 'estimated'], [1, 'historic']]);
  expect(series[0].data[24]).toBe(1200);
  expect(series[1].data[24]).toBe(700);
  expect(JSON.stringify({ historicExpense, estimatedExpense })).toBe(original);
});

test('offsets shift all records without changing original dates or gaps', () => {
  const e = historic(entries, 6);
  expect(historicMaintenanceSchedule(e, 2).map((r) => r.month)).toEqual([6, 18, 24]);
  expect(computeChartSeries([cars[0]], { 1: e }, 2).series[0].data[24]).toBe(1200);
  expect(maintenanceTotal(e, 2)).toBe(1200);
  expect(e.maintenance.entries).toEqual(entries);
});

test.each([0, 0.99, 1, 1.96, 2, 2.49, 2.5, 3])('historic endpoint equals table at duration %s', (years) => {
  const e = historic();
  const { series } = computeChartSeries([cars[0]], { 1: e }, years);
  expect(series[0].data[series[0].data.length - 1]).toBe(maintenanceTotal(e, years));
});

test('includes the rounded endpoint and retains excluded records in the schedule', () => {
  const e = historic();
  expect(maintenanceTotal(e, 2)).toBe(700);
  expect(maintenanceTotal(e, 1.96)).toBe(700); // 23.52 rounds to 24
  expect(historicMaintenanceSchedule(e, 2).map((r) => r.included)).toEqual([true, true, false]);
  expect(maintenanceTotal(historic(entries, 100), 3)).toBe(0);
  expect(historicMaintenanceSchedule(historic(entries, 100), 3)).toHaveLength(3);
});

test('empty histories stay zero and offset zero charges at ownership start', () => {
  expect(maintenanceTotal(historic([]), 3)).toBe(0);
  expect(computeChartSeries([cars[0]], { 1: historic([]) }, 3).series[0].data.every((v) => v === 0)).toBe(true);
  expect(maintenanceTotal(historic([entries[0]], 0), 0)).toBe(300);
  expect(computeChartSeries([cars[0]], { 1: historic([entries[0]], 0) }, 0).series[0].data).toEqual([300]);
});

test('same-date prices add once while IDs and original dates stay distinct', () => {
  const e = historic([{ ...entries[0], price: 100 }, { ...entries[0], id: 'duplicate-date', price: 50 }]);
  const data = computeChartSeries([cars[0]], { 1: e }, 2).series[0].data;
  expect(data[11]).toBe(0);
  expect(data[12]).toBe(150);
  expect(data[24]).toBe(150);
  expect(historicMaintenanceSchedule(e, 2).map((r) => r.id)).toEqual(['first', 'duplicate-date']);
});

test('deleting or editing the earliest date re-anchors by dates, not identities', () => {
  expect(historicMaintenanceSchedule(historic(entries.slice(1)), 3).map((r) => [r.id, r.month]))
    .toEqual([['second', 12], ['third', 18]]);
  const edited = entries.map((r) => r.id === 'third' ? { ...r, date: '2020-07-01' } : r);
  expect(historicMaintenanceSchedule(historic(edited), 4).map((r) => [r.id, r.month]))
    .toEqual([['third', 12], ['first', 18], ['second', 30]]);
});

test('month ends, leap days, and within-month dates follow calendar months', () => {
  const records = ['2024-01-31', '2024-02-01', '2024-02-29', '2025-02-28'].map((date, i) => ({ id: String(i), date, price: 10 }));
  expect(historicMaintenanceSchedule(historic(records), 3).map((r) => r.month)).toEqual([12, 13, 13, 25]);
  const data = computeChartSeries([cars[0]], { 1: historic(records) }, 3).series[0].data;
  expect(data[12]).toBe(10);
  expect(data[13]).toBe(30);
  expect(data[24]).toBe(30);
  expect(data[25]).toBe(40);
});

test('mixed modes and historic costs flow through totals and sale once', () => {
  const e = historic();
  e.taxAmount = 100;
  e.fuelMonthly = 10;
  e.endOfOwnershipValue = 200;
  const estimated = { ...createExpense(), motServicePerYear: 400 };
  const table = computeTableData(cars, { 1: e, 2: estimated }, 2);
  expect(table.categoryRows.find((r) => r.key === 'motService').values).toEqual([700, 800]);
  expect(table.totalBeforeSale).toEqual([1140, 800]);
  expect(table.finalCost).toEqual([940, 800]);
  const chart = computeChartSeries(cars, { 1: e, 2: estimated }, 2);
  expect(chart.series[0].data[24]).toBe(1240); // historic + existing annual tax and fuel timing
  expect(chart.series[1].data[24]).toBe(1200); // unchanged estimate behavior
});

test('annual observation average uses all history over at least one year', () => {
  expect(historicMaintenanceAverage(historic()).annualAverage).toBe(800);
  expect(historicMaintenanceAverage(historic()).coverageMonths).toBe(18);
  expect(historicMaintenanceAverage(historic(entries, 100))).toEqual(historicMaintenanceAverage(historic()));
  expect(historicMaintenanceAverage(historic([])).annualAverage).toBe(0);
  expect(historicMaintenanceAverage(historic([entries[0]])).annualAverage).toBe(300);
  const sameMonth = [{ ...entries[0], price: 0 }, { ...entries[0], id: 'b', date: '2021-01-31', price: 123.45 }];
  expect(historicMaintenanceAverage(historic(sameMonth))).toMatchObject({ total: 123.45, annualAverage: 123.45, coverageMonths: 12 });
});
