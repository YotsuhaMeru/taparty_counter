import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import CreateSessionButton from './create-session-button';

export default async function VoiceCounterPage() {
  const userId = await verifySession();

  if (!userId) {
    redirect('/');
  }

  const sessions = await db.getVoiceCounterSessions(userId);

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center sm:items-start w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Voice Counter Sessions</h1>

        <CreateSessionButton />

        <div className="w-full flex flex-col gap-4">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/voiceCounter/${session.id}`}
              className="p-4 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex justify-between items-center"
            >
              <span className="font-medium">{session.name}</span>
              <span className="text-sm text-gray-500">
                {new Date(session.updatedAt).toLocaleString()}
              </span>
            </Link>
          ))}
          {sessions.length === 0 && (
            <p className="text-center text-gray-500">No sessions found.</p>
          )}
        </div>
        
        <Link href="/home" className="text-blue-500 hover:underline mt-4">
            Back to Home
        </Link>
      </main>
    </div>
  );
}
