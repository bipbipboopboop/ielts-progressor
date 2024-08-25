import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./services/firebase";
import LoginPage from "./pages/LoginPage";
import Practice from "./pages/Practice";
import Results from "./pages/Results";

const App: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        Error: {error.message}
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/practice" replace /> : <LoginPage />}
        />
        <Route
          path="/practice"
          element={user ? <Practice /> : <Navigate to="/" replace />}
        />
        <Route
          path="/results"
          element={user ? <Results /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
