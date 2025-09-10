import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Tables = Database['public']['Tables'];

// User Management Service
export const userService = {
  async createUser(userData: Tables['users']['Insert']) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserByClerkId(clerkId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUser(id: string, userData: Tables['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Events Service
export const eventService = {
  async createEvent(eventData: Tables['events']['Insert']) {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllEvents() {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venues (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateEvent(id: string, eventData: Tables['events']['Update']) {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Venues Service
export const venueService = {
  async createVenue(venueData: Tables['venues']['Insert']) {
    const { data, error } = await supabase
      .from('venues')
      .insert(venueData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllVenues() {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateVenue(id: string, venueData: Tables['venues']['Update']) {
    const { data, error } = await supabase
      .from('venues')
      .update(venueData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteVenue(id: string) {
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Participants Service
export const participantService = {
  async createParticipant(participantData: Tables['participants']['Insert']) {
    const { data, error } = await supabase
      .from('participants')
      .insert(participantData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllParticipants() {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateParticipant(id: string, participantData: Tables['participants']['Update']) {
    const { data, error } = await supabase
      .from('participants')
      .update(participantData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteParticipant(id: string) {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Attendance Service
export const attendanceService = {
  async createAttendance(attendanceData: Tables['attendance_records']['Insert']) {
    const { data, error } = await supabase
      .from('attendance_records')
      .insert(attendanceData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllAttendance() {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        participants (*),
        events (*),
        venues (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateAttendance(id: string, attendanceData: Tables['attendance_records']['Update']) {
    const { data, error } = await supabase
      .from('attendance_records')
      .update(attendanceData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteAttendance(id: string) {
    const { error } = await supabase
      .from('attendance_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};