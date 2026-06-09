export const EXPORT_FILE_NAME = 'carfin-config.json';

// Builds the export file name, including the project name when available.
// Falls back to the default file name when no usable project name is given.
export function buildExportFileName(projectName) {
  const slug = (projectName ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `carfin-${slug}.json` : EXPORT_FILE_NAME;
}

// Builds the plain object that represents the full application configuration.
export function buildExportState({ projectName, ownershipDuration, cars, expenses }) {
  return {
    projectName,
    ownershipDuration,
    cars,
    expenses,
  };
}

// Serializes the application state into a pretty-printed JSON string.
export function serializeState(state) {
  return JSON.stringify(buildExportState(state), null, 2);
}

// Validates and normalizes an imported configuration object.
// Throws an Error with a user friendly message when the data is invalid.
export function parseImportedState(raw) {
  let data;
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    throw new Error('Invalid JSON file.');
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid configuration file.');
  }

  const { projectName, ownershipDuration, cars, expenses } = data;

  if (typeof projectName !== 'string') {
    throw new Error('Invalid configuration file.');
  }
  if (typeof ownershipDuration !== 'number' || Number.isNaN(ownershipDuration)) {
    throw new Error('Invalid configuration file.');
  }
  if (!Array.isArray(cars)) {
    throw new Error('Invalid configuration file.');
  }
  if (!expenses || typeof expenses !== 'object' || Array.isArray(expenses)) {
    throw new Error('Invalid configuration file.');
  }

  return { projectName, ownershipDuration, cars, expenses };
}

// Triggers a browser download of the given state as a JSON file.
export function downloadStateAsJson(state, fileName = EXPORT_FILE_NAME) {
  const json = serializeState(state);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
