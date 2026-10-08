import { carLabel } from './car';
import { getMaintenance } from './expense';

// Parses a value into a finite number, returning 0 for anything non-numeric.
export function num(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

// Normalises a periodic amount to a yearly figure.
export function annualFromPeriod(amount, period) {
  return period === 'month' ? num(amount) * 12 : num(amount);
}

function calendarMonthIndex(date) {
  const [year, month] = date.split('-').map(Number);
  return year * 12 + month - 1;
}

export function ownershipHorizonMonths(ownershipDuration) {
  return Math.max(0, Math.round(num(ownershipDuration) * 12));
}

// Original dates remain date-only strings. Days determine display order, while
// relative event times use calendar-month differences, including month ends.
export function historicMaintenanceSchedule(expense, ownershipDuration) {
  const maintenance = getMaintenance(expense);
  return historicMaintenanceScheduleFromMaintenance(maintenance, ownershipDuration);
}

function historicMaintenanceScheduleFromMaintenance(maintenance, ownershipDuration) {
  if (maintenance.mode !== 'historic') return [];
  const entries = maintenance.entries;
  if (!entries.length) return [];
  const anchor = calendarMonthIndex(entries[0].date);
  const horizon = ownershipHorizonMonths(ownershipDuration);
  return entries.map((entry) => {
    const month = maintenance.firstServiceOffsetMonths + calendarMonthIndex(entry.date) - anchor;
    return { ...entry, month, included: month <= horizon };
  });
}

export function historicMaintenanceTotal(expense, ownershipDuration) {
  return historicMaintenanceTotalFromMaintenance(getMaintenance(expense), ownershipDuration);
}

function historicMaintenanceTotalFromMaintenance(maintenance, ownershipDuration) {
  return historicMaintenanceScheduleFromMaintenance(maintenance, ownershipDuration)
    .reduce((total, entry) => total + (entry.included ? entry.price : 0), 0);
}

function maintenanceTotal(expense, ownershipDuration) {
  const maintenance = getMaintenance(expense);
  return maintenance.mode === 'historic'
    ? historicMaintenanceTotalFromMaintenance(maintenance, ownershipDuration)
    : num(expense.motServicePerYear) * ownershipDuration;
}

// Informational observation average uses all saved records, independent of the
// ownership horizon/offset. A minimum year covers empty or single-date history.
export function historicMaintenanceAverage(expense) {
  const entries = getMaintenance(expense).entries;
  const firstDate = entries[0]?.date ?? null;
  const lastDate = entries[entries.length - 1]?.date ?? null;
  const coverageMonths = entries.length
    ? Math.max(12, calendarMonthIndex(lastDate) - calendarMonthIndex(firstDate))
    : 12;
  const total = entries.reduce((sum, entry) => sum + entry.price, 0);
  return { firstDate, lastDate, coverageMonths, total, annualAverage: total * 12 / coverageMonths };
}

// Common expense categories. Each returns the total expense over the whole
// ownership duration (in years) for a single car's expense object.
export const COMMON_CATEGORIES = [
  {
    key: 'tax',
    label: 'Tax',
    total: (e, years) => annualFromPeriod(e.taxAmount, e.taxPeriod) * years,
  },
  {
    key: 'insurance',
    label: 'Insurance',
    total: (e, years) => annualFromPeriod(e.insuranceAmount, e.insurancePeriod) * years,
  },
  {
    key: 'motService',
    label: 'Service & MOT',
    total: maintenanceTotal,
  },
  {
    key: 'fuel',
    label: 'Fuel',
    total: (e, years) => num(e.fuelMonthly) * 12 * years,
  },
];

// Finance expense categories. Each category only contributes a value when the
// car's selected finance type matches.
export const FINANCE_CATEGORIES = [
  {
    key: 'cashTotal',
    label: 'Cash Total Amount',
    total: (e) => (e.financeType === 'Cash' ? num(e.cash.totalAmount) : 0),
  },
  {
    key: 'loanInitial',
    label: 'Loan Initial Payment',
    total: (e) => (e.financeType === 'Loan' ? num(e.loan.initialPayment) : 0),
  },
  {
    key: 'loanMonthly',
    label: 'Loan Monthly Payment',
    total: (e, years) => (e.financeType === 'Loan' ? num(e.loan.monthlyPayment) * 12 * years : 0),
  },
  {
    key: 'loanBuyOut',
    label: 'Loan Buy Out Value',
    total: (e) => (e.financeType === 'Loan' ? num(e.loan.buyOutValue) : 0),
  },
  {
    key: 'leaseInitial',
    label: 'Lease Initial Payment',
    total: (e) => (e.financeType === 'Lease' ? num(e.lease.initialPayment) : 0),
  },
  {
    key: 'leaseMonthly',
    label: 'Lease Monthly Payment',
    total: (e, years) => (e.financeType === 'Lease' ? num(e.lease.monthlyPayment) * 12 * years : 0),
  },
];

// Builds the structured table data: a list of rows (category totals, total
// before sale, final cost) with a computed value per car.
export function computeTableData(cars, expenses, ownershipDuration) {
  const years = num(ownershipDuration);
  const carExpenses = cars.map((car) => expenses[car.id] || null);

  const buildCategoryRows = (categories) =>
    categories
      .map((cat) => ({
        key: cat.key,
        label: cat.label,
        values: carExpenses.map((e) => (e ? cat.total(e, years) : 0)),
      }))
      .filter((row) => row.values.some((v) => v !== 0));

  const commonRows = COMMON_CATEGORIES.map((cat) => ({
    key: cat.key,
    label: cat.label,
    values: carExpenses.map((e) => (e ? cat.total(e, years) : 0)),
  }));

  const financeRows = buildCategoryRows(FINANCE_CATEGORIES);

  const categoryRows = [...commonRows, ...financeRows];

  const totalBeforeSale = cars.map((_, i) =>
    categoryRows.reduce((sum, row) => sum + row.values[i], 0)
  );

  const endOfOwnershipValues = carExpenses.map((e) => (e ? num(e.endOfOwnershipValue) : 0));
  const hasEndOfOwnership = endOfOwnershipValues.some((v) => v !== 0);
  const finalCost = totalBeforeSale.map((t, i) => t - endOfOwnershipValues[i]);

  return {
    categoryRows,
    totalBeforeSale,
    finalCost,
    hasEndOfOwnership,
  };
}

// Splits a car's expense object into the three timing buckets used by the
// chart: a one-off initial cost (month 0), an annual cost (month 0, 12, 24...)
// and a recurring monthly cost (every month).
function expenseBucketsWithMaintenance(e, maintenance) {
  if (!e) {
    return { initial: 0, annual: 0, monthly: 0 };
  }

  const initial =
    (e.financeType === 'Cash' ? num(e.cash && e.cash.totalAmount) : 0) +
    (e.financeType === 'Loan' ? num(e.loan && e.loan.initialPayment) : 0) +
    (e.financeType === 'Lease' ? num(e.lease && e.lease.initialPayment) : 0);

  const annual =
    (maintenance.mode === 'estimated' ? num(e.motServicePerYear) : 0) +
    (e.taxPeriod === 'year' ? num(e.taxAmount) : 0) +
    (e.insurancePeriod === 'year' ? num(e.insuranceAmount) : 0);

  const monthly =
    num(e.fuelMonthly) +
    (e.financeType === 'Loan' ? num(e.loan && e.loan.monthlyPayment) : 0) +
    (e.financeType === 'Lease' ? num(e.lease && e.lease.monthlyPayment) : 0) +
    (e.taxPeriod === 'month' ? num(e.taxAmount) : 0) +
    (e.insurancePeriod === 'month' ? num(e.insuranceAmount) : 0);

  return { initial, annual, monthly };
}

export function expenseBuckets(e) {
  return expenseBucketsWithMaintenance(e, getMaintenance(e));
}

// Builds the chart data: an array of month indices (0..totalMonths) and one
// series per car holding the cumulative total expense at each month. Nothing is
// evaluated beyond the ownership duration.
export function computeChartSeries(cars, expenses, ownershipDuration) {
  const totalMonths = ownershipHorizonMonths(ownershipDuration);
  const months = [];
  for (let m = 0; m <= totalMonths; m += 1) {
    months.push(m);
  }

  const series = (cars || []).map((car) => {
    const expense = expenses ? expenses[car.id] : null;
    const maintenance = getMaintenance(expense);
    const { initial, annual, monthly } = expenseBucketsWithMaintenance(expense, maintenance);
    const schedule = historicMaintenanceScheduleFromMaintenance(maintenance, ownershipDuration)
      .filter((entry) => entry.included);
    let eventIndex = 0;
    let maintenanceCost = 0;
    const data = months.map((m) => {
      while (eventIndex < schedule.length && schedule[eventIndex].month <= m) {
        maintenanceCost += schedule[eventIndex].price;
        eventIndex += 1;
      }
      const annualOccurrences = Math.floor(m / 12) + 1; // months 0, 12, 24...
      const monthlyOccurrences = m; // one payment per elapsed month
      return initial + annual * annualOccurrences + monthly * monthlyOccurrences + maintenanceCost;
    });
    return { carId: car.id, maintenanceMode: maintenance.mode, name: carLabel(car), data };
  });

  return { months, series };
}
