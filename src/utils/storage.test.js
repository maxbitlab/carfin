import { loadState, saveState, clearState, STORAGE_KEY } from './storage';

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
