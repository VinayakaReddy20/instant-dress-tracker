import React, { createContext, useState, useCallback } from "react";

export interface AuthModalContextType {
  isOpen: boolean;
  openModal: (callback: () => void, redirectPath?: string) => void;
  closeModal: () => void;
  executeCallback: () => void;
  executeCallbackAndRedirect: () => void;
  redirectPath: string | null;
}

export const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [callback, setCallback] = useState<(() => void) | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const openModal = useCallback((cb: () => void, path?: string) => {
    setCallback(() => cb);
    setRedirectPath(path || null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setCallback(null);
    setRedirectPath(null);
  }, []);

  const executeCallback = useCallback(() => {
    if (callback) {
      callback();
      closeModal();
    }
  }, [callback, closeModal]);

  const executeCallbackAndRedirect = useCallback(() => {
    if (callback) {
      callback();
      if (redirectPath) {
        window.location.href = redirectPath;
      }
      closeModal();
    }
  }, [callback, redirectPath, closeModal]);

  const value: AuthModalContextType = {
    isOpen,
    openModal,
    closeModal,
    executeCallback,
    executeCallbackAndRedirect,
    redirectPath
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};
