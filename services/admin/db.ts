
import { supabase } from '../../services/supabase';
import { Lead, Property, Ticket, User, UserRole } from '../../types-admin';
import { MOCK_LEADS, MOCK_PROPERTIES } from '../../constants-admin';

// MOCK DATA FALLBACKS (In case DB tables don't exist yet)
let localLeads = [...MOCK_LEADS];
let localProperties = [...MOCK_PROPERTIES];
let localTickets: Ticket[] = [
  {
    id: 't1', title: 'Leaking Faucet', description: 'Kitchen sink dripping constantly.', 
    status: 'OPEN', priority: 'MEDIUM', propertyId: '101', propertyAddress: 'Kouter 12, 9000 Gent', 
    createdBy: 'u1', createdAt: new Date().toISOString()
  },
  {
    id: 't2', title: 'Heating Failure', description: 'No heating in living room.', 
    status: 'SCHEDULED', priority: 'HIGH', propertyId: '102', propertyAddress: 'Meir 24, 2000 Antwerpen', 
    createdBy: 'u2', createdAt: new Date(Date.now() - 86400000).toISOString(), assignedTo: 'c1'
  }
];

export const db = {
  // --- USERS ---
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error || !data) return null;
      return data as User;
    } catch (e) {
      console.log('Using local/auth user');
      return null;
    }
  },

  async createUserProfile(user: User) {
    try {
      await supabase.from('profiles').upsert(user);
    } catch (e) {
      console.log('DB: Profile creation failed (tables likely missing), proceeding in-memory');
    }
  },

  // --- LEADS ---
  async getLeads(): Promise<Lead[]> {
    try {
      const { data, error } = await supabase.from('leads').select('*');
      if (error) throw error;
      return data as Lead[];
    } catch (e) {
      return localLeads;
    }
  },

  async updateLead(lead: Lead) {
    try {
      // Optimistic local update
      localLeads = localLeads.map(l => l.id === lead.id ? lead : l);
      
      const { error } = await supabase.from('leads').upsert(lead);
      if (error) throw error;
    } catch (e) {
      console.warn('DB: Update Lead failed, using local state');
    }
  },

  // --- PROPERTIES ---
  async getProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase.from('properties').select('*');
      if (error) throw error;
      return data as Property[];
    } catch (e) {
      return localProperties;
    }
  },

  // --- TICKETS ---
  async getTickets(): Promise<Ticket[]> {
    try {
      const { data, error } = await supabase.from('tickets').select('*');
      if (error) throw error;
      return data as Ticket[];
    } catch (e) {
      return localTickets;
    }
  },

  async updateTicket(ticket: Ticket) {
    try {
       localTickets = localTickets.map(t => t.id === ticket.id ? ticket : t);
       await supabase.from('tickets').upsert(ticket);
    } catch (e) {
       console.warn('DB: Update Ticket failed, using local state');
    }
  },

  async createTicket(ticket: Ticket) {
      localTickets.push(ticket);
      try {
          await supabase.from('tickets').insert(ticket);
      } catch (e) {}
  }
};
