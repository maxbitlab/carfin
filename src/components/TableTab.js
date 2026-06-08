import React from 'react';

function num(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function annualFromPeriod(amount, period) {
  return period === 'month' ? num(amount) * 12 : num(amount);
}

// Common expense categories. Each returns the total expense over the whole
// ownership duration (in years) for a single car's expense object.
const COMMON_CATEGORIES = [
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
    label: 'MOT and Service',
    total: (e, years) => num(e.motServicePerYear) * years,
  },
  {
    key: 'fuel',
    label: 'Fuel',
    total: (e, years) => num(e.fuelMonthly) * 12 * years,
  },
];

// Finance expense categories. Each category only contributes a value when the
// car's selected finance type matches.
const FINANCE_CATEGORIES = [
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

function carLabel(car) {
  const parts = [car.brand, car.make].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Unnamed Car';
}

// Builds the structured table data: a list of rows (category totals, total
// before sale, final cost) with a computed value per car.
function computeTableData(cars, expenses, ownershipDuration) {
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

function formatValue(value) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function TableTab({ cars, expenses, ownershipDuration }) {
  if (!cars || cars.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#3c6e71]">
        <p>Add a car to see the cost breakdown.</p>
      </div>
    );
  }

  const { categoryRows, totalBeforeSale, finalCost, hasEndOfOwnership } = computeTableData(
    cars,
    expenses,
    ownershipDuration
  );

  const cellClass = 'px-4 py-2 border border-[#3c6e71] text-right';
  const headClass = 'px-4 py-2 border border-[#3c6e71] text-left';

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-white">
        <thead>
          <tr>
            <th className={headClass}>Expense</th>
            {cars.map((car) => (
              <th key={car.id} className={`${headClass} text-right`}>
                {carLabel(car)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categoryRows.map((row) => (
            <tr key={row.key}>
              <td className={headClass}>{row.label}</td>
              {row.values.map((value, i) => (
                <td key={cars[i].id} className={cellClass}>
                  {formatValue(value)}
                </td>
              ))}
            </tr>
          ))}
          <tr className="font-bold">
            <td className={headClass}>Total Expense Before Sale</td>
            {totalBeforeSale.map((value, i) => (
              <td key={cars[i].id} className={cellClass}>
                {formatValue(value)}
              </td>
            ))}
          </tr>
          {hasEndOfOwnership && (
            <tr className="font-bold">
              <td className={headClass}>Final Cost</td>
              {finalCost.map((value, i) => (
                <td key={cars[i].id} className={cellClass}>
                  {formatValue(value)}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export { computeTableData, COMMON_CATEGORIES, FINANCE_CATEGORIES };
export default TableTab;
