import { Sale, Store } from './types';

/**
 * ESC/POS Command Constants for Thermal Printers
 */
const ESC = 0x1b;
const GS = 0x1d;

export function generateEscPosBuffer(sale: Sale, store: Store, width: '58mm' | '80mm' = '80mm'): Uint8Array {
  const encoder = new TextEncoder();
  const buffer: number[] = [];

  // Initialize printer
  buffer.push(ESC, 0x40);

  // Center align & Bold Store Title
  buffer.push(ESC, 0x61, 1); // Center
  buffer.push(ESC, 0x45, 1); // Bold ON
  buffer.push(...Array.from(encoder.encode(`${store.name}\n`)));
  buffer.push(ESC, 0x45, 0); // Bold OFF

  if (store.address) {
    buffer.push(...Array.from(encoder.encode(`${store.address}\n`)));
  }
  if (store.phone) {
    buffer.push(...Array.from(encoder.encode(`Tel: ${store.phone}\n`)));
  }
  if (store.ntn) {
    buffer.push(...Array.from(encoder.encode(`NTN: ${store.ntn} | FBR POS ID: ${store.fbr_pos_id || '123456'}\n`)));
  }

  const lineLength = width === '58mm' ? 32 : 48;
  const divider = '-'.repeat(lineLength) + '\n';

  buffer.push(...Array.from(encoder.encode(divider)));
  buffer.push(ESC, 0x61, 0); // Left align

  buffer.push(...Array.from(encoder.encode(`Invoice #: ${sale.invoice_no}\n`)));
  buffer.push(...Array.from(encoder.encode(`Date: ${new Date(sale.created_at).toLocaleString()}\n`)));
  if (sale.customer_name) {
    buffer.push(...Array.from(encoder.encode(`Customer: ${sale.customer_name}\n`)));
  }
  buffer.push(...Array.from(encoder.encode(divider)));

  // Table Headers
  if (width === '58mm') {
    buffer.push(...Array.from(encoder.encode(`Item             Qty   Price   Total\n`)));
  } else {
    buffer.push(...Array.from(encoder.encode(`Item Description          Qty   Price     Total\n`)));
  }
  buffer.push(...Array.from(encoder.encode(divider)));

  // Items
  for (const item of sale.items) {
    const name = item.product_name.substring(0, width === '58mm' ? 14 : 22).padEnd(width === '58mm' ? 14 : 22);
    const qty = String(item.quantity).padStart(4);
    const price = item.unit_price.toFixed(0).padStart(7);
    const total = item.subtotal.toFixed(0).padStart(8);
    buffer.push(...Array.from(encoder.encode(`${name} ${qty} ${price} ${total}\n`)));
  }

  buffer.push(...Array.from(encoder.encode(divider)));
  buffer.push(ESC, 0x61, 2); // Right align

  buffer.push(...Array.from(encoder.encode(`Subtotal: PKR ${sale.subtotal.toFixed(2)}\n`)));
  buffer.push(...Array.from(encoder.encode(`FBR Tax (${store.tax_rate}%): PKR ${sale.tax_amount.toFixed(2)}\n`)));
  if (sale.discount > 0) {
    buffer.push(...Array.from(encoder.encode(`Discount: PKR ${sale.discount.toFixed(2)}\n`)));
  }

  buffer.push(ESC, 0x45, 1); // Bold ON
  buffer.push(...Array.from(encoder.encode(`GRAND TOTAL: PKR ${sale.total_amount.toFixed(2)}\n`)));
  buffer.push(ESC, 0x45, 0); // Bold OFF

  buffer.push(...Array.from(encoder.encode(`Payment Mode: ${sale.payment_method.toUpperCase()}\n`)));
  if (sale.fbr_invoice_no) {
    buffer.push(...Array.from(encoder.encode(`FBR Invoice #: ${sale.fbr_invoice_no}\n`)));
  }

  buffer.push(ESC, 0x61, 1); // Center align
  buffer.push(...Array.from(encoder.encode(`\nThank you for shopping with us!\nPowered by Dukaan POS\n\n`)));

  // Cut Paper Command
  buffer.push(GS, 0x56, 66, 0);

  return new Uint8Array(buffer);
}

/**
 * Web Serial direct thermal printer printing trigger
 */
export async function printToWebSerial(sale: Sale, store: Store, width: '58mm' | '80mm' = '80mm'): Promise<boolean> {
  if (typeof window === 'undefined' || !('serial' in navigator)) {
    console.warn('Web Serial API is not supported in this browser. Falling back to browser print.');
    return false;
  }

  try {
    const nav = navigator as any;
    const port = await nav.serial.requestPort();
    await port.open({ baudRate: 9600 });
    const writer = port.writable.getWriter();
    const data = generateEscPosBuffer(sale, store, width);
    await writer.write(data);
    writer.releaseLock();
    await port.close();
    return true;
  } catch (err) {
    console.error('Web Serial print failed:', err);
    return false;
  }
}
