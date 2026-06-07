import Navbar from './components/Navbar';
import ConfigurationSection from './components/ConfigurationSection';
import ResultSection from './components/ResultSection';

function App() {
  const handleExport = () => {};
  const handleImport = () => {};

  return (
    <div className="min-h-screen flex flex-col bg-[#353535]">
      <Navbar onExport={handleExport} onImport={handleImport} />
      <ConfigurationSection />
      <ResultSection />
    </div>
  );
}

export default App;
