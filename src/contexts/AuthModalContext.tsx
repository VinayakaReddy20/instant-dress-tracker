import React, { useState, ReactNode } from "react";
import { AuthModalContext, AuthModalContextType } from "./AuthModalContextValue";

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [callback, setCallback] = useState<(() => void) | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const openModal = (cb: () => void, redirectPath?: string) => {
    setCallback(() => cb);
    setRedirectPath(redirectPath || null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCallback(null);
    setRedirectPath(null);
  };

  const executeCallback = () => {
    if (callback) {
      callback();
      closeModal();
    }
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal, executeCallback, redirectPath }}>
      {children}
    </AuthModalContext.Provider>
  );
};

