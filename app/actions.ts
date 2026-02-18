'use server';

import { deleteSession, verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createVoiceCounterSession(name: string) {
  console.log('createVoiceCounterSession called with name:', name);
  const userId = await verifySession();
  console.log('userId:', userId);
  
  if (!userId) {
    console.error('Unauthorized: No user ID found');
    throw new Error('Unauthorized');
  }

  try {
    const session = await db.createVoiceCounterSession(userId, name);
    console.log('Session created:', session.id);
    revalidatePath('/voiceCounter');
    return session;
  } catch (error) {
    console.error('Failed to create voice counter session:', error);
    throw new Error('Failed to create voice counter session');
  }
}

export async function updateVoiceCounterSession(sessionId: string, counts: { [key: string]: number }, lastClientTimestamp?: number) {
  const userId = await verifySession();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    await db.updateVoiceCounterSession(userId, sessionId, counts, lastClientTimestamp);
    revalidatePath(`/voiceCounter/${sessionId}`);
  } catch (error) {
    console.error('Failed to update voice counter session:', error);
    throw new Error('Failed to update voice counter session');
  }
}

export async function getVoiceCounterSessions() {
  const userId = await verifySession();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const sessions = await db.getVoiceCounterSessions(userId);
    return sessions;
  } catch (error) {
    console.error('Failed to get voice counter sessions:', error);
    throw new Error('Failed to get voice counter sessions');
  }
}

export async function getVoiceCounterSession(sessionId: string) {
  const userId = await verifySession();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const session = await db.getVoiceCounterSession(userId, sessionId);
    return session;
  } catch (error) {
    console.error('Failed to get voice counter session:', error);
    throw new Error('Failed to get voice counter session');
  }
}

export async function logout() {
  await deleteSession();
  redirect('/');
}

export async function deleteCounter(recordId: string) {
  const userId = await verifySession();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    await db.deleteCounterRecord(userId, recordId);
    revalidatePath('/showCounters');
  } catch (error) {
    console.error('Failed to delete counter record:', error);
    throw new Error('Failed to delete counter record');
  }
}
