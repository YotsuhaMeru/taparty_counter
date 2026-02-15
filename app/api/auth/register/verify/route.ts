import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { db } from '@/lib/db';
import { RP_ID, ORIGIN, createSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, response } = body;

  const pendingUser = await db.getPendingUserByUsername(username);
  if (!pendingUser || !pendingUser.currentChallenge) {
    return NextResponse.json({ error: 'Pending user not found or no challenge' }, { status: 400 });
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: pendingUser.currentChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  }

  if (verification.verified && verification.registrationInfo) {
    const { credential } = verification.registrationInfo;

    // @simplewebauthn/server v10+ (including v13) returns credential info in `credential` property
    const { id, publicKey, counter } = credential;

    // publicKey is Uint8Array, convert to Base64URL for storage
    const credentialPublicKeyBase64 = Buffer.from(publicKey).toString('base64url');

    // ユーザーを正式に作成
    const user = await db.createUser(username, pendingUser.id);

    await db.addDevice(user.id, {
      credentialID: id,
      credentialPublicKey: credentialPublicKeyBase64,
      counter: counter,
      transports: response.response.transports,
    });

    // PendingUserを削除
    await db.deletePendingUser(pendingUser.id);
    
    await createSession(user.id);

    return NextResponse.json({ verified: true });
  }

  return NextResponse.json({ verified: false }, { status: 400 });
}
