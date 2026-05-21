import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface UserProfile {
  name: string;
  email: string;
  tier: 'free' | 'premium';
  credits: number;
  totalCredits: number;
}

export interface WriterHistoryItem {
  id: string;
  template: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export interface StudioImageItem {
  id: string;
  prompt: string;
  style: string;
  url: string;
  timestamp: string;
}

export interface CalendarEventItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  content: string;
  status: 'scheduled' | 'posted';
}

export interface ToastMessage {
  message: string;
  type: 'error' | 'success' | 'warning';
}

interface AppContextType {
  user: UserProfile;
  writerHistory: WriterHistoryItem[];
  studioImages: StudioImageItem[];
  calendarEvents: CalendarEventItem[];
  apiKey: string;
  sessionUser: SupabaseUser | null;
  toast: ToastMessage | null;
  isSupabaseReady: boolean;
  clearToast: () => void;
  showToast: (message: string, type: 'error' | 'success' | 'warning') => void;
  setApiKey: (key: string) => void;
  upgradeToPremium: () => void;
  consumeCredits: (amount: number) => boolean;
  addWriterItem: (template: string, prompt: string, response: string) => void;
  addStudioImage: (prompt: string, style: string, url: string) => void;
  addCalendarEvent: (event: Omit<CalendarEventItem, 'id' | 'status'>) => void;
  deleteCalendarEvent: (id: string) => void;
  toggleEventStatus: (id: string) => void;
  signOutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionUser, setSessionUser] = useState<SupabaseUser | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [dbTablesMissing, setDbTablesMissing] = useState<boolean>(false);

  const isSyncActive = isSupabaseConfigured && !dbTablesMissing;

  const showToast = (message: string, type: 'error' | 'success' | 'warning') => {
    setToast({ message, type });
    // Auto-dismiss toast in 5 seconds
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 5000);
  };

  const clearToast = () => setToast(null);
  
  const [user, setUser] = useState<UserProfile>({
    name: 'Demo Founder',
    email: 'demo@aetherflow.io',
    tier: 'free',
    credits: 50,
    totalCredits: 50
  });

  const [writerHistory, setWriterHistory] = useState<WriterHistoryItem[]>([
    {
      id: 'mock1',
      template: 'Google Ads Search',
      prompt: 'AetherFlow AI marketing tool',
      response: 'Headline: Double Your Leads with AetherFlow AI\nDescription: Automate your social copy, generate beautiful visuals, and schedule your campaigns in one click. Try AetherFlow free today.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ]);

  const [studioImages, setStudioImages] = useState<StudioImageItem[]>([
    {
      id: 'mockimg1',
      prompt: 'A neon-lit cyber workspace with holographic displays, highly detailed 3d render',
      style: '3D Render',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ]);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([
    {
      id: 'mockevt1',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      platform: 'twitter',
      content: 'Launching AetherFlow today! The absolute fastest way to scale your marketing workflow with AI. Check it out at aetherflow.io 🚀 #buildinpublic',
      status: 'scheduled'
    }
  ]);

  const [apiKey, setApiKeyState] = useState<string>('');

  // 1. Setup Session Listener & Load Data from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase client using placeholder credentials.');
      return;
    }

    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSessionUser(session.user);
        loadUserData(session.user);
      }
    }).catch(err => {
      console.error('Failed to get initial session', err);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSessionUser(session.user);
        loadUserData(session.user);
      } else {
        setSessionUser(null);
        setDbTablesMissing(false);
        // Reset to default demo data on sign out
        setUser({
          name: 'Demo Founder',
          email: 'demo@aetherflow.io',
          tier: 'free',
          credits: 50,
          totalCredits: 50
        });
        setWriterHistory([]);
        setStudioImages([]);
        setCalendarEvents([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      const emailVal = supabaseUser.email || '';
      const nameVal = emailVal.split('@')[0];

      // Fetch Profile (Credits & Tier)
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileErr && profileErr.code !== 'PGRST116') {
        throw profileErr;
      }

      if (profile) {
        setUser({
          name: nameVal.charAt(0).toUpperCase() + nameVal.slice(1),
          email: emailVal,
          tier: profile.tier as 'free' | 'premium',
          credits: profile.credits,
          totalCredits: profile.tier === 'premium' ? 550 : 50
        });
        setApiKeyState(profile.api_key || '');
      } else {
        // Fallback profile if row is not populated by trigger yet
        setUser({
          name: nameVal.charAt(0).toUpperCase() + nameVal.slice(1),
          email: emailVal,
          tier: 'free',
          credits: 50,
          totalCredits: 50
        });
      }

      // Fetch Writer History
      const { data: writerData, error: writerErr } = await supabase
        .from('writer_history')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .order('timestamp', { ascending: false });

      if (writerErr) throw writerErr;

      if (writerData) {
        setWriterHistory(writerData.map(item => ({
          id: item.id,
          template: item.template,
          prompt: item.prompt,
          response: item.response,
          timestamp: item.timestamp
        })));
      }

      // Fetch Studio Images
      const { data: imageData, error: imageErr } = await supabase
        .from('studio_images')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .order('timestamp', { ascending: false });

      if (imageErr) throw imageErr;

      if (imageData) {
        setStudioImages(imageData.map(img => ({
          id: img.id,
          prompt: img.prompt,
          style: img.style,
          url: img.url,
          timestamp: img.timestamp
        })));
      }

      // Fetch Calendar Events
      const { data: calendarData, error: calendarErr } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', supabaseUser.id);

      if (calendarErr) throw calendarErr;

      if (calendarData) {
        setCalendarEvents(calendarData.map(evt => ({
          id: evt.id,
          date: evt.date,
          time: evt.time,
          platform: evt.platform as any,
          content: evt.content,
          status: evt.status as any
        })));
      }

    } catch (err: any) {
      console.error('Error synchronizing database tables:', err);
      const errMsg = err?.message || '';
      const errCode = err?.code || '';
      const isMissingTable = 
        errCode === '42P01' || 
        errMsg.includes('relation') || 
        errMsg.includes('does not exist') || 
        errMsg.includes('Could not find the table') || 
        errMsg.includes('schema cache');

      if (isMissingTable) {
        setDbTablesMissing(true);
        // Set user profile using session user email/name so the sidebar profile reflects the active user session!
        const emailVal = supabaseUser.email || '';
        const nameVal = emailVal.split('@')[0];
        setUser({
          name: nameVal.charAt(0).toUpperCase() + nameVal.slice(1),
          email: emailVal,
          tier: 'free',
          credits: 50,
          totalCredits: 50
        });
        showToast('Database Schema Missing: Please run the SQL migration script (supabase_schema.sql) in your Supabase dashboard to enable database syncing.', 'warning');
      } else {
        showToast(`Database Sync Error: ${err.message || err}`, 'error');
      }
    }
  };

  const setApiKey = async (key: string) => {
    setApiKeyState(key);
    if (sessionUser) {
      if (!isSyncActive) {
        showToast('Supabase is not configured or schema is missing. Key saved locally only.', 'warning');
        return;
      }
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ api_key: key })
          .eq('id', sessionUser.id);
        
        if (error) throw error;
        showToast('Developer API key saved successfully.', 'success');
      } catch (err: any) {
        showToast(`Failed to synchronize API key to database: ${err.message}`, 'error');
      }
    } else {
      showToast('API key saved for local sandbox session.', 'success');
    }
  };

  const upgradeToPremium = async () => {
    const nextCredits = user.credits + 500;
    setUser(prev => ({
      ...prev,
      tier: 'premium',
      credits: nextCredits,
      totalCredits: 550
    }));

    if (sessionUser) {
      if (!isSyncActive) {
        showToast('Database is not configured or schema is missing. Upgraded locally.', 'warning');
        return;
      }
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ tier: 'premium', credits: nextCredits })
          .eq('id', sessionUser.id);
        
        if (error) throw error;
        showToast('Account successfully upgraded to Pro Tier!', 'success');
      } catch (err: any) {
        showToast(`Payment registered, but failed to update cloud database: ${err.message}`, 'error');
      }
    } else {
      showToast('Sandbox workspace upgraded to Pro Tier!', 'success');
    }
  };

  const consumeCredits = (amount: number): boolean => {
    if (user.credits < amount) return false;

    const nextCredits = user.credits - amount;
    setUser(prev => ({
      ...prev,
      credits: nextCredits
    }));

    if (sessionUser && isSyncActive) {
      supabase
        .from('profiles')
        .update({ credits: nextCredits })
        .eq('id', sessionUser.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating credits:', error);
            showToast(`Credits Sync Warning: ${error.message}`, 'warning');
          }
        });
    }

    return true;
  };

  const addWriterItem = async (template: string, prompt: string, response: string) => {
    const tempId = Math.random().toString(36).substring(2, 9);
    const timestampStr = new Date().toISOString();

    const newItem: WriterHistoryItem = {
      id: tempId,
      template,
      prompt,
      response,
      timestamp: timestampStr
    };

    setWriterHistory(prev => [newItem, ...prev]);

    if (sessionUser && isSyncActive) {
      try {
        const { data, error } = await supabase
          .from('writer_history')
          .insert({
            user_id: sessionUser.id,
            template,
            prompt,
            response
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          // Swap temp ID with real DB UUID
          setWriterHistory(prev => prev.map(item => item.id === tempId ? { ...item, id: data.id } : item));
        }
      } catch (err: any) {
        showToast(`Failed to save marketing copy to history: ${err.message}`, 'error');
      }
    }
  };

  const addStudioImage = async (prompt: string, style: string, url: string) => {
    const tempId = 'img-' + Math.random().toString(36).substring(2, 9);
    const timestampStr = new Date().toISOString();

    const newImage: StudioImageItem = {
      id: tempId,
      prompt,
      style,
      url,
      timestamp: timestampStr
    };

    setStudioImages(prev => [newImage, ...prev]);

    if (sessionUser && isSyncActive) {
      try {
        const { data, error } = await supabase
          .from('studio_images')
          .insert({
            user_id: sessionUser.id,
            prompt,
            style,
            url
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setStudioImages(prev => prev.map(img => img.id === tempId ? { ...img, id: data.id } : img));
        }
      } catch (err: any) {
        showToast(`Failed to save generated image: ${err.message}`, 'error');
      }
    }
  };

  const addCalendarEvent = async (event: Omit<CalendarEventItem, 'id' | 'status'>) => {
    const tempId = 'evt-' + Math.random().toString(36).substring(2, 9);
    const newEvent: CalendarEventItem = {
      ...event,
      id: tempId,
      status: 'scheduled'
    };

    setCalendarEvents(prev => [...prev, newEvent]);

    if (sessionUser && isSyncActive) {
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .insert({
            user_id: sessionUser.id,
            date: event.date,
            time: event.time,
            platform: event.platform,
            content: event.content,
            status: 'scheduled'
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setCalendarEvents(prev => prev.map(evt => evt.id === tempId ? { ...evt, id: data.id } : evt));
          showToast('Campaign scheduled successfully.', 'success');
        }
      } catch (err: any) {
        showToast(`Failed to sync calendar campaign: ${err.message}`, 'error');
      }
    } else {
      showToast('Campaign scheduled locally (Sandbox Mode).', 'success');
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    setCalendarEvents(prev => prev.filter(evt => evt.id !== id));

    if (sessionUser && isSyncActive && !id.startsWith('mock') && !id.startsWith('evt-')) {
      try {
        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', id)
          .eq('user_id', sessionUser.id);
        
        if (error) throw error;
        showToast('Campaign deleted successfully.', 'success');
      } catch (err: any) {
        showToast(`Failed to delete campaign: ${err.message}`, 'error');
      }
    } else if (id.startsWith('mock') || id.startsWith('evt-')) {
      showToast('Local campaign deleted successfully.', 'success');
    }
  };

  const toggleEventStatus = async (id: string) => {
    let nextStatus: 'scheduled' | 'posted' = 'scheduled';
    
    setCalendarEvents(prev => prev.map(evt => {
      if (evt.id === id) {
        nextStatus = evt.status === 'scheduled' ? 'posted' : 'scheduled';
        return {
          ...evt,
          status: nextStatus
        };
      }
      return evt;
    }));

    if (sessionUser && isSyncActive && !id.startsWith('mock') && !id.startsWith('evt-')) {
      try {
        const { error } = await supabase
          .from('calendar_events')
          .update({ status: nextStatus })
          .eq('id', id)
          .eq('user_id', sessionUser.id);
        
        if (error) throw error;
        showToast(`Campaign marked as ${nextStatus}.`, 'success');
      } catch (err: any) {
        showToast(`Failed to update campaign: ${err.message}`, 'error');
      }
    } else {
      showToast(`Campaign status updated locally to ${nextStatus}.`, 'success');
    }
  };

  const signOutUser = async () => {
    if (!isSupabaseConfigured) {
      setSessionUser(null);
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setDbTablesMissing(false);
      showToast('Logged out of cloud workspace.', 'success');
    } catch (err: any) {
      showToast(`Sign out warning: ${err.message}`, 'warning');
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      writerHistory,
      studioImages,
      calendarEvents,
      apiKey,
      sessionUser,
      toast,
      isSupabaseReady: isSyncActive,
      clearToast,
      showToast,
      setApiKey,
      upgradeToPremium,
      consumeCredits,
      addWriterItem,
      addStudioImage,
      addCalendarEvent,
      deleteCalendarEvent,
      toggleEventStatus,
      signOutUser
    }}>
      {children}
    </AppContext.Provider>
  );
};
