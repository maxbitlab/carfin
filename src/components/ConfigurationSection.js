import React, { useState } from 'react';
import GeneralTab from './GeneralTab';
import CarTab from './CarTab';
import ExpensesTab from './ExpensesTab';

const TABS = ['General', 'Cars', 'Expenses'];

function ConfigurationSection({ projectName, onProjectNameChange, ownershipDuration, onOwnershipDurationChange, cars, onCarsChange, expenses, onExpensesChange }) {
  const [activeTab, setActiveTab] = useState('General');

  const renderTabContent = () => {
    if (activeTab === 'General') return (
      <GeneralTab
        projectName={projectName}
        onProjectNameChange={onProjectNameChange}
        ownershipDuration={ownershipDuration}
        onOwnershipDurationChange={onOwnershipDurationChange}
      />
    );
    if (activeTab === 'Cars') return (
      <CarTab cars={cars} onCarsChange={onCarsChange} />
    );
    if (activeTab === 'Expenses') return (
      <ExpensesTab cars={cars} expenses={expenses} onExpensesChange={onExpensesChange} />
    );
    return <p>{activeTab} content placeholder</p>;
  };

  return (
    <section className="flex-1 bg-[#353535] text-white p-4">
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
        {renderTabContent()}
      </div>
    </section>
  );
}

export default ConfigurationSection;
