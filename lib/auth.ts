import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-for-development-only'
);

// 環境変数からRP_IDとORIGINを取得するように変更
export const RP_ID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
export const RP_NAME = 'SammyQR Counter';
export const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || `http://${RP_ID}:3000`;

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  (await cookies()).set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function verifySession() {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.sub as string;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete('session');
}
