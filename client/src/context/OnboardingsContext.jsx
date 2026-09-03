import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useAuthedApi } from "../hooks/useAuthedApi";
import { listOnboardings } from "../lib/onboardingsApi";
import { getErrorMessage } from "../lib/getErrorMessage";

const OnboardingsContext = createContext(undefined);

export const OnboardingsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const authedApi = useAuthedApi();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(
    (params) => {
      setLoading(true);
      setError("");
      return listOnboardings(authedApi, params)
        .then(setRecords)
        .catch((err) => setError(getErrorMessage(err).message))
        .finally(() => setLoading(false));
    },
    [authedApi]
  );

  useEffect(() => {
    // Public routes (the hire portal) render under this same provider tree
    // but have no session — never fire the staff-only list fetch for them.
    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no session, so the fetch below never runs; nothing left to load
      setLoading(false);
      return;
    }
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <OnboardingsContext.Provider value={{ records, loading, error, refetch }}>
      {children}
    </OnboardingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOnboardings = () => {
  const context = useContext(OnboardingsContext);
  if (!context) {
    throw new Error("useOnboardings must be used within an OnboardingsProvider");
  }
  return context;
};
