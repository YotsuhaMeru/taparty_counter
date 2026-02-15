import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { db } from '@/lib/db';
import { RP_ID } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { username } = body;

  const user = await db.getUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 });
  }

  console.log('Login Options - RP_ID:', RP_ID);
  // console.log('Login Options - User Devices:', JSON.stringify(user.devices));

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: user.devices.map((dev) => ({
      id: dev.credentialID,
      type: 'public-key',
      // transportsを指定すると、ブラウザによっては厳密にチェックされて認証器が見つからない場合があるため、一旦除外
      // transports: dev.transports as AuthenticatorTransport[],
    })),
    userVerification: 'preferred',
  });

  await db.updateUser(user.id, { currentChallenge: options.challenge });

  return NextResponse.json(options);
}
