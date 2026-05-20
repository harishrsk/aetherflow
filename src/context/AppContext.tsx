import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
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

interface AppContextType {
  user: UserProfile;
  writerHistory: WriterHistoryItem[];
  studioImages: StudioImageItem[];
  calendarEvents: CalendarEventItem[];
  apiKey: string;
  sessionUser: SupabaseUser | null;
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
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSessionUser(session.user);
        loadUserData(session.user);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSessionUser(session.user);
        loadUserData(session.user);
      } else {
        setSessionUser(null);
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
        console.error(profileErr);
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
      const { data: writerData } = await supabase
        .from('writer_history')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .order('timestamp', { ascending: false });

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
      const { data: imageData } = await supabase
        .from('studio_images')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .order('timestamp', { ascending: false });

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
      const { data: calendarData } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', supabaseUser.id);

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

    } catch (err) {
      console.error('Error synchronizing database tables', err);
    }
  };

  const setApiKey = async (key: string) => {
    setApiKeyState(key);
    if (sessionUser) {
      await supabase
        .from('profiles')
        .update({ api_key: key })
        .eq('id', sessionUser.id);
    }
  };

  const upgradeToPremium = async () => {
    if (sessionUser) {
      const nextCredits = user.credits + 500;
      setUser(prev => ({
        ...prev,
        tier: 'premium',
        credits: nextCredits,
        totalCredits: 550
      }));
      await supabase
        .from('profiles')
        .update({ tier: 'premium', credits: nextCredits })
        .eq('id', sessionUser.id);
    } else {
      setUser(prev => ({
        ...prev,
        tier: 'premium',
        credits: prev.credits + 500,
        totalCredits: prev.totalCredits + 500
      }));
    }
  };

  const consumeCredits = (amount: number): boolean => {
    if (user.credits < amount) return false;

    const nextCredits = user.credits - amount;
    setUser(prev => ({
      ...prev,
      credits: nextCredits
    }));

    if (sessionUser) {
      supabase
        .from('profiles')
        .update({ credits: nextCredits })
        .eq('id', sessionUser.id)
        .then(({ error }) => {
          if (error) console.error('Error updating credits', error);
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

    if (sessionUser) {
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

      if (data && !error) {
        // Swap temp ID with real DB UUID
        setWriterHistory(prev => prev.map(item => item.id === tempId ? { ...item, id: data.id } : item));
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

    if (sessionUser) {
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

      if (data && !error) {
        setStudioImages(prev => prev.map(img => img.id === tempId ? { ...img, id: data.id } : img));
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

    if (sessionUser) {
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

      if (data && !error) {
        setCalendarEvents(prev => prev.map(evt => evt.id === tempId ? { ...evt, id: data.id } : evt));
      }
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    setCalendarEvents(prev => prev.filter(evt => evt.id !== id));

    if (sessionUser && !id.startsWith('mock') && !id.startsWith('evt-')) {
      await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', sessionUser.id);
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

    if (sessionUser && !id.startsWith('mock') && !id.startsWith('evt-')) {
      await supabase
        .from('calendar_events')
        .update({ status: nextStatus })
        .eq('id', id)
        .eq('user_id', sessionUser.id);
    }
  };

  const signOutUser = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider value={{
      user,
      writerHistory,
      studioImages,
      calendarEvents,
      apiKey,
      sessionUser,
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
