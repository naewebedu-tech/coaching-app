import { useState, useEffect } from 'react';
import MarketingWebsite from './pages/marketing/MarketingWebsite';
import Dashboard from './pages/dashboard/Dashboard';

// Define the User interface (matching the one used in Dashboard)
export interface User {
  id: string | number;
  name: string;
  email?: string;
  instituteName?: string;
  [key: string]: any;
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    localStorage.setItem('cm_current_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('cm_current_user');
  };

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('cm_current_user');
    if (savedUser) {
      try {
        const user: User = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse user session");
        localStorage.removeItem('cm_current_user');
      }
    }
  }, []);

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