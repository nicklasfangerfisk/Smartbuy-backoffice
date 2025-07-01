import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null); // Update the type to include Session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
      setLoading(false);
    }
    checkSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while checking the session
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
