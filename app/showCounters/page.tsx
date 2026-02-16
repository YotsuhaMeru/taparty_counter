import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { DeleteButton } from './delete-button';

// ==========================================
// 設定推測用データ定義
// 各項目の設定1〜6の確率分母を入力（1/xx の xx の部分）。
// 入力例: 'カバン回数': [100.5, 98.2, 95.1, 92.4, 88.6, 85.3],
// *確率情報がない（比較しない）場合は全て 0 のまま
// ==========================================
const SETTING_DENOMINATORS: { [key: string]: number[] } = {
  // 基本情報
  'ゲーム数': [0, 0, 0, 0, 0, 0],
  '総ゲーム数': [0, 0, 0, 0, 0, 0],
  '通常・ATゲーム数': [0, 0, 0, 0, 0, 0],
  '最大TOTAL枚数': [0, 0, 0, 0, 0, 0],
  '共通ベル回数': [0, 0, 0, 0, 0, 0],
  'カバン回数': [72.8, 71.5, 70.3, 69.1, 68.0, 66.9],
  'チェリー回数': [74.5, 72.7, 70.9, 69.3, 67.7, 66.2],
  'チャンス目A回数': [172.5, 171.6, 170.7, 169.8, 168.9, 168.0],
  'チャンス目B回数': [174.3, 172.5, 170.7, 168.9, 167.2, 165.5],
  'チャンスチェリー回数': [0, 0, 0, 0, 0, 0],

  // BONUS/CZ/AT情報
  'HBB回数': [0, 0, 0, 0, 0, 0],
  'BB回数': [324.4, 309.1, 295.2, 282.2, 270.8, 260.1],
  'BB（赤）回数': [0, 0, 0, 0, 0, 0],
  'BB（青）回数': [0, 0, 0, 0, 0, 0],
  'BB（黒）回数': [0, 0, 0, 0, 0, 0],
  'MB回数': [537.2, 528.5, 520.1, 512.0, 504.1, 496.5],
  'デート直撃ボーナス回数': [3263.2, 1826.5, 2603.3, 1235.1, 1737.2, 928.9],
  '通常時MB回数（デートタイム直撃を除く）': [0, 0, 0, 0, 0, 0],
  '通常時MBからエンジェルチャンス当選回数': [0, 0, 0, 0, 0, 0],
  'アトラクションゾーン回数': [0, 0, 0, 0, 0, 0],
  'アトラクションゾーン成功回数': [0, 0, 0, 0, 0, 0],
  'エンジェルチャンス回数': [0, 0, 0, 0, 0, 0],
  'エンジェルチャンスEX回数': [0, 0, 0, 0, 0, 0],
  'デートタイム突入回数': [0, 0, 0, 0, 0, 0],
  'デートタイム総回数': [0, 0, 0, 0, 0, 0],

  // BONUS重複情報
  'チェリー重複回数': [908.5, 886.6, 864.6, 845.1, 825.6, 807.3],
  '赤BB＋チェリー重複回数': [8192.0, 6553.6, 5461.3, 4681.1, 4096.0, 3640.9],
  '青BB＋チェリー重複回数': [0, 0, 0, 0, 0, 0],
  '黒BB＋チェリー重複回数': [0, 0, 0, 0, 0, 0],
  'MB＋チェリー重複回数': [0, 0, 0, 0, 0, 0],
  'チャンス目A重複回数': [1071.4, 1040.0, 1010.1, 975.9, 948.9, 923.1],
  '赤BB＋チャンス目A重複回数': [0, 0, 0, 0, 0, 0],
  '青BB＋チャンス目A重複回数': [0, 0, 0, 0, 0, 0],
  '黒BB＋チャンス目A重複回数': [0, 0, 0, 0, 0, 0],
  'MB＋チャンス目A重複回数': [2184.5, 2048.0, 1927.5, 1820.4, 1724.6, 1638.4],
  'チャンス目B重複回数': [624.7, 601.0, 580.6, 559.3, 541.1, 523.7],
  '赤BB＋チャンス目B重複回数': [0, 0, 0, 0, 0, 0],
  '青BB＋チャンス目B重複回数': [1985.9, 1771.2, 1598.4, 1456.4, 1337.5, 1236.5],
  '黒BB＋チャンス目B重複回数': [0, 0, 0, 0, 0, 0],
  'MB＋チャンス目B重複回数': [0, 0, 0, 0, 0, 0],
  'かばん重複回数': [2510.3, 2166.7, 1952.8, 1727.5, 1545.5, 1423.4],
  '赤BB＋かばん重複回数': [0, 0, 0, 0, 0, 0],
  '黒BB＋かばん重複回数': [3276.8, 2730.7, 2340.6, 2048.0, 1820.4, 1638.4],
  'その他契機重複回数': [0, 0, 0, 0, 0, 0],
  '黒BB＋リーチ目A重複回数': [0, 0, 0, 0, 0, 0],
  '赤BB＋リーチ目B重複回数': [0, 0, 0, 0, 0, 0],
  '黒BB＋リプレイ重複回数': [0, 0, 0, 0, 0, 0],
  '青BB＋共通ベル重複回数': [0, 0, 0, 0, 0, 0],
  '特定ボーナス回数　 (※1)': [720.2, 636.3, 569.9, 516.0, 471.5, 434.0],
};

// 設定推計ロジック
function calculateEstimatedSetting(rateStr: string, itemName: string): string | null {
  // レート文字列から分母を抽出 "(1/123.45)" -> 123.45
  const match = rateStr.match(/\(1\/([\d.]+)\)/);
  if (!match) return null;

  const actualDenom = parseFloat(match[1]);
  if (isNaN(actualDenom)) return null;

  const settingDenoms = SETTING_DENOMINATORS[itemName];
  // 設定データがない、または全て0の場合は計算しない
  if (!settingDenoms || settingDenoms.every(d => d === 0)) return null;

  // 設定データが有効かチェック（6個あるか）
  if (settingDenoms.length !== 6) return null;

  // 実践値がどの設定の間にあるかを探す
  // 設定は1〜6。i=0が設定1, i=5が設定6
  for (let i = 0; i < settingDenoms.length - 1; i++) {
    const current = settingDenoms[i];
    const next = settingDenoms[i + 1];
    
    // 現在の設定値と次の設定値の間に実践値があるかチェック
    // 分母は小さくなる場合も大きくなる場合もあるので、大小関係を考慮
    const min = Math.min(current, next);
    const max = Math.max(current, next);

    if (actualDenom >= min && actualDenom <= max) {
      // 区間内にある場合、線形補間で設定値を計算
      // ratio = (実践値 - 設定i) / (設定i+1 - 設定i)
      // 推定設定 = (i + 1) + ratio
      // ※ iは0始まりなので、設定値は i+1
      
      const diffTotal = next - current;
      if (diffTotal === 0) continue; // 同じ値の場合はスキップ

      const diffActual = actualDenom - current;
      const ratio = diffActual / diffTotal;
      
      const estimated = (i + 1) + ratio;
      return `設定${estimated.toFixed(2)}`;
    }
  }

  // 範囲外の場合：一番近い設定を表示
  let minDiff = Number.MAX_VALUE;
  let closestSetting = 1;

  settingDenoms.forEach((denom, index) => {
    const diff = Math.abs(denom - actualDenom);
    if (diff < minDiff) {
      minDiff = diff;
      closestSetting = index + 1;
    }
  });

  return `設定${closestSetting.toFixed(2)}`;
}

// 表示設定
const DISPLAY_SECTIONS = [
  {
    key: 'basicInfo',
    title: '基本情報',
    items: [
      'ゲーム数',
      '総ゲーム数',
      '通常・ATゲーム数',
      '最大TOTAL枚数',
      '共通ベル回数',
      'カバン回数',
      'チェリー回数',
      'チャンス目A回数',
      'チャンス目B回数',
      'チャンスチェリー回数',
    ],
  },
  {
    key: 'bonusCZATInfo',
    title: 'BONUS/CZ/AT情報',
    items: [
      'HBB回数',
      'BB回数',
      'BB（赤）回数',
      'BB（青）回数',
      'BB（黒）回数',
      'MB回数',
      'デート直撃ボーナス回数',
      '通常時MB回数（デートタイム直撃を除く）',
      '通常時MBからエンジェルチャンス当選回数',
      'アトラクションゾーン回数',
      'アトラクションゾーン成功回数',
      'エンジェルチャンス回数',
      'エンジェルチャンスEX回数',
      'デートタイム突入回数',
      'デートタイム総回数',
    ],
  },
  {
    key: 'bonusOverlapInfo',
    title: 'BONUS重複情報',
    items: [
      'チェリー重複回数',
      '赤BB＋チェリー重複回数',
      '青BB＋チェリー重複回数',
      '黒BB＋チェリー重複回数',
      'MB＋チェリー重複回数',
      'チャンス目A重複回数',
      '赤BB＋チャンス目A重複回数',
      '青BB＋チャンス目A重複回数',
      '黒BB＋チャンス目A重複回数',
      'MB＋チャンス目A重複回数',
      'チャンス目B重複回数',
      '赤BB＋チャンス目B重複回数',
      '青BB＋チャンス目B重複回数',
      '黒BB＋チャンス目B重複回数',
      'MB＋チャンス目B重複回数',
      'かばん重複回数',
      '赤BB＋かばん重複回数',
      '黒BB＋かばん重複回数',
      'その他契機重複回数',
      '黒BB＋リーチ目A重複回数',
      '赤BB＋リーチ目B重複回数',
      '黒BB＋リプレイ重複回数',
      '青BB＋共通ベル重複回数',
      { key: '特定ボーナス回数　 (※1)', label: '特定ボーナス回数' },
    ],
  },
];

// データの型定義（簡易的）
interface CounterDataValue {
  value?: string | number;
  rate?: string;
}

interface CounterSection {
  [key: string]: CounterDataValue | number;
}

interface CounterData {
  [key: string]: CounterSection | number;
}

export default async function ShowCountersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const userId = await verifySession();
  const params = await searchParams;

  if (!userId) {
    redirect('/');
  }

  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const pageSize = 1; // 詳細表示なので少なめに
  const skip = (page - 1) * pageSize;

  const { records, total } = await db.getCounterRecords(userId, skip, pageSize);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col items-center min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
      <main className="w-full max-w-4xl px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">カウンター履歴</h1>
          <a href="/home" className="text-blue-500 hover:underline">
            ホームに戻る
          </a>
        </div>

        <div className="space-y-8">
          {records.map((record) => {
            const data = record.data as CounterData;
            return (
              <div
                key={record.id}
                className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {new Date(record.createdAt).toLocaleString()}
                    </span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="text-xs text-gray-400">ID: {record.id.substring(0, 8)}</span>
                  </div>
                  <DeleteButton id={record.id} />
                </div>
                <div className="p-6">
                  {DISPLAY_SECTIONS.map((section) => {
                    const sectionData = data[section.key];
                    if (!sectionData || typeof sectionData !== 'object') {
                      return null;
                    }

                    // セクション内の有効な項目数をチェック（オプション）
                    // ここでは表示時にフィルタリングするので、一旦レンダリングして中身が空ならCSSで隠す等の工夫もできるが、
                    // Reactなのでitems.mapの結果を見て判断するのがきれい。
                    
                    const validItems = section.items.map((item) => {
                      const { key: itemKey, label } =
                        typeof item === 'string'
                          ? { key: item, label: item }
                          : item;
                      const val = (sectionData as CounterSection)[itemKey] as CounterDataValue;
                      if (!val) return null;
                      return { itemKey, label, val };
                    }).filter((item) => item !== null);

                    if (validItems.length === 0) return null;

                    return (
                      <div key={section.key} className="mb-6 last:mb-0">
                        <h3 className="text-lg font-bold mb-3 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-100 dark:border-indigo-900 pb-1">
                          {section.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {validItems.map(({ itemKey, label, val }) => {
                            if (!val) return null; // 型ガードのため再確認（filter済みだが）

                            return (
                              <div
                                key={itemKey}
                                className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md flex flex-col"
                              >
                                <span
                                  className="text-xs text-gray-500 dark:text-gray-400 mb-1 block truncate"
                                  title={label}
                                >
                                  {label}
                                </span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {val.value !== undefined ? val.value : ''}
                                  {val.rate !== undefined && (
                                    <>
                                      <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                                        {val.rate}
                                      </span>
                                      {(() => {
                                        const estimated = calculateEstimatedSetting(val.rate, itemKey);
                                        if (estimated) {
                                          return (
                                            <span className="ml-2 text-xs font-bold text-pink-600 dark:text-pink-400">
                                              {estimated}
                                            </span>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </>
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {records.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              履歴がありません。
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <a
                href={`/showCounters?page=${page - 1}`}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
              >
                前へ
              </a>
            )}
            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded border">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={`/showCounters?page=${page + 1}`}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
              >
                次へ
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
