import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ConfigurationSection from './components/ConfigurationSection';
import ResultSection from './components/ResultSection';

function App() {
  const [projectName, setProjectName] = useState('');
  const [ownershipDuration, setOwnershipDuration] = useState(1);
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
      />
      <ResultSection />
    </div>
  );
}

export default App;
