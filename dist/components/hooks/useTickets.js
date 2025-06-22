var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../utils/supabaseClient';
export function useTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchTickets = useCallback(() => __awaiter(this, void 0, void 0, function* () {
        setLoading(true);
        setError(null);
        const { data, error } = yield supabase
            .from('tickets')
            .select('*')
            .order('updated_at', { ascending: false });
        if (error)
            setError(error.message);
        setTickets(data || []);
        setLoading(false);
    }), []);
    useEffect(() => { fetchTickets(); }, [fetchTickets]);
    return { tickets, loading, error, refresh: fetchTickets };
}
export function useTicketActivities(ticketId) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchActivities = useCallback(() => __awaiter(this, void 0, void 0, function* () {
        if (!ticketId)
            return;
        setLoading(true);
        setError(null);
        const { data, error } = yield supabase
            .from('ticketactivities')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('timestamp', { ascending: true });
        if (error)
            setError(error.message);
        setActivities(data || []);
        setLoading(false);
    }), [ticketId]);
    useEffect(() => { fetchActivities(); }, [fetchActivities]);
    return { activities, loading, error, refresh: fetchActivities };
}
