import { loadState, saveState, clearState, STORAGE_KEY } from './storage';
import { createExpense } from '../domain/expense';

beforeEach(() => {
  window.localStorage.clear();
});

test('saveState then loadState round-trips the state', () => {
  const state = {
    projectName: 'My Project',
    ownershipDuration: 5,
    cars: [{ id: 1, name: 'Car A' }],
    expenses: { 1: { fuel: 100 } },
  };
  saveState(state);
  expect(loadState()).toEqual(state);
});

test('loadState returns undefined when nothing is stored', () => {
  expect(loadState()).toBeUndefined();
});

test('loadState returns undefined on corrupted data', () => {
  window.localStorage.setItem(STORAGE_KEY, '{not valid json');
  expect(loadState()).toBeUndefined();
});

test('clearState removes stored state', () => {
  saveState({ projectName: 'X', ownershipDuration: 1, cars: [], expenses: {} });
  clearState();
  expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  expect(loadState()).toBeUndefined();
});

test('nested maintenance history and inactive values survive save/load', () => {
  const e = createExpense();
  e.motServicePerYear = '400';
  e.maintenance = { mode: 'historic', firstServiceOffsetMonths: 0, entries: [
    { id: 'a', date: '2021-01-01', price: 0, notes: '' },
    { id: 'b', date: '2021-01-01', price: 123.45, notes: 'Service and MOT' },
  ] };
  const state = { projectName: 'X', ownershipDuration: 2, cars: [{ id: 1 }, { id: 2 }], expenses: { 1: e, 2: createExpense() } };
  saveState(state);
  expect(loadState()).toEqual(state);
  clearState();
  expect(loadState()).toBeUndefined();
});
