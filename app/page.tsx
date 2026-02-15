import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AuthForm from './auth-form';

export default async function Home() {
  const userId = await verifySession();

  if (userId) {
    redirect('/home');
  }

  return <AuthForm />;
}
