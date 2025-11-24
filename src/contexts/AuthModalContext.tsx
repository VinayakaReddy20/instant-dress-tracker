import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthModalContextType {
  isOpen: boolean;
  openModal: (callback: () => void) => void;
  closeModal: () => void;
  executeCallback: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [callback, setCallback] = useState<(() => void) | null>(null);

  const openModal = (cb: () => void) => {
    setCallback(() => cb);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCallback(null);
  };

  const executeCallback = () => {
    if (callback) {
      callback();
      closeModal();
    }
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal, executeCallback }}>
      {children}
    </AuthModalContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthModal = (): AuthModalContextType => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};
