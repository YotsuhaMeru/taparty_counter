import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import { db } from '@/lib/db';
import { RP_ID, ORIGIN, createSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, response } = body;

  const user = await db.getUserByUsername(username);
  if (!user || !user.currentChallenge) {
    return NextResponse.json({ error: 'User not found or no challenge' }, { status: 400 });
  }

  const dbDevice = user.devices.find((dev) => dev.credentialID === response.id);
  if (!dbDevice) {
    return NextResponse.json({ error: 'Authenticator not found' }, { status: 400 });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: dbDevice.credentialID,
        publicKey: Buffer.from(dbDevice.credentialPublicKey, 'base64url'),
        counter: dbDevice.counter,
        transports: dbDevice.transports as AuthenticatorTransportFuture[],
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  }

  if (verification.verified) {
    const { authenticationInfo } = verification;
    
    await db.updateUser(user.id, { currentChallenge: undefined });
    
    await db.updateDeviceCounter(dbDevice.credentialID, authenticationInfo.newCounter);

    await createSession(user.id);

    return NextResponse.json({ verified: true });
  }

  return NextResponse.json({ verified: false }, { status: 400 });
}
