import { createExpense, getMaintenance, isMaintenanceDate, maintenanceValidationError, sortMaintenanceEntries } from './expense';

const entry = { id: 'one', date: '2024-02-29', price: 123.45 };

test('defaults and normalization never share or mutate maintenance state', () => {
  const a = createExpense();
  const b = createExpense();
  a.maintenance.entries.push(entry);
  expect(b.maintenance).toEqual({ mode: 'estimated', firstServiceOffsetMonths: 12, entries: [] });
  const legacy = { motServicePerYear: '400', fuelMonthly: 50 };
  expect(getMaintenance(legacy)).toEqual(b.maintenance);
  expect(legacy).toEqual({ motServicePerYear: '400', fuelMonthly: 50 });
  const normalized = getMaintenance(a);
  expect(normalized.entries[0].notes).toBe('');
  expect(a.maintenance.entries[0]).not.toHaveProperty('notes');
  normalized.entries[0].price = 0;
  expect(a.maintenance.entries[0].price).toBe(123.45);
});

test('normalization returns independent entries in stable chronological order', () => {
  const records = [
    { id: 'later', date: '2024-05-01', price: 50, notes: 'Later' },
    { id: 'same-first', date: '2024-02-01', price: 10 },
    { id: 'same-second', date: '2024-02-01', price: 20, notes: 'Second' },
    { id: 'earlier', date: '2023-12-31', price: 5, notes: 'Earlier' },
  ];
  const expense = { maintenance: { mode: 'historic', firstServiceOffsetMonths: 12, entries: records } };
  const before = JSON.stringify(expense);
  const normalized = getMaintenance(expense);

  expect(normalized.entries.map(({ id }) => id)).toEqual(['earlier', 'same-first', 'same-second', 'later']);
  expect(normalized.entries).not.toBe(records);
  normalized.entries.forEach((record) => expect(records).not.toContain(record));
  normalized.entries[0].notes = 'Changed clone';
  expect(JSON.stringify(expense)).toBe(before);

  const sorted = sortMaintenanceEntries(normalized.entries);
  expect(sorted).not.toBe(normalized.entries);
  expect(sorted.map(({ id }) => id)).toEqual(['earlier', 'same-first', 'same-second', 'later']);
});

test.each(['2024-02-29', '2000-02-29', '2021-01-31', '0001-01-01'])('accepts real date %s', (date) => {
  expect(isMaintenanceDate(date)).toBe(true);
});

test.each(['', '2023-02-29', '1900-02-29', '2021-04-31', '2021-13-01', '2021-00-01', '2021-01-00', '2021-1-01', '0000-01-01', '2021-01-01T00:00:00Z'])('rejects invalid date %s', (date) => {
  expect(isMaintenanceDate(date)).toBe(false);
});

test.each([
  [null, 'maintenance must be an object'],
  [{ mode: 'invalid' }, 'maintenance.mode'],
  [{ mode: 'historic', firstServiceOffsetMonths: -1, entries: [] }, 'firstServiceOffsetMonths'],
  [{ mode: 'historic', firstServiceOffsetMonths: 1.5, entries: [] }, 'firstServiceOffsetMonths'],
  [{ mode: 'historic', firstServiceOffsetMonths: 12, entries: 'bad' }, 'entries'],
])('rejects malformed metadata without changing the caller', (maintenance, error) => {
  const expense = { motServicePerYear: 400, maintenance };
  expect(maintenanceValidationError(maintenance)).toContain(error);
  expect(getMaintenance(expense)).toEqual(createExpense().maintenance);
  expect(expense.maintenance).toBe(maintenance);
  expect(expense.motServicePerYear).toBe(400);
});

test.each([
  [{ ...entry, price: -1 }, '.price'],
  [{ ...entry, price: Infinity }, '.price'],
  [{ ...entry, price: NaN }, '.price'],
  [{ ...entry, price: '123' }, '.price'],
  [{ ...entry, date: '2024-02-30' }, '.date'],
  [{ ...entry, notes: {} }, '.notes'],
  [{ ...entry, id: '' }, '.id'],
])('identifies invalid entry fields', (record, field) => {
  expect(maintenanceValidationError({ mode: 'historic', firstServiceOffsetMonths: 0, entries: [record] })).toContain(`entries[0]${field}`);
});

test('allows zeros, decimal prices and duplicate dates, but requires unique IDs', () => {
  const metadata = { mode: 'historic', firstServiceOffsetMonths: 0, entries: [entry, { ...entry, id: 'two', price: 0, notes: '' }] };
  expect(maintenanceValidationError(metadata)).toBe('');
  expect(maintenanceValidationError({ ...metadata, entries: [entry, entry] })).toContain('entries[1].id');
  expect(maintenanceValidationError(undefined)).toBe('');
});
