'use client';

import { deleteCounter } from '@/app/actions';
import { useTransition } from 'react';

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm('本当に削除しますか？')) {
          startTransition(async () => {
            await deleteCounter(id);
          });
        }
      }}
      style={{ backgroundColor: '#dc2626' }}
      className={`bg-red-600 text-white border border-red-700 px-4 py-2 rounded shadow-sm hover:bg-red-700 text-sm font-bold transition-colors ${
        isPending ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isPending ? '削除中...' : '削除'}
    </button>
  );
}
