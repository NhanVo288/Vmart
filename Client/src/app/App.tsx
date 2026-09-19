import { useEffect } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Navbar } from '../components/layout/Navbar';
import AppRouter from '../routes/AppRouter';
import { setNavigate } from '../lib/navigation';
import { useAppDispatch } from '../stores/hooks';
import { authApi } from '../stores/authApi';
import { setUser, logout, initialized } from '../stores/authSlice';

function NavigateSetter() {
  const navigate = useNavigate();
  useEffect(() => { setNavigate(navigate); }, [navigate]);
  return null;
}

function AuthInitializer() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    // Remove tokens left by versions that used browser storage.
    localStorage.removeItem('token');

    dispatch(authApi.endpoints.getUserInfo.initiate(undefined, { forceRefetch: true }))
      .unwrap()
      .then((userInfo) => {
        dispatch(setUser(userInfo));
        dispatch(initialized());
      })
      .catch(() => {
        dispatch(logout());
        dispatch(initialized());
      });
  }, [dispatch]);
  return null;
}

import { useSignalR } from '../hooks/useSignalR';

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isVendor = location.pathname.startsWith('/vendor');

  useSignalR();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAdmin && !isVendor && <Navbar />}
      <Box component="main" sx={{ flexGrow: 1, pt: isAdmin || isVendor ? 0 : '64px' }}>
        <AppRouter />
      </Box>
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer />
      <NavigateSetter />
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
