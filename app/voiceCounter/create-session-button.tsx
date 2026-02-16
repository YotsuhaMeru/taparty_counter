'use client';

import { useState } from 'react';
import { createVoiceCounterSession } from '../actions';
import { useRouter } from 'next/navigation';

export default function CreateSessionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const now = new Date();
      const sessionName = now.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const session = await createVoiceCounterSession(sessionName);
      router.push(`/voiceCounter/${session.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      setError('Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full flex gap-4">
        <button
          onClick={handleCreateSession}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 flex justify-center items-center"
        >
          {isLoading ? 'Creating...' : 'Create New Session'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
