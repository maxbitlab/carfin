import React from 'react';

function GeneralTab({ projectName, onProjectNameChange, ownershipDuration, onOwnershipDurationChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="projectName" className="block mb-1 font-medium">Project Name</label>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="Enter project name"
          className="w-full px-3 py-2 rounded bg-[#353535] border border-[#3c6e71] text-white focus:outline-none focus:ring-1 focus:ring-[#3c6e71]"
        />
      </div>
      <div>
        <label htmlFor="ownershipDuration" className="block mb-1 font-medium">Ownership Duration (years)</label>
        <input
          id="ownershipDuration"
          type="number"
          min="1"
          value={ownershipDuration}
          onChange={(e) => onOwnershipDurationChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="w-full px-3 py-2 rounded bg-[#353535] border border-[#3c6e71] text-white focus:outline-none focus:ring-1 focus:ring-[#3c6e71]"
        />
      </div>
    </div>
  );
}

export default GeneralTab;
