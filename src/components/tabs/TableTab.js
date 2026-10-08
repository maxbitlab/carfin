import React from 'react';
import { computeTableData, historicMaintenanceSchedule } from '../../domain/calculations';
import { carLabel } from '../../domain/car';
import { getMaintenance } from '../../domain/expense';

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
  const historicCars = cars.filter((car) => getMaintenance(expenses[car.id]).mode === 'historic');
  const maintenanceRows = historicCars.flatMap((car) =>
    historicMaintenanceSchedule(expenses[car.id], ownershipDuration).map((entry) => ({ ...entry, car }))
  ).sort((a, b) => a.month - b.month || a.date.localeCompare(b.date));

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
      {historicCars.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-[#3c6e71] mb-2">Maintenance cost schedule</h3>
          <p className="mb-3">Each record is charged once. Records in the final ownership month are included.</p>
          {maintenanceRows.length === 0 ? <p>No maintenance records.</p> : (
            <table aria-label="Maintenance cost schedule" className="w-full border-collapse text-white">
              <thead><tr>
                <th scope="col" className={headClass}>Car</th>
                <th scope="col" className={headClass}>Recorded date</th>
                <th scope="col" className={headClass}>Ownership month</th>
                <th scope="col" className={headClass}>Cost</th>
                <th scope="col" className={headClass}>Status</th>
              </tr></thead>
              <tbody>{maintenanceRows.map((entry) => (
                <tr key={`${entry.car.id}:${entry.id}`}>
                  <td className={headClass}>{carLabel(entry.car)}</td>
                  <td className={`${headClass} whitespace-nowrap`}>{entry.date}</td>
                  <td className={cellClass}>{entry.month}</td>
                  <td className={cellClass}>{formatValue(entry.price)}</td>
                  <td className={headClass}>{entry.included ? 'Included' : 'Beyond ownership period'}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default TableTab;
