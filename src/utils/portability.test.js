import {
  buildExportState,
  serializeState,
  parseImportedState,
  downloadStateAsJson,
  buildExportFileName,
  EXPORT_FILE_NAME,
} from './portability';

const sampleState = {
  projectName: 'My Project',
  ownershipDuration: 5,
  cars: [{ id: 1, name: 'Car A' }],
  expenses: { 1: { fuel: 100 } },
};

test('buildExportState merges all configuration properties', () => {
  expect(buildExportState(sampleState)).toEqual(sampleState);
});

test('serializeState then parseImportedState round-trips the state', () => {
  const json = serializeState(sampleState);
  expect(parseImportedState(json)).toEqual(sampleState);
});

test('parseImportedState accepts an already-parsed object', () => {
  expect(parseImportedState(sampleState)).toEqual(sampleState);
});

test('parseImportedState throws on invalid JSON', () => {
  expect(() => parseImportedState('{not valid json')).toThrow();
});

test('parseImportedState throws when required fields are missing', () => {
  expect(() => parseImportedState({ projectName: 'X' })).toThrow();
});

test('parseImportedState throws on wrong field types', () => {
  expect(() =>
    parseImportedState({
      projectName: 'X',
      ownershipDuration: 'five',
      cars: [],
      expenses: {},
    })
  ).toThrow();
  expect(() =>
    parseImportedState({
      projectName: 'X',
      ownershipDuration: 1,
      cars: {},
      expenses: {},
    })
  ).toThrow();
});

test('downloadStateAsJson triggers a file download', () => {
  const createObjectURL = jest.fn(() => 'blob:url');
  const revokeObjectURL = jest.fn();
  global.URL.createObjectURL = createObjectURL;
  global.URL.revokeObjectURL = revokeObjectURL;

  const clickSpy = jest
    .spyOn(window.HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});

  downloadStateAsJson(sampleState);

  expect(createObjectURL).toHaveBeenCalledTimes(1);
  expect(clickSpy).toHaveBeenCalledTimes(1);
  expect(revokeObjectURL).toHaveBeenCalledTimes(1);

  clickSpy.mockRestore();
});

test('exposes a default export file name', () => {
  expect(EXPORT_FILE_NAME).toBe('carfin-config.json');
});

test('buildExportFileName includes the slugified project name', () => {
  expect(buildExportFileName('My Project')).toBe('carfin-my-project.json');
  expect(buildExportFileName('  Trip 2024!! ')).toBe('carfin-trip-2024.json');
});

test('buildExportFileName falls back to the default name when empty', () => {
  expect(buildExportFileName('')).toBe(EXPORT_FILE_NAME);
  expect(buildExportFileName('   ')).toBe(EXPORT_FILE_NAME);
  expect(buildExportFileName(undefined)).toBe(EXPORT_FILE_NAME);
});
