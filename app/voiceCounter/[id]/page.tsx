'use client';

import { useState, useEffect, useRef } from 'react';
import { getVoiceCounterSession, updateVoiceCounterSession } from '../../actions';
import { voiceCounterTemplates, VoiceCounterTemplate } from '@/lib/voice-counter-templates';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

interface VoiceCounterSession {
  id: string;
  name: string;
  counts: { [key: string]: number };
}

export default function VoiceCounterSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<VoiceCounterSession | null>(null);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');
  const [isSubtractMode, setIsSubtractMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const router = useRouter();
  
  // 保存用のタイマー
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await getVoiceCounterSession(id);
        if (!data) {
          router.push('/voiceCounter');
          return;
        }
        setSession(data);
        // countsが空の場合は初期化
        const initialCounts = data.counts || {};
        // テンプレートのボタンIDに基づいて初期値を設定（なければ0）
        const template = voiceCounterTemplates.find(t => t.id === selectedTemplateId) || voiceCounterTemplates[0];
        const mergedCounts = { ...initialCounts };
        Object.keys(template.buttons).forEach(key => {
            if (mergedCounts[key] === undefined) {
                mergedCounts[key] = 0;
            }
        });
        setCounts(mergedCounts);
      } catch (error) {
        console.error('Failed to load session:', error);
        router.push('/voiceCounter');
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, [id, router, selectedTemplateId]);

  // カウントが変更されたら保存 (デバウンス)
  useEffect(() => {
    if (isLoading) return;

    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateVoiceCounterSession(id, counts);
        setSaveStatus('saved');
      } catch (error) {
        console.error('Failed to save counts:', error);
        setSaveStatus('error');
      }
    }, 1000); // 1秒後に保存

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [counts, id, isLoading]);

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
          {saveStatus === 'error' && 'Error'}
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
