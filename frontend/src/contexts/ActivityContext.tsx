import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type ActivityType = 'practice' | 'entry' | 'annotation' | 'research';

interface ActivityRecord {
  date: string;
  type: ActivityType;
  count: number;
}

interface ActivityContextType {
  activities: ActivityRecord[];
  recordActivity: (type: ActivityType) => void;
  getTotalActivities: (date: string) => number;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  // Load saved activities when user logs in
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`activities-${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setActivities(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          setActivities([]);
        }
      } else {
        setActivities([]);
      }
    } else {
      setActivities([]);
    }
  }, [user?.id]);

  const recordActivity = useCallback((type: ActivityType) => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    const newActivities = [...activities];
    
    const existing = newActivities.find(a => a.date === today && a.type === type);
    if (existing) {
      existing.count += 1;
    } else {
      newActivities.push({
        date: today,
        type,
        count: 1
      });
    }

    setActivities(newActivities);
    localStorage.setItem(`activities-${user.id}`, JSON.stringify(newActivities));
  }, [activities, user?.id]);

  const getTotalActivities = useCallback((date: string) => {
    return activities
      .filter(a => a.date === date)
      .reduce((sum, a) => sum + a.count, 0);
  }, [activities]);

  return (
    <ActivityContext.Provider value={{
      activities,
      recordActivity,
      getTotalActivities
    }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
