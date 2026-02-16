import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export default async function PostNewCounterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const userId = await verifySession();
  const params = await searchParams;

  // 1. 認証チェック
  if (!userId) {
    // 認証されていない場合、ログインページへリダイレクト。
    // returnUrlパラメータを付与して、ログイン後にこのページに戻れるようにする。
    // 現在のクエリパラメータも含めてリダイレクトする
    const currentParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'string') {
          currentParams.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((v) => currentParams.append(key, v));
        }
      });
    }
    const returnUrl = encodeURIComponent(`/postNewCounter?${currentParams.toString()}`);
    redirect(`/?returnUrl=${returnUrl}`);
  }

  // 2. データの保存処理 (dataまたはjsonパラメータがある場合)
  const dataParam = params.data || params.json;
  let message = '';
  
  if (typeof dataParam === 'string') {
    try {
      // Base64デコード
      const jsonString = Buffer.from(dataParam, 'base64').toString('utf-8');
      const jsonData = JSON.parse(jsonString);

      // DBに保存
      await db.createCounterRecord(userId, jsonData);
      // message = 'Counter record saved successfully!';
      
      // 保存後は /showCounters へリダイレクト
      // redirect('/showCounters'); // ここで呼ぶとcatchされてしまう
      
    } catch (error) {
      console.error('Failed to save counter record:', error);
      message = 'Error: Failed to save counter record. Invalid data format.';
    }
    
    // エラーがなければリダイレクト（messageが空なら成功とみなす、あるいはフラグを使う）
    if (!message) {
      redirect('/showCounters');
    }
  }

  // 3. エラー表示のみ（通常はリダイレクトされるため、ここに来るのはエラー時のみか、データがない場合）
  // データがない場合は単にメッセージを表示するだけに留めるか、あるいは何も表示しないか。
  // ここではエラーメッセージがあれば表示し、なければ「データ受信待機中」などを表示する。

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <main className="flex flex-col items-center w-full max-w-4xl px-4 text-center">
        <h1 className="text-3xl font-bold mb-8">Post New Counter</h1>

        {message && (
          <div className={`mb-4 p-4 rounded ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="text-gray-600 dark:text-gray-400">
          <p>Waiting for data post...</p>
          <p className="mt-4 text-sm">
            ブックマークレットを使用して、マイスロのデータをこのページにPOSTしてください。<br />
            データが正常に保存されると、自動的に履歴ページに移動します。
          </p>
        </div>
        
        <div className="mt-8 space-x-4">
             <a href="/home" className="text-blue-500 hover:underline">Back to Home</a>
             <a href="/showCounters" className="text-blue-500 hover:underline">View History</a>
        </div>
      </main>
    </div>
  );
}
