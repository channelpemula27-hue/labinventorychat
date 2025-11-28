import React, { useState } from 'react';
import { User } from './types';
import { Login } from './components/Login';
import { ChatInterface } from './components/ChatInterface';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <ChatInterface user={user} onLogout={handleLogout} />;
};

export default App;