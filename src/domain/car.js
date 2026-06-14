export const BODY_TYPES = ['Coupe', 'Convertible', 'Estate', 'Hatchback', 'MPV', 'Saloon', 'SUV'];
export const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Plugin Hybrid', 'Electric'];
export const GEARBOX_TYPES = ['Automatic', 'Manual'];

// Factory for a blank car with the given id and empty editable fields.
export function createCar(id) {
  return {
    id,
    brand: '',
    make: '',
    year: '',
    bodyType: '',
    fuelType: '',
    range: '',
    seats: '',
    bootSpace1Row: '',
    bootSpace2Row: '',
    bootSpace3Row: '',
    gearbox: '',
  };
}

// Human readable label for a car, falling back to a placeholder when the car
// has neither a brand nor a make.
export function carLabel(car) {
  const parts = [car.brand, car.make].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Unnamed Car';
}
