'use client';

import { startRegistration, startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthFormContent />
    </Suspense>
  );
}

function AuthFormContent() {
  const [username, setUsername] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const addLog = (msg: string) => {
    console.log(msg);
    setDebugLog((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  useEffect(() => {
    if (!browserSupportsWebAuthn()) {
      setIsSupported(false);
      setMessage('このブラウザまたは環境はWebAuthnをサポートしていません。');
      addLog('WebAuthn not supported');
    } else {
      addLog('WebAuthn supported');
    }
  }, []);

  const handleRegister = async () => {
    setMessage('');
    setDebugLog([]);
    addLog('Starting registration...');
    try {
      // 1. 登録オプションの取得
      addLog('Fetching registration options...');
      const resp = await fetch('/api/auth/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, invitationCode }),
      });
      
      if (!resp.ok) {
        const error = await resp.json();
        setMessage(`エラー: ${error.error}`);
        addLog(`Error fetching options: ${error.error}`);
        return;
      }

      const options = await resp.json();
      addLog('Options received');

      // 2. ブラウザでの認証器操作
      let attResp;
      try {
        addLog('Starting browser registration...');
        attResp = await startRegistration({ optionsJSON: options });
        addLog('Browser registration completed');
      } catch (error) {
        if ((error as Error).name === 'InvalidStateError') {
          setMessage('エラー: この認証器は既に登録されている可能性があります。');
          addLog('Error: Authenticator already registered');
        } else {
          addLog(`Browser registration error: ${(error as Error).message}`);
          throw error;
        }
        return;
      }

      // 3. 登録結果の検証
      addLog('Verifying registration...');
      const verificationResp = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, response: attResp }),
      });

      const verificationJSON = await verificationResp.json();

      if (verificationJSON.verified) {
        setMessage('登録成功！リダイレクト中...');
        addLog('Registration verified. Redirecting...');
        if (returnUrl) {
          router.push(returnUrl);
        } else {
          router.push('/home');
        }
      } else {
        setMessage(`登録失敗: ${JSON.stringify(verificationJSON)}`);
        addLog(`Verification failed: ${JSON.stringify(verificationJSON)}`);
      }
    } catch (error) {
      console.error(error);
      setMessage(`エラーが発生しました: ${(error as Error).message}`);
      addLog(`Exception: ${(error as Error).message}`);
    }
  };

  const handleLogin = async () => {
    setMessage('');
    setDebugLog([]);
    addLog('Starting login...');
    try {
      // 1. 認証オプションの取得
      addLog('Fetching login options...');
      const resp = await fetch('/api/auth/login/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      
      if (!resp.ok) {
        const error = await resp.json();
        setMessage(`エラー: ${error.error}`);
        addLog(`Error fetching options: ${error.error}`);
        return;
      }
      
      const options = await resp.json();
      addLog('Options received');

      // 2. ブラウザでの認証器操作
      addLog('Starting browser authentication...');
      const asseResp = await startAuthentication({ optionsJSON: options });
      addLog('Browser authentication completed');

      // 3. 認証結果の検証
      addLog('Verifying authentication...');
      const verificationResp = await fetch('/api/auth/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, response: asseResp }),
      });

      const verificationJSON = await verificationResp.json();

      if (verificationJSON.verified) {
        setMessage('ログイン成功！リダイレクト中...');
        addLog('Login verified. Redirecting...');
        if (returnUrl) {
          router.push(returnUrl);
        } else {
          router.push('/home');
        }
      } else {
        setMessage(`ログイン失敗: ${JSON.stringify(verificationJSON)}`);
        addLog(`Verification failed: ${JSON.stringify(verificationJSON)}`);
      }
    } catch (error) {
      console.error(error);
      setMessage(`エラーが発生しました: ${(error as Error).message}`);
      addLog(`Exception: ${(error as Error).message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">
          {isRegistering ? 'Register' : 'Login'}
        </h1>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 border rounded text-black dark:text-white dark:bg-gray-800 dark:border-gray-600"
          />
          {isRegistering && (
            <input
              type="text"
              placeholder="Invitation Code"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="p-2 border rounded text-black dark:text-white dark:bg-gray-800 dark:border-gray-600"
            />
          )}
          <div className="flex flex-col gap-2 justify-center">
            {isRegistering ? (
              <button
                onClick={handleRegister}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1"
              >
                Register
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600 flex-1"
              >
                Login
              </button>
            )}
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setMessage('');
                setDebugLog([]);
              }}
              className="text-sm text-blue-500 hover:underline mt-2"
            >
              {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        {message && (
          <p className="mt-4 text-red-500 max-w-md break-all">{message}</p>
        )}

        {debugLog.length > 0 && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded w-full max-w-md text-left text-xs font-mono overflow-auto max-h-64">
            <h3 className="font-bold mb-2">Debug Log:</h3>
            {debugLog.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
