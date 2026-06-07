import React from 'react';

function Navbar({ onExport, onImport }) {
  return (
    <nav className="bg-[#3c6e71] text-white px-6 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold">CarFin</h1>
      <div className="flex gap-2">
        <button
          onClick={onExport}
          className="bg-[#353535] text-white px-4 py-1 rounded hover:opacity-80"
        >
          Export
        </button>
        <button
          onClick={onImport}
          className="bg-[#353535] text-white px-4 py-1 rounded hover:opacity-80"
        >
          Import
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
