
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import ChallengeRoom from './pages/ChallengeRoom'; // Import the new screen
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Recording from './pages/Recording';
import Tracking from './pages/Tracking';
import Moderation from './pages/Moderation';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login';
  const isModerationPage = location.pathname.startsWith('/moderacao');

  if (!user && !isAuthPage) {
    return <Login />;
  }

  if (isModerationPage) {
    return (
      <Routes>
        <Route path="/moderacao" element={<Moderation />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/desafios" element={<Challenges />} />
        <Route path="/desafio/:id" element={<ChallengeDetail />} />
        <Route path="/sala-desafio/:id" element={<ChallengeRoom />} /> {/* Add the new route */}
        <Route path="/carteira" element={<Wallet />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/gravar/:participationId/:checkType" element={<Recording />} />
        <Route path="/tracking/:participationId" element={<Tracking />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Layout>
  );
};

export default App;
