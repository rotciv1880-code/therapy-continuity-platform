import { createContext, useContext, useState, ReactNode } from "react";

export type DemoPersona = "therapist" | "client" | null;

interface DemoContextType {
  isDemoMode: boolean;
  demoPersona: DemoPersona;
  enterDemo: (persona: DemoPersona) => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  demoPersona: null,
  enterDemo: () => {},
  exitDemo: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoPersona, setDemoPersona] = useState<DemoPersona>(() => {
    const saved = sessionStorage.getItem("demo-persona");
    return (saved as DemoPersona) ?? null;
  });

  const isDemoMode = demoPersona !== null;

  const enterDemo = (persona: DemoPersona) => {
    setDemoPersona(persona);
    if (persona) sessionStorage.setItem("demo-persona", persona);
  };

  const exitDemo = () => {
    setDemoPersona(null);
    sessionStorage.removeItem("demo-persona");
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, demoPersona, enterDemo, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}
