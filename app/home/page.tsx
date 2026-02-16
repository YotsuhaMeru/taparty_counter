import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { logout } from '../actions';

export default async function SuccessPage() {
  const userId = await verifySession();

  if (!userId) {
    redirect('/');
  }

  const user = await db.getUser(userId);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          Home
        </h1>
        <p className="text-xl">
          Welcome back, {user?.username}
        </p>

        <div className="flex gap-4 mt-8">
          <Link
            href="/voiceCounter"
            className="px-6 py-3 bg-blue-600 dark:text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voice Counter
          </Link>
          <Link
            href="/showCounters"
            className="px-6 py-3 bg-green-600 dark:text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Counters
          </Link>
        </div>

        <form action={logout}>
          <button type="submit" className="mt-8 text-gray-500 hover:underline bg-transparent border-none cursor-pointer">
            Logout
          </button>
        </form>
      </main>
    </div>
  );
}
