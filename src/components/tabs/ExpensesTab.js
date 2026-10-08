import React, { useEffect, useRef, useState } from 'react';
import { createExpense, getMaintenance, isMaintenanceOffset, maintenanceEntryErrors, sortMaintenanceEntries, PERIODS, FINANCE_TYPES } from '../../domain/expense';
import { carLabel } from '../../domain/car';
import { historicMaintenanceAverage } from '../../domain/calculations';

const inputClass =
  'w-full px-3 py-2 rounded bg-[#353535] border border-[#3c6e71] text-white focus:outline-none focus:ring-1 focus:ring-[#3c6e71]';

const buttonClass = 'px-3 py-2 rounded border border-[#3c6e71] hover:bg-[#3c6e71]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';
let entrySequence = 0;

function MaintenanceEntryEditor({ draft, errors, priceRef, onDraftChange, onSave, onCancel }) {
  const field = (key, label, type) => (
    <div>
      <label htmlFor={`maintenance-${key}`} className="block mb-1 font-medium">{label}</label>
      <input
        id={`maintenance-${key}`} type={type} value={draft[key]}
        ref={key === 'price' ? priceRef : undefined}
        min={type === 'number' ? 0 : undefined} step={type === 'number' ? 'any' : undefined}
        required aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `maintenance-${key}-error` : undefined}
        onChange={(event) => onDraftChange(key, event.target.value)}
        className={inputClass}
      />
      {errors[key] && <p id={`maintenance-${key}-error`} role="alert" className="mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="border border-[#3c6e71] rounded p-3 flex flex-col gap-3">
      <p className="font-semibold">{draft.id ? 'Edit record' : 'New record'}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('price', 'Cost', 'number')}
        {field('date', 'Maintenance date', 'date')}
      </div>
      <div>
        <label htmlFor="maintenance-notes" className="block mb-1 font-medium">Notes (optional)</label>
        <textarea
          id="maintenance-notes" value={draft.notes}
          onChange={(event) => onDraftChange('notes', event.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onSave} className={buttonClass}>Save</button>
        <button type="button" onClick={onCancel} className={buttonClass}>Cancel</button>
      </div>
    </div>
  );
}

function MaintenanceHistorySummary({ average }) {
  return (
    <div>
      <p>Annualized history average: <strong>{average.annualAverage.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></p>
      <p className="mt-1">Uses all maintenance records over at least 12 months. Informational only; totals use scheduled costs.</p>
      <p className="mt-1">
        Averaging span: {average.coverageMonths} months
        {average.firstDate ? ` (${average.firstDate} to ${average.lastDate})` : ''}
      </p>
    </div>
  );
}

function MaintenanceForm({ expense, onChange }) {
  const maintenance = getMaintenance(expense);
  const average = historicMaintenanceAverage(expense);
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [offset, setOffset] = useState(String(maintenance.firstServiceOffsetMonths));
  const [offsetError, setOffsetError] = useState('');
  const priceRef = useRef(null);
  const addRef = useRef(null);
  const wasDraftOpen = useRef(false);
  const draftOpen = draft !== null;

  useEffect(() => {
    if (draftOpen) priceRef.current?.focus();
    else if (wasDraftOpen.current) addRef.current?.focus();
    wasDraftOpen.current = draftOpen;
  }, [draftOpen, draft?.id]);

  useEffect(() => {
    setOffset(String(maintenance.firstServiceOffsetMonths));
    setOffsetError('');
  }, [maintenance.firstServiceOffsetMonths]);

  const updateMaintenance = (patch) => onChange({ ...expense, maintenance: { ...maintenance, ...patch } });

  const handleCancelDraft = () => {
    setDraft(null);
    setErrors({});
  };

  const handleEditEntry = (entry) => {
    setDraft({ ...entry, price: String(entry.price) });
    setErrors({});
  };

  const handleAddEntry = () => handleEditEntry({ id: null, price: '', date: '', notes: '' });

  const handleDraftChange = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSaveEntry = () => {
    const entry = { ...draft, price: draft.price.trim() === '' ? NaN : Number(draft.price) };
    const nextErrors = maintenanceEntryErrors(entry);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    if (!entry.id) {
      // Generate identity only when saving. Dates and array positions are never IDs.
      do {
        entrySequence += 1;
        entry.id = `maintenance-${Date.now().toString(36)}-${entrySequence}`;
      } while (maintenance.entries.some((saved) => saved.id === entry.id));
    }

    const entries = sortMaintenanceEntries([
      ...maintenance.entries.filter((saved) => saved.id !== entry.id),
      entry,
    ]);
    updateMaintenance({ entries });
    handleCancelDraft();
  };

  const handleModeChange = (event) => {
    updateMaintenance({ mode: event.target.value });
    handleCancelDraft();
    setOffset(String(maintenance.firstServiceOffsetMonths));
    setOffsetError('');
  };

  const handleOffsetChange = (event) => {
    const value = event.target.value;
    setOffset(value);
    const number = value.trim() === '' ? NaN : Number(value);
    if (isMaintenanceOffset(number)) {
      setOffsetError('');
      updateMaintenance({ firstServiceOffsetMonths: number });
    } else {
      setOffsetError('Enter a whole number of months, 0 or more.');
    }
  };

  const handleDeleteEntry = (entry) => {
    updateMaintenance({ entries: maintenance.entries.filter((saved) => saved.id !== entry.id) });
    if (draft?.id === entry.id) handleCancelDraft();
  };

  return (
    <fieldset className="min-w-0 border border-[#3c6e71] rounded p-4">
      <legend className="px-2 font-semibold text-[#3c6e71]">Maintenance</legend>
      <label htmlFor="maintenance-mode" className="block mb-1 font-medium">Calculation method</label>
      <select id="maintenance-mode" value={maintenance.mode} className={inputClass} onChange={handleModeChange}>
        <option value="estimated">Annual estimate</option>
        <option value="historic">Recorded costs</option>
      </select>
      {maintenance.mode === 'estimated' ? (
        <div className="mt-4">
          <label htmlFor="expenseMotService" className="block mb-1 font-medium">Annual maintenance estimate</label>
          <input id="expenseMotService" type="number" min={0} step="any" value={expense.motServicePerYear}
            onChange={(event) => onChange({ ...expense, motServicePerYear: event.target.value })} className={inputClass} />
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          <MaintenanceHistorySummary average={average} />
          <div>
            <label htmlFor="maintenance-offset" className="block mb-1 font-medium">First maintenance month</label>
            <input id="maintenance-offset" type="number" min={0} step={1} value={offset}
              aria-invalid={Boolean(offsetError)} aria-describedby="maintenance-offset-help maintenance-offset-error"
              onChange={handleOffsetChange} className={inputClass} />
            <p id="maintenance-offset-help" className="mt-2">Months after ownership starts. 0 means immediately.</p>
            <p id="maintenance-offset-error" role={offsetError ? 'alert' : undefined}>{offsetError}</p>
          </div>
          {maintenance.entries.length === 0 ? <p>No maintenance records.</p> : (
            <ul className="flex flex-col gap-3">
              {maintenance.entries.map((entry) => (
                <li key={entry.id} className="border border-[#3c6e71] rounded p-3">
                  <p><time dateTime={entry.date}>{entry.date}</time> — {entry.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  {entry.notes && <p className="whitespace-pre-wrap break-words mt-1">{entry.notes}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button type="button" className={buttonClass} aria-label={`Edit record ${entry.date}, ${entry.price}`} onClick={() => handleEditEntry(entry)}>Edit</button>
                    <button type="button" className={buttonClass} aria-label={`Delete record ${entry.date}, ${entry.price}`} onClick={() => handleDeleteEntry(entry)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {draft ? (
            <MaintenanceEntryEditor
              draft={draft}
              errors={errors}
              priceRef={priceRef}
              onDraftChange={handleDraftChange}
              onSave={handleSaveEntry}
              onCancel={handleCancelDraft}
            />
          ) : (
            <button type="button" ref={addRef} className={`${buttonClass} self-start`} onClick={handleAddEntry}>Add record</button>
          )}
          <details>
            <summary className="cursor-pointer">How scheduling works</summary>
            <div className="mt-2 flex flex-col gap-2">
              <p>Records keep the calendar-month gaps between their maintenance dates. Day differences within a month do not affect spacing.</p>
              <p>The earliest recorded date is placed at the first maintenance month. Adding, editing, or deleting the earliest record re-anchors the schedule.</p>
              <p>Each record is charged once. No costs are projected after the last recorded maintenance date.</p>
            </div>
          </details>
        </div>
      )}
    </fieldset>
  );
}

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
          {numberInput('expenseFuelMonthly', 'Fuel (monthly)', 'fuelMonthly')}
        </div>
      </fieldset>

      <MaintenanceForm expense={expense} onChange={onChange} />

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

  const selectedExpense = selectedId != null && cars.some((car) => car.id === selectedId)
    ? (expenses[selectedId] || null) : null;

  const handleSelect = (id) => {
    setSelectedId(id);
    if (!expenses[id]) {
      onExpensesChange({ ...expenses, [id]: createExpense() });
    }
  };

  const handleExpenseChange = (updatedExpense) => {
    onExpensesChange({ ...expenses, [selectedId]: updatedExpense });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Left panel — car list */}
      <div className="w-full md:w-1/3 flex flex-col border border-[#3c6e71] rounded">
        <ul className="flex-1 overflow-y-auto divide-y divide-[#3c6e71]">
          {cars.map((car) => (
            <li
              key={car.id}
              className={`hover:bg-[#3c6e71]/20 ${
                selectedId === car.id ? 'bg-[#3c6e71]/30' : ''
              }`}
            >
              <button type="button" onClick={() => handleSelect(car.id)} aria-pressed={selectedId === car.id}
                className="w-full px-3 py-2 text-left truncate focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{carLabel(car)}</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel — expense editor */}
      <div className="w-full min-w-0 md:w-2/3 overflow-y-auto">
        <ExpenseForm key={selectedId} expense={selectedExpense} onChange={handleExpenseChange} />
      </div>
    </div>
  );
}

export default ExpensesTab;
