"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Script } from "@/models/script";

interface ScriptContextType {
  scripts: Script[];
  setScripts: (scripts: Script[]) => void;
  getScript: (id: string) => Script | undefined;
  cacheScript: (script: Script) => void;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export function ScriptProvider({ children }: { children: React.ReactNode }) {
  const [scripts, setScriptsState] = useState<Script[]>([]);
  const setScripts = useCallback((newScripts: Script[]) => {
    setScriptsState(newScripts);
  }, []);

  const cacheScript = useCallback((script: Script) => {
    setScriptsState((prev) => {
      const exists = prev.find((s) => s.id === script.id);
      if (exists) {
        return prev.map((s) => (s.id === script.id ? script : s));
      }
      return [...prev, script];
    });
  }, []);

  const getScript = useCallback(
    (id: string) => {
      return scripts.find((s) => s.id === id);
    },
    [scripts]
  );

  return (
    <ScriptContext.Provider
      value={{ scripts, setScripts, getScript, cacheScript }}
    >
      {children}
    </ScriptContext.Provider>
  );
}

export function useScriptContext() {
  const context = useContext(ScriptContext);
  if (context === undefined) {
    throw new Error("useScriptContext must be used within a ScriptProvider");
  }
  return context;
}
