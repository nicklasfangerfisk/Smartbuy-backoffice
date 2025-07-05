import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import type { Database } from '../general/supabase.types';

type Ticket = Database['public']['Tables']['tickets']['Row'];
type TicketActivity = Database['public']['Tables']['ticketactivities']['Row'];

/**
 * Custom hook to fetch and manage tickets from the database.
 *
 * @returns {Object} An object containing:
 * - `tickets`: Array of tickets.
 * - `loading`: Boolean indicating if data is being loaded.
 * - `error`: Error message, if any.
 * - `refresh`: Function to refresh the tickets data.
 */
export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) setError(error.message);
    setTickets(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return { tickets, loading, error, refresh: fetchTickets };
}

/**
 * Custom hook to fetch and manage activities for a specific ticket.
 *
 * @param {string | null} ticketId - The ID of the ticket to fetch activities for.
 * @returns {Object} An object containing:
 * - `activities`: Array of ticket activities.
 * - `loading`: Boolean indicating if data is being loaded.
 * - `error`: Error message, if any.
 * - `refresh`: Function to refresh the activities data.
 */
export function useTicketActivities(ticketId: string | null) {
  const [activities, setActivities] = useState<TicketActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('ticketactivities')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('timestamp', { ascending: true });
    if (error) setError(error.message);
    setActivities(data || []);
    setLoading(false);
  }, [ticketId]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  return { activities, loading, error, refresh: fetchActivities };
}
