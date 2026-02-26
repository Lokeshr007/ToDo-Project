import { createContext, useContext, useState } from "react";

const ExperienceContext = createContext();

export function ExperienceProvider({ children }) {

  const [quantumEnter, setQuantumEnter] = useState(false);
  const [loadingCore, setLoadingCore] = useState(false);

  return (
    <ExperienceContext.Provider value={{
      quantumEnter,
      setQuantumEnter,
      loadingCore,
      setLoadingCore
    }}>
      {children}
    </ExperienceContext.Provider>
  );
}

export const useExperience = () => useContext(ExperienceContext);