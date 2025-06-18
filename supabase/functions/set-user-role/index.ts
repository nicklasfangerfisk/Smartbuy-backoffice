// supabase/functions/set-user-role.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

serve(async (req) => {
  const { user_id, role } = await req.json();
  if (!user_id || !role) {
    return new Response('Missing user_id or role', { status: 400 });
  }
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
    user_metadata: { role },
  });
  if (error) {
    return new Response(error.message, { status: 400 });
  }
  return new Response('Role updated', { status: 200 });
});
