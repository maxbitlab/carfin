import React from 'react';
import { computeTableData } from '../../domain/calculations';
import { carLabel } from '../../domain/car';

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

export default TableTab;
