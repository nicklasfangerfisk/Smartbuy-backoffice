import React from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Session } from '@supabase/supabase-js';

const withAuth = <P extends object>(Component: React.FC<P>) => {
  return (props: P) => {
    const [session, setSession] = React.useState<Session | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      async function checkSession() {
        const { data } = await supabase.auth.getSession();
        setSession(data?.session || null);
        setLoading(false);
      }
      checkSession();
    }, []);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!session) {
      return <Navigate to="/login" replace />;
    }

    return <Component {...props} />;
  };
};

export default withAuth;
