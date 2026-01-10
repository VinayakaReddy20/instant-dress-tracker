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

  const executeCallbackAndRedirect = async () => {
    if (callback) {
      callback();
    }
    if (redirectPath) {
      // Store redirect path using our new utility
      const { RedirectStateStorage } = await import('@/lib/authGuard');
      RedirectStateStorage.setRedirectPath({
        path: redirectPath,
        search: window.location.search || undefined,
      });
    }
    closeModal();
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal, executeCallback, executeCallbackAndRedirect, redirectPath }}>
      {children}
    </AuthModalContext.Provider>
  );
};
