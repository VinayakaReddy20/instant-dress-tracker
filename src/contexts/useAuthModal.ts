import React, { useContext } from "react";
import { AuthModalContext, type AuthModalContextType } from "./AuthModalContextValue";

export const useAuthModal = (): AuthModalContextType => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};