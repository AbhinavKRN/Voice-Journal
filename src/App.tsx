import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import History from './pages/History';
import Insights from './pages/Insights';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={createBrowserRouter([
        {
          path: "/",
          element: (
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          ),
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/journal",
          element: (
            <PrivateRoute>
              <Journal />
            </PrivateRoute>
          ),
        },
        {
          path: "/history",
          element: (
            <PrivateRoute>
              <History />
            </PrivateRoute>
          ),
        },
        {
          path: "/insights",
          element: (
            <PrivateRoute>
              <Insights />
            </PrivateRoute>
          ),
        },
      ])} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
