import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/apiClient";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  // True until the initial silent-refresh attempt (below) settles — lets
  // ProtectedRoute avoid bouncing a still-logged-in user to /login on reload.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    api
      .post("/auth/refresh")
      .then(({ accessToken, user }) => {
        setAccessToken(accessToken);
        setUser(user);
      })
      .catch(() => {
        // No valid session cookie — that's a normal logged-out state, not an error.
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = async (email, password) => {
    const { accessToken, user } = await api.post("/auth/login", { email, password });
    setAccessToken(accessToken);
    setUser(user);
  };

  const signup = async ({ name, email, password, organizationName }) => {
    const { accessToken, user } = await api.post("/auth/signup", { name, email, password, organizationName });
    setAccessToken(accessToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const isAuthenticated = Boolean(accessToken);

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated, initializing, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
