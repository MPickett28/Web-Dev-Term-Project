import { createContext, useCallback, useEffect, useState } from "react";

export const AuthContext = createContext(null);

function getStoredAuth() {
  const localToken = localStorage.getItem("authToken");
  const localUser = localStorage.getItem("currentUser");

  if (localToken && localUser) {
    try {
      return {
        token: localToken,
        user: JSON.parse(localUser),
        storageType: "local"
      };
    } catch {
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
    }
  }

  const sessionToken = sessionStorage.getItem("authToken");
  const sessionUser = sessionStorage.getItem("currentUser");

  if (sessionToken && sessionUser) {
    try {
      return {
        token: sessionToken,
        user: JSON.parse(sessionUser),
        storageType: "session"
      };
    } catch {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("currentUser");
    }
  }

  return {
    token: null,
    user: null,
    storageType: null
  };
}

export function AuthProvider({ children }) {
  const storedAuth = getStoredAuth();

  const [user, setUser] = useState(storedAuth.user);
  const [token, setToken] = useState(storedAuth.token);
  const [storageType, setStorageType] = useState(storedAuth.storageType);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const auth = getStoredAuth();

    setUser(auth.user);
    setToken(auth.token);
    setStorageType(auth.storageType);
    setAuthLoading(false);
  }, []);

  const login = useCallback((userData, authToken, remember = false) => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("currentUser");

    const storage = remember ? localStorage : sessionStorage;

    storage.setItem("authToken", authToken);
    storage.setItem("currentUser", JSON.stringify(userData));

    setUser(userData);
    setToken(authToken);
    setStorageType(remember ? "local" : "session");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("currentUser");

    setUser(null);
    setToken(null);
    setStorageType(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);

    if (storageType === "local") {
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    } else if (storageType === "session") {
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  }, [storageType]);

  const value = {
    user,
    token,
    isLoggedIn: Boolean(user && token),
    authLoading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
