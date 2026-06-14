import React, { useState } from 'react';
import { createCar, carLabel, BODY_TYPES, FUEL_TYPES, GEARBOX_TYPES } from '../../domain/car';

function CarForm({ car, onChange }) {
  if (!car) {
    return (
      <div className="flex items-center justify-center h-full text-[#3c6e71]">
        <p>Select a car or add a new one to edit its properties.</p>
      </div>
    );
  }

  const field = (id, label, content) => (
    <div key={id}>
      <label htmlFor={id} className="block mb-1 font-medium">{label}</label>
      {content}
    </div>
  );

  const textInput = (id, label, key) =>
    field(id, label,
      <input
        id={id}
        type="text"
        value={car[key]}
        onChange={(e) => onChange({ ...car, [key]: e.target.value })}
        className="w-full px-3 py-2 rounded bg-[#353535] border border-[#3c6e71] text-white focus:outline-none focus:ring-1 focus:ring-[#3c6e71]"
      />
    );

  const numberInput = (id, label, key, min) =>
    field(id, label,
      <input
        id={id}
        type="number"
        min={min}
        value={car[key]}
        onChange={(e) => onChange({ ...car, [key]: e.target.value })}
        className="w-full px-3 py-2 rounded bg-[#353535] border border-[#3c6e71] text-white focus:outline-none focus:ring-1 focus:ring-[#3c6e71]"
      />
    );

  const selectInput = (id, label, key, options) =>
    field(id, label,
      <select
        id={id}
        value={car[key]}
        onChange={(e) => onChange({ ...car, [key]: e.target.value })}
        className="w-full px-3 py-2 rounded bg-[#353535] border border-[#3c6e71] text-white focus:outline-none focus:ring-1 focus:ring-[#3c6e71]"
      >
        <option value="">-- Select --</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {textInput('carBrand', 'Car Brand', 'brand')}
      {textInput('carMake', 'Car Make', 'make')}
      {numberInput('carYear', 'Year', 'year', 1886)}
      {selectInput('carBodyType', 'Body Type', 'bodyType', BODY_TYPES)}
      {selectInput('carFuelType', 'Fuel Type', 'fuelType', FUEL_TYPES)}
      {numberInput('carRange', 'Range (miles)', 'range', 0)}
      {numberInput('carSeats', 'Seat Number', 'seats', 1)}
      {selectInput('carGearbox', 'Gearbox', 'gearbox', GEARBOX_TYPES)}
      <div className="md:col-span-2">
        <span className="block mb-1 font-medium">Boot Space</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-2">
          {numberInput('bootSpace1Row', '1 Row Up (litres)', 'bootSpace1Row', 0)}
          {numberInput('bootSpace2Row', '2 Rows Up (litres)', 'bootSpace2Row', 0)}
          {numberInput('bootSpace3Row', '3 Rows Up (litres)', 'bootSpace3Row', 0)}
        </div>
      </div>

    </div>
  );
}

function CarTab({ cars, onCarsChange }) {
  const [selectedId, setSelectedId] = useState(null);

  const selectedCar = cars.find((c) => c.id === selectedId) || null;

  const handleAdd = () => {
    const newCar = createCar(Date.now());
    onCarsChange([...cars, newCar]);
    setSelectedId(newCar.id);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    const updated = cars.filter((c) => c.id !== id);
    onCarsChange(updated);
    if (selectedId === id) {
      setSelectedId(updated.length > 0 ? updated[updated.length - 1].id : null);
    }
  };

  const handleCarChange = (updatedCar) => {
    onCarsChange(cars.map((c) => (c.id === updatedCar.id ? updatedCar : c)));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Left panel — car list */}
      <div className="w-full md:w-1/3 flex flex-col border border-[#3c6e71] rounded">
        <ul className="flex-1 overflow-y-auto divide-y divide-[#3c6e71]">
          {cars.map((car) => (
            <li
              key={car.id}
              onClick={() => setSelectedId(car.id)}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#3c6e71]/20 ${
                selectedId === car.id ? 'bg-[#3c6e71]/30' : ''
              }`}
            >
              <span className="truncate">{carLabel(car)}</span>
              <button
                onClick={(e) => handleDelete(e, car.id)}
                aria-label={`Delete ${carLabel(car)}`}
                className="ml-2 text-white hover:text-red-400 shrink-0"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-[#3c6e71] p-2">
          <button
            onClick={handleAdd}
            className="w-full py-1 rounded bg-[#3c6e71] text-white hover:opacity-80 font-bold text-lg"
            aria-label="Add car"
          >
            +
          </button>
        </div>
      </div>

      {/* Right panel — car editor */}
      <div className="w-full md:w-2/3 overflow-y-auto">
        <CarForm car={selectedCar} onChange={handleCarChange} />
      </div>
    </div>
  );
}

export default CarTab;
