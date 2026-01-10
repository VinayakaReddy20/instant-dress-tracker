import React, { createContext } from "react";

export interface AuthModalContextType {
  isOpen: boolean;
  openModal: (callback: () => void, redirectPath?: string) => void;
  closeModal: () => void;
  executeCallback: () => void;
  redirectPath: string | null;
}

export const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);
