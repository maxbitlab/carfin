export const PERIODS = ['year', 'month'];
export const FINANCE_TYPES = ['Cash', 'Loan', 'Lease'];

export function createMaintenance() {
  return { mode: 'estimated', firstServiceOffsetMonths: 12, entries: [] };
}

// Validate date-only strings without timezone conversion or Date's overflow rules.
export function isMaintenanceDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1];
}

export function maintenanceEntryErrors(entry) {
  const errors = {};
  if (!isMaintenanceDate(entry.date)) errors.date = 'Enter a valid maintenance date.';
  if (typeof entry.price !== 'number' || !Number.isFinite(entry.price) || entry.price < 0) {
    errors.price = 'Enter a cost of 0 or more.';
  }
  if (entry.notes !== undefined && typeof entry.notes !== 'string') {
    errors.notes = 'Notes must be text.';
  }
  return errors;
}

export function isMaintenanceOffset(value) {
  return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0;
}

// Copy and order records chronologically while preserving the input order for
// records on the same date. Callers own record cloning and saved identity.
export function sortMaintenanceEntries(entries) {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

// Undefined metadata is the legacy format. Present metadata must be complete;
// import callers receive the precise error, while local readers can fall back.
export function maintenanceValidationError(maintenance) {
  if (maintenance === undefined) return '';
  if (!maintenance || typeof maintenance !== 'object' || Array.isArray(maintenance)) {
    return 'maintenance must be an object.';
  }
  if (!['estimated', 'historic'].includes(maintenance.mode)) {
    return 'maintenance.mode must be estimated or historic.';
  }
  if (!isMaintenanceOffset(maintenance.firstServiceOffsetMonths)) {
    return 'maintenance.firstServiceOffsetMonths must be a nonnegative whole number.';
  }
  if (!Array.isArray(maintenance.entries)) return 'maintenance.entries must be an array.';
  const ids = new Set();
  for (let i = 0; i < maintenance.entries.length; i += 1) {
    const entry = maintenance.entries[i];
    const path = `maintenance.entries[${i}]`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return `${path} must be an object.`;
    if (typeof entry.id !== 'string' || !entry.id.trim() || ids.has(entry.id)) {
      return `${path}.id must be a unique, nonempty string.`;
    }
    ids.add(entry.id);
    const errors = maintenanceEntryErrors(entry);
    const field = Object.keys(errors)[0];
    if (field) return `${path}.${field}: ${errors[field]}`;
  }
  return '';
}

// Do not rewrite caller state: malformed local metadata uses a safe Estimated
// view, retaining the original annual amount and all unrelated expense fields.
export function getMaintenance(expense) {
  const maintenance = expense?.maintenance;
  if (maintenance === undefined || maintenanceValidationError(maintenance)) return createMaintenance();
  return {
    ...maintenance,
    entries: sortMaintenanceEntries(
      maintenance.entries.map((entry) => ({ ...entry, notes: entry.notes ?? '' }))
    ),
  };
}

// Factory for a blank expense object with all values initialised to 0 and a
// default Cash finance type.
export function createExpense() {
  return {
    taxAmount: 0,
    taxPeriod: 'year',
    insuranceAmount: 0,
    insurancePeriod: 'year',
    motServicePerYear: 0,
    maintenance: createMaintenance(),
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
