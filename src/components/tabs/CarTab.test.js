import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CarTab from './CarTab';
import { createCar, BODY_TYPES, FUEL_TYPES, GEARBOX_TYPES } from '../../domain/car';

function renderCarTab(cars, onCarsChange) {
  return render(<CarTab cars={cars} onCarsChange={onCarsChange} />);
}

describe('createCar', () => {
  it('creates a car with the given id and empty fields', () => {
    const car = createCar(42);
    expect(car.id).toBe(42);
    expect(car.brand).toBe('');
    expect(car.make).toBe('');
    expect(car.bodyType).toBe('');
    expect(car.fuelType).toBe('');
    expect(car.gearbox).toBe('');
  });
});

describe('constants', () => {
  it('BODY_TYPES includes required options', () => {
    expect(BODY_TYPES).toEqual(expect.arrayContaining(['Coupe', 'Convertible', 'Estate', 'Hatchback', 'MPV', 'Saloon', 'SUV']));
  });
  it('FUEL_TYPES includes required options', () => {
    expect(FUEL_TYPES).toEqual(expect.arrayContaining(['Petrol', 'Diesel', 'Hybrid', 'Plugin Hybrid', 'Electric']));
  });
  it('GEARBOX_TYPES includes required options', () => {
    expect(GEARBOX_TYPES).toEqual(expect.arrayContaining(['Automatic', 'Manual']));
  });
});

describe('CarTab rendering', () => {
  it('renders the add button', () => {
    renderCarTab([], jest.fn());
    expect(screen.getByLabelText('Add car')).toBeInTheDocument();
  });

  it('shows placeholder when no car is selected', () => {
    renderCarTab([], jest.fn());
    expect(screen.getByText(/select a car or add a new one/i)).toBeInTheDocument();
  });

  it('renders car names in the list', () => {
    const cars = [
      { ...createCar(1), brand: 'Toyota', make: 'Corolla' },
      { ...createCar(2), brand: 'Ford', make: '' },
    ];
    renderCarTab(cars, jest.fn());
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('Ford')).toBeInTheDocument();
  });

  it('shows "Unnamed Car" for cars with no brand or make', () => {
    renderCarTab([createCar(1)], jest.fn());
    expect(screen.getByText('Unnamed Car')).toBeInTheDocument();
  });
});

describe('CarTab interactions', () => {
  it('calls onCarsChange with a new car when + is clicked', () => {
    const onCarsChange = jest.fn();
    renderCarTab([], onCarsChange);
    fireEvent.click(screen.getByLabelText('Add car'));
    expect(onCarsChange).toHaveBeenCalledTimes(1);
    const newCars = onCarsChange.mock.calls[0][0];
    expect(newCars).toHaveLength(1);
    expect(newCars[0].brand).toBe('');
  });

  it('selects a car and shows its editor when clicked', () => {
    const cars = [{ ...createCar(1), brand: 'BMW', make: 'X5' }];
    renderCarTab(cars, jest.fn());
    fireEvent.click(screen.getByText('BMW X5'));
    expect(screen.getByLabelText('Car Brand')).toBeInTheDocument();
    expect(screen.getByDisplayValue('BMW')).toBeInTheDocument();
  });

  it('calls onCarsChange with updated car when a field is edited', () => {
    const cars = [{ ...createCar(1), brand: 'BMW', make: 'X5' }];
    const onCarsChange = jest.fn();
    renderCarTab(cars, onCarsChange);
    fireEvent.click(screen.getByText('BMW X5'));
    fireEvent.change(screen.getByLabelText('Car Brand'), { target: { value: 'Audi' } });
    expect(onCarsChange).toHaveBeenCalledTimes(1);
    const updated = onCarsChange.mock.calls[0][0];
    expect(updated[0].brand).toBe('Audi');
  });

  it('deletes a car when delete button is clicked', () => {
    const cars = [{ ...createCar(1), brand: 'BMW', make: 'X5' }];
    const onCarsChange = jest.fn();
    renderCarTab(cars, onCarsChange);
    fireEvent.click(screen.getByLabelText('Delete BMW X5'));
    expect(onCarsChange).toHaveBeenCalledWith([]);
  });

  it('selects next car after deleting the selected one', () => {
    const cars = [
      { ...createCar(1), brand: 'BMW', make: 'X5' },
      { ...createCar(2), brand: 'Audi', make: 'A4' },
    ];
    const onCarsChange = jest.fn();
    renderCarTab(cars, onCarsChange);
    // Select first car
    fireEvent.click(screen.getByText('BMW X5'));
    // Delete it
    fireEvent.click(screen.getByLabelText('Delete BMW X5'));
    const remaining = onCarsChange.mock.calls[0][0];
    expect(remaining).toHaveLength(1);
    expect(remaining[0].brand).toBe('Audi');
  });

  it('renders body type select with all options', () => {
    const cars = [createCar(1)];
    renderCarTab(cars, jest.fn());
    fireEvent.click(screen.getByText('Unnamed Car'));
    const select = screen.getByLabelText('Body Type');
    BODY_TYPES.forEach((type) => {
      expect(select).toContainElement(screen.getByRole('option', { name: type }));
    });
  });

  it('renders fuel type select with all options', () => {
    const cars = [createCar(1)];
    renderCarTab(cars, jest.fn());
    fireEvent.click(screen.getByText('Unnamed Car'));
    const select = screen.getByLabelText('Fuel Type');
    FUEL_TYPES.forEach((type) => {
      expect(select).toContainElement(screen.getByRole('option', { name: type }));
    });
  });

  it('renders gearbox select with all options', () => {
    const cars = [createCar(1)];
    renderCarTab(cars, jest.fn());
    fireEvent.click(screen.getByText('Unnamed Car'));
    const select = screen.getByLabelText('Gearbox');
    GEARBOX_TYPES.forEach((type) => {
      expect(select).toContainElement(screen.getByRole('option', { name: type }));
    });
  });
});
