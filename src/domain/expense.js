export const PERIODS = ['year', 'month'];
export const FINANCE_TYPES = ['Cash', 'Loan', 'Lease'];

// Factory for a blank expense object with all values initialised to 0 and a
// default Cash finance type.
export function createExpense() {
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
