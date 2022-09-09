import React from 'react';
import Navbar from './Navbar';
import { useAuth } from '../lib/context/AuthContext';
import { AuthenticatedApiProvider } from '../lib/context/AuthenticatedApiContext';

export default function Layout({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated()) {
    return (
      <>
        <AuthenticatedApiProvider>
          <Navbar />
          <main>{children}</main>
        </AuthenticatedApiProvider>
      </>
    );
  } else {
    return (
      <>
        <Navbar />
        <main>{children}</main>
      </>
    );
  }
}
