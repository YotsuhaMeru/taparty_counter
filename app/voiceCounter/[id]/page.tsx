'use client';

import { useState, useEffect, useRef, use } from 'react';
import { getVoiceCounterSession, updateVoiceCounterSession } from '../../actions';
import { voiceCounterTemplates } from '@/lib/voice-counter-templates';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface VoiceCounterSession {
  id: string;
  name: string;
  counts: { [key: string]: number };
}

export default function VoiceCounterSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<VoiceCounterSession | null>(null);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  // Track the last version successfully synced to the server
  const [serverSyncedCounts, setServerSyncedCounts] = useState<{ [key: string]: number } | null>(null);
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');
  const [isSubtractMode, setIsSubtractMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const router = useRouter();
  
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Load
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storageKey = `voice-counter-${id}`;
        
        const cachedDataStr = localStorage.getItem(storageKey);
        
        let cachedCounts: { [key: string]: number } | null = null;

        if (cachedDataStr) {
            try {
                cachedCounts = JSON.parse(cachedDataStr);
            } catch (e) {
                console.error("Error parsing local storage", e);
            }
        }

        // Fetch from Server
        const data = await getVoiceCounterSession(id);
        if (!data) {
          router.push('/voiceCounter');
          return;
        }
        setSession(data);
        
        // Decision logic: Local vs Server
        if (cachedCounts) {
            // We have local cached data, prefer it (assumed unsynced)
            setCounts(cachedCounts);
            console.log("Using local cached data");
        } else {
            // No local cache, use server data
            setCounts(data.counts || {});
        }

        // Initialize synced state to what is currently on the server
        setServerSyncedCounts(data.counts || {});

      } catch (error) {
        console.error('Failed to load session:', error);
        // Fallback to local cache if server load fails
        const storageKey = `voice-counter-${id}`;
        const cachedDataStr = localStorage.getItem(storageKey);
        if (cachedDataStr) {
            try {
                setCounts(JSON.parse(cachedDataStr));
            } catch (e) {
                console.error("Error parsing local storage fallback", e);
            }
        } else {
             router.push('/voiceCounter');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, [id, router]);

  // Ensure template buttons exist in counts
  useEffect(() => {
      if (isLoading) return;
      
      const template = voiceCounterTemplates.find(t => t.id === selectedTemplateId) || voiceCounterTemplates[0];
      setCounts(prev => {
          const newCounts = { ...prev };
          let changed = false;
          Object.keys(template.buttons).forEach(key => {
              if (newCounts[key] === undefined) {
                  newCounts[key] = 0;
                  changed = true;
              }
          });
          return changed ? newCounts : prev;
      });
  }, [selectedTemplateId, isLoading]);

  // Manage Local Storage based on sync status
  useEffect(() => {
      if (isLoading) return;
      
      const storageKey = `voice-counter-${id}`;
      // If we don't know server state, or counts differ from server state, we save.
      // Only if we know server state AND counts match, we delete.
      if (serverSyncedCounts && JSON.stringify(counts) === JSON.stringify(serverSyncedCounts)) {
          localStorage.removeItem(storageKey);
      } else {
          localStorage.setItem(storageKey, JSON.stringify(counts));
      }
  }, [counts, serverSyncedCounts, id, isLoading]);

  // Sync Logic with Retry and Timeout
  useEffect(() => {
    if (isLoading) return;

    // Check if we need to sync
    // We use JSON stringify for deep comparison of counts object
    if (JSON.stringify(counts) === JSON.stringify(serverSyncedCounts)) {
        if (saveStatus !== 'saved') setSaveStatus('saved');
        return;
    }

    const sync = async () => {
        setSaveStatus('saving');
        try {
            const timestamp = Date.now();
            
            // Create a timeout promise (5 seconds)
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Sync timeout')), 5000)
            );

            // Execute update with timeout race
            await Promise.race([
                updateVoiceCounterSession(id, counts, timestamp),
                timeoutPromise
            ]);

            // If successful, update the synced state
            setServerSyncedCounts(counts);
            
            setSaveStatus('saved');
        } catch (error) {
            console.error('Failed to save counts:', error);
            setSaveStatus('error');
            
            // Retry logic: Schedule next attempt in 10 seconds
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = setTimeout(() => {
                sync();
            }, 10000);
        }
    };

    // Debounce sync execution by 1 second
    const debounceTimer = setTimeout(sync, 1000);

    return () => {
        clearTimeout(debounceTimer);
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
        }
    };
  }, [counts, serverSyncedCounts, id, isLoading]);

  const handleTouch = (buttonId: string) => {
    setCounts(prev => {
      const currentCount = prev[buttonId] || 0;
      const newCount = isSubtractMode ? Math.max(0, currentCount - 1) : currentCount + 1;
      return { ...prev, [buttonId]: newCount };
    });
  };

  const currentTemplate = voiceCounterTemplates.find(t => t.id === selectedTemplateId) || voiceCounterTemplates[0];

  const getButtonColor = (buttonId: string) => {
    if (buttonId === 'button4') return '#b3d9ff';
    if (buttonId === 'button5') return '#caffca';
    if (buttonId === 'button6') return '#ffc6ff';
    return '#f0f0f0'; // Default color
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!session) {
    return <div className="p-8">Session not found</div>;
  }

  return (
    <div className="min-h-screen p-4 flex flex-col gap-4 font-[family-name:var(--font-geist-sans)] max-w-md mx-auto">
      <div className="flex justify-between items-center">
        <Link href="/voiceCounter" className="text-blue-500 hover:underline">
        &larr; Back
        </Link>
        <h1 className="text-xl font-bold truncate">{session.name}</h1>
        <div className="text-xs text-gray-500 w-16 text-right">
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'error' && 'Error (Retrying)'}
        </div>
      </div>

      <div className="flex justify-between items-center gap-2">
        <select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          className="p-2 border rounded text-sm flex-1 text-black dark:text-white dark:bg-gray-800 dark: border-gray-600"
        >
          {voiceCounterTemplates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <button
          onClick={() => setIsSubtractMode(!isSubtractMode)}
          className={`px-3 py-2 rounded text-sm font-bold transition-colors ${
            isSubtractMode ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {isSubtractMode ? '- Mode' : '+ Mode'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {Object.entries(currentTemplate.buttons).map(([key, name]) => (
          <button
            key={key}
            onClick={() => handleTouch(key)}
            style={{ backgroundColor: getButtonColor(key) }}
            className="flex flex-col items-center justify-center p-4 rounded-xl shadow-md active:scale-95 transition-transform h-32"
          >
            <span className="text-xs text-gray-700 mb-1 text-center w-full break-words leading-tight px-1" style={{minHeight: '2.5em', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {name}
            </span>
            <span className="text-4xl font-bold text-black">
              {counts[key] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
