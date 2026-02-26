import React, { createContext, useContext } from 'react';

// TEMP PLACEHOLDER — replace after migration
const ExperienceContext = createContext();

export const ExperienceProvider = ({ children }) => {
  return (
    <ExperienceContext.Provider value={{}}>
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => useContext(ExperienceContext);
export default ExperienceContext;
