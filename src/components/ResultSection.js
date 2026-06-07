import React, { useState } from 'react';

const TABS = ['Chart', 'Table'];

function ResultSection() {
  const [activeTab, setActiveTab] = useState('Chart');

  return (
    <section className="flex-1 bg-[#353535] text-white p-4 border-t border-[#3c6e71]">
      <div className="flex border-b border-[#3c6e71]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-[#3c6e71] text-[#3c6e71]'
                : 'text-white hover:text-[#3c6e71]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4">
        <p>{activeTab} view placeholder</p>
      </div>
    </section>
  );
}

export default ResultSection;
