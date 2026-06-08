import { useState, useEffect } from 'react';
import { createCar } from './components/CarTab';
import Navbar from './components/Navbar';
import ConfigurationSection from './components/ConfigurationSection';
import ResultSection from './components/ResultSection';

function App() {
  const [projectName, setProjectName] = useState('');
  const [ownershipDuration, setOwnershipDuration] = useState(1);
  const [cars, setCars] = useState([createCar(1)]);
  const [expenses, setExpenses] = useState({});
  const handleExport = () => {};
  const handleImport = () => {};

  useEffect(() => {
    document.title = projectName ? `CarFin - ${projectName}` : 'CarFin';
  }, [projectName]);

  return (
    <div className="min-h-screen flex flex-col bg-[#353535]">
      <Navbar onExport={handleExport} onImport={handleImport} projectName={projectName} />
      <ConfigurationSection
        projectName={projectName}
        onProjectNameChange={setProjectName}
        ownershipDuration={ownershipDuration}
        onOwnershipDurationChange={setOwnershipDuration}
        cars={cars}
        onCarsChange={setCars}
        expenses={expenses}
        onExpensesChange={setExpenses}
      />
      <ResultSection cars={cars} expenses={expenses} ownershipDuration={ownershipDuration} />
    </div>
  );
}

export default App;
