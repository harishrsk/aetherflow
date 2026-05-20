import React, { createContext, useContext, useState, useEffect } from 'react';

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
  setApiKey: (key: string) => void;
  upgradeToPremium: () => void;
  consumeCredits: (amount: number) => boolean;
  addWriterItem: (template: string, prompt: string, response: string) => void;
  addStudioImage: (prompt: string, style: string, url: string) => void;
  addCalendarEvent: (event: Omit<CalendarEventItem, 'id' | 'status'>) => void;
  deleteCalendarEvent: (id: string) => void;
  toggleEventStatus: (id: string) => void;
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
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('aetherflow_user');
    return saved ? JSON.parse(saved) : {
      name: 'Demo Founder',
      email: 'founder@aetherflow.io',
      tier: 'free',
      credits: 50,
      totalCredits: 50
    };
  });

  const [writerHistory, setWriterHistory] = useState<WriterHistoryItem[]>(() => {
    const saved = localStorage.getItem('aetherflow_writer_history');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        template: 'Google Ads Search',
        prompt: 'AetherFlow AI marketing tool',
        response: 'Headline: Double Your Leads with AetherFlow AI\nDescription: Automate your social copy, generate beautiful visuals, and schedule your campaigns in one click. Try AetherFlow free today.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
  });

  const [studioImages, setStudioImages] = useState<StudioImageItem[]>(() => {
    const saved = localStorage.getItem('aetherflow_studio_images');
    return saved ? JSON.parse(saved) : [
      {
        id: 'img1',
        prompt: 'A neon-lit cyber workspace with holographic displays, highly detailed 3d render',
        style: '3D Render',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'img2',
        prompt: 'A serene mountain peak surrounded by glowing aurora borealis, digital art, high quality',
        style: 'Photorealistic',
        url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=600&q=80',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(() => {
    const saved = localStorage.getItem('aetherflow_calendar_events');
    const today = new Date().toISOString().split('T')[0];
    
    // Default mock events
    return saved ? JSON.parse(saved) : [
      {
        id: 'evt1',
        date: today,
        time: '10:00',
        platform: 'twitter',
        content: 'Launching AetherFlow today! The absolute fastest way to scale your marketing workflow with AI. Check it out at aetherflow.io 🚀 #buildinpublic',
        status: 'scheduled'
      },
      {
        id: 'evt2',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        time: '14:30',
        platform: 'linkedin',
        content: 'Excited to announce our beta launch. Automating content creation allows startup founders to focus on product. How are you incorporating AI in your business strategy?',
        status: 'scheduled'
      }
    ];
  });

  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem('aetherflow_gemini_key') || '';
  });

  // Persist state to localstorage
  useEffect(() => {
    localStorage.setItem('aetherflow_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('aetherflow_writer_history', JSON.stringify(writerHistory));
  }, [writerHistory]);

  useEffect(() => {
    localStorage.setItem('aetherflow_studio_images', JSON.stringify(studioImages));
  }, [studioImages]);

  useEffect(() => {
    localStorage.setItem('aetherflow_calendar_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('aetherflow_gemini_key', key);
  };

  const upgradeToPremium = () => {
    setUser(prev => ({
      ...prev,
      tier: 'premium',
      credits: prev.credits + 500,
      totalCredits: prev.totalCredits + 500
    }));
  };

  const consumeCredits = (amount: number): boolean => {
    let success = false;
    setUser(prev => {
      if (prev.credits >= amount) {
        success = true;
        return {
          ...prev,
          credits: prev.credits - amount
        };
      }
      return prev;
    });
    return success;
  };

  const addWriterItem = (template: string, prompt: string, response: string) => {
    const newItem: WriterHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      template,
      prompt,
      response,
      timestamp: new Date().toISOString()
    };
    setWriterHistory(prev => [newItem, ...prev]);
  };

  const addStudioImage = (prompt: string, style: string, url: string) => {
    const newImage: StudioImageItem = {
      id: 'img-' + Math.random().toString(36).substring(2, 9),
      prompt,
      style,
      url,
      timestamp: new Date().toISOString()
    };
    setStudioImages(prev => [newImage, ...prev]);
  };

  const addCalendarEvent = (event: Omit<CalendarEventItem, 'id' | 'status'>) => {
    const newEvent: CalendarEventItem = {
      ...event,
      id: 'evt-' + Math.random().toString(36).substring(2, 9),
      status: 'scheduled'
    };
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(evt => evt.id !== id));
  };

  const toggleEventStatus = (id: string) => {
    setCalendarEvents(prev => prev.map(evt => {
      if (evt.id === id) {
        return {
          ...evt,
          status: evt.status === 'scheduled' ? 'posted' : 'scheduled'
        };
      }
      return evt;
    }));
  };

  return (
    <AppContext.Provider value={{
      user,
      writerHistory,
      studioImages,
      calendarEvents,
      apiKey,
      setApiKey,
      upgradeToPremium,
      consumeCredits,
      addWriterItem,
      addStudioImage,
      addCalendarEvent,
      deleteCalendarEvent,
      toggleEventStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};
