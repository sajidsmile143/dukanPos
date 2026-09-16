import { Sale } from './types';

const PENDING_SALES_KEY = 'dukaan_pending_offline_sales';

export function getPendingOfflineSales(): Sale[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(PENDING_SALES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read offline sales queue:', err);
    return [];
  }
}

export function queueOfflineSale(sale: Sale): void {
  if (typeof window === 'undefined') return;
  try {
    const queue = getPendingOfflineSales();
    queue.push(sale);
    localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to queue offline sale:', err);
  }
}

export function clearPendingOfflineSales(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PENDING_SALES_KEY);
  } catch (err) {
    console.error('Failed to clear pending offline queue:', err);
  }
}

export async function flushPendingOfflineSales(
  syncCallback: (sale: Sale) => Promise<boolean>
): Promise<{ success: number; failed: number }> {
  const queue = getPendingOfflineSales();
  if (queue.length === 0) return { success: 0, failed: 0 };

  let successCount = 0;
  let failedCount = 0;
  const remainingQueue: Sale[] = [];

  for (const sale of queue) {
    try {
      const ok = await syncCallback(sale);
      if (ok) {
        successCount++;
      } else {
        failedCount++;
        remainingQueue.push(sale);
      }
    } catch {
      failedCount++;
      remainingQueue.push(sale);
    }
  }

  localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(remainingQueue));
  return { success: successCount, failed: failedCount };
}
