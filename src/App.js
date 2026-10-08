import { useState, useEffect, useRef } from 'react';
import { createCar } from './domain/car';
import Navbar from './components/layout/Navbar';
import ConfigurationSection from './components/sections/ConfigurationSection';
import ResultSection from './components/sections/ResultSection';
import { loadState, saveState, clearState } from './utils/storage';
import { downloadStateAsJson, parseImportedState, buildExportFileName } from './utils/portability';

function App() {
  const persisted = loadState();
  const [projectName, setProjectName] = useState(persisted?.projectName ?? '');
  const [ownershipDuration, setOwnershipDuration] = useState(persisted?.ownershipDuration ?? 1);
  const [cars, setCars] = useState(persisted?.cars ?? [createCar(1)]);
  const [expenses, setExpenses] = useState(persisted?.expenses ?? {});
  const [configurationRevision, setConfigurationRevision] = useState(0);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  const handleExport = () => {
    downloadStateAsJson(
      { projectName, ownershipDuration, cars, expenses },
      buildExportFileName(projectName)
    );
  };

  const handleImport = () => {
    setImportError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseImportedState(reader.result);
        clearState();
        setProjectName(imported.projectName);
        setOwnershipDuration(imported.ownershipDuration);
        setCars(imported.cars);
        setExpenses(imported.expenses);
        setConfigurationRevision((revision) => revision + 1);
        setImportError('');
      } catch (e) {
        setImportError(e.message);
      }
    };
    reader.onerror = () => {
      setImportError('Could not read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    clearState();
    setProjectName('');
    setOwnershipDuration(1);
    setCars([createCar(1)]);
    setExpenses({});
    setConfigurationRevision((revision) => revision + 1);
    setImportError('');
  };

  useEffect(() => {
    document.title = projectName ? `CarFin - ${projectName}` : 'CarFin';
  }, [projectName]);

  useEffect(() => {
    saveState({ projectName, ownershipDuration, cars, expenses });
  }, [projectName, ownershipDuration, cars, expenses]);

  return (
    <div className="min-h-screen flex flex-col bg-[#353535]">
      <Navbar onExport={handleExport} onImport={handleImport} onClearData={handleClearData} projectName={projectName} />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        aria-label="Import configuration file"
        className="hidden"
        onChange={handleFileSelected}
      />
      {importError && (
        <div role="alert" className="bg-[#3c6e71] text-white px-6 py-2 text-center">
          {importError}
        </div>
      )}
      <ConfigurationSection
        projectName={projectName}
        onProjectNameChange={setProjectName}
        ownershipDuration={ownershipDuration}
        onOwnershipDurationChange={setOwnershipDuration}
        cars={cars}
        onCarsChange={setCars}
        expenses={expenses}
        onExpensesChange={setExpenses}
        configurationRevision={configurationRevision}
      />
      <ResultSection cars={cars} expenses={expenses} ownershipDuration={ownershipDuration} />
    </div>
  );
}

export default App;
