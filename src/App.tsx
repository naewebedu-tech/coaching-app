import { useState, useEffect } from 'react';
import MarketingWebsite from './pages/marketing/MarketingWebsite';
import Dashboard from './pages/dashboard/Dashboard';
import { authService } from './services/api';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  name: string;
  phone: string;
  institute_name: string;
  email?: string;
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const data = await authService.getProfile();
          if(data.success) {
            setCurrentUser(data.user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Session invalid", error);
          handleLogout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = (data: any) => {
    // data is the full response from Login API
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setCurrentUser(data.user);
    setIsAuthenticated(true);
    toast.success("Welcome back!");
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    toast.success("Logged out");
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {!isAuthenticated ? (
        <MarketingWebsite onLogin={handleLogin} />
      ) : (
        currentUser && <Dashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;