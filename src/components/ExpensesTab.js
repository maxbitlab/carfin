import React, { useState } from 'react';

const PERIODS = ['year', 'month'];
const FINANCE_TYPES = ['Cash', 'Loan', 'Lease'];

function createExpense() {
  return {
    taxAmount: 0,
    taxPeriod: 'year',
    insuranceAmount: 0,
    insurancePeriod: 'year',
    motServicePerYear: 0,
    fuelMonthly: 0,
    financeType: 'Cash',
    cash: {
      totalAmount: 0,
    },
    loan: {
      initialPayment: 0,
      monthlyPayment: 0,
      duration: 0,
      buyOutValue: 0,
    },
    lease: {
      initialPayment: 0,
      monthlyPayment: 0,
      duration: 0,
    },
    endOfOwnershipValue: 0,
  };
}

const inputClass =
  'w-full px-3 py-2 rounded bg-[#353535] border border-[#3c6e71] text-white focus:outline-none focus:ring-1 focus:ring-[#3c6e71]';

function ExpenseForm({ expense, onChange }) {
  if (!expense) {
    return (
      <div className="flex items-center justify-center h-full text-[#3c6e71]">
        <p>Select a car to edit its expenses.</p>
      </div>
    );
  }

  const field = (id, label, content) => (
    <div key={id}>
      <label htmlFor={id} className="block mb-1 font-medium">{label}</label>
      {content}
    </div>
  );

  const numberInput = (id, label, key) =>
    field(id, label,
      <input
        id={id}
        type="number"
        min={0}
        value={expense[key]}
        onChange={(e) => onChange({ ...expense, [key]: e.target.value })}
        className={inputClass}
      />
    );

  const nestedNumberInput = (id, label, group, key) =>
    field(id, label,
      <input
        id={id}
        type="number"
        min={0}
        value={expense[group][key]}
        onChange={(e) => onChange({ ...expense, [group]: { ...expense[group], [key]: e.target.value } })}
        className={inputClass}
      />
    );

  const periodSelect = (id, label, key) =>
    field(id, label,
      <select
        id={id}
        value={expense[key]}
        onChange={(e) => onChange({ ...expense, [key]: e.target.value })}
        className={inputClass}
      >
        {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Common group */}
      <fieldset className="border border-[#3c6e71] rounded p-4">
        <legend className="px-2 font-semibold text-[#3c6e71]">Common</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {numberInput('expenseTaxAmount', 'Tax', 'taxAmount')}
          {periodSelect('expenseTaxPeriod', 'Tax Period', 'taxPeriod')}
          {numberInput('expenseInsuranceAmount', 'Insurance', 'insuranceAmount')}
          {periodSelect('expenseInsurancePeriod', 'Insurance Period', 'insurancePeriod')}
          {numberInput('expenseMotService', 'MOT and Service (per year)', 'motServicePerYear')}
          {numberInput('expenseFuelMonthly', 'Fuel (monthly)', 'fuelMonthly')}
        </div>
      </fieldset>

      {/* Finance group */}
      <fieldset className="border border-[#3c6e71] rounded p-4">
        <legend className="px-2 font-semibold text-[#3c6e71]">Finance</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('expenseFinanceType', 'Finance Type',
            <select
              id="expenseFinanceType"
              value={expense.financeType}
              onChange={(e) => onChange({ ...expense, financeType: e.target.value })}
              className={inputClass}
            >
              {FINANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>

        {expense.financeType === 'Cash' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {nestedNumberInput('expenseCashTotal', 'Total Amount', 'cash', 'totalAmount')}
          </div>
        )}

        {expense.financeType === 'Loan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {nestedNumberInput('expenseLoanInitial', 'Initial Payment', 'loan', 'initialPayment')}
            {nestedNumberInput('expenseLoanMonthly', 'Monthly Payment', 'loan', 'monthlyPayment')}
            {nestedNumberInput('expenseLoanDuration', 'Duration (months)', 'loan', 'duration')}
            {nestedNumberInput('expenseLoanBuyOut', 'Buy Out Option Value', 'loan', 'buyOutValue')}
          </div>
        )}

        {expense.financeType === 'Lease' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {nestedNumberInput('expenseLeaseInitial', 'Initial Payment', 'lease', 'initialPayment')}
            {nestedNumberInput('expenseLeaseMonthly', 'Monthly Payment', 'lease', 'monthlyPayment')}
            {nestedNumberInput('expenseLeaseDuration', 'Duration (months)', 'lease', 'duration')}
          </div>
        )}
      </fieldset>

      {/* Sale group */}
      <fieldset className="border border-[#3c6e71] rounded p-4">
        <legend className="px-2 font-semibold text-[#3c6e71]">Sale</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {numberInput('expenseEndOfOwnershipValue', 'End of Ownership Value', 'endOfOwnershipValue')}
        </div>
      </fieldset>
    </div>
  );
}

function ExpensesTab({ cars, expenses, onExpensesChange }) {
  const [selectedId, setSelectedId] = useState(null);

  const selectedExpense = selectedId != null ? (expenses[selectedId] || null) : null;

  const handleSelect = (id) => {
    setSelectedId(id);
    if (!expenses[id]) {
      onExpensesChange({ ...expenses, [id]: createExpense() });
    }
  };

  const handleExpenseChange = (updatedExpense) => {
    onExpensesChange({ ...expenses, [selectedId]: updatedExpense });
  };

  const carLabel = (car) => {
    const parts = [car.brand, car.make].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Unnamed Car';
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Left panel — car list */}
      <div className="w-full md:w-1/3 flex flex-col border border-[#3c6e71] rounded">
        <ul className="flex-1 overflow-y-auto divide-y divide-[#3c6e71]">
          {cars.map((car) => (
            <li
              key={car.id}
              onClick={() => handleSelect(car.id)}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#3c6e71]/20 ${
                selectedId === car.id ? 'bg-[#3c6e71]/30' : ''
              }`}
            >
              <span className="truncate">{carLabel(car)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel — expense editor */}
      <div className="w-full md:w-2/3 overflow-y-auto">
        <ExpenseForm expense={selectedExpense} onChange={handleExpenseChange} />
      </div>
    </div>
  );
}

export { createExpense, PERIODS, FINANCE_TYPES };
export default ExpensesTab;
