import { generateRegistrationOptions } from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import { db } from '@/lib/db';
import { RP_ID, RP_NAME } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { username } = body;

  const user = await db.getUserByUsername(username);
  
  // 既存ユーザーがいる場合はエラーを返す
  if (user) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: username,
    attestationType: 'none',
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
  });

  // PendingUserとして保存
  await db.createPendingUser(username, options.challenge);

  return NextResponse.json(options);
}
