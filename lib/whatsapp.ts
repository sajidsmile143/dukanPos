import { Sale, Customer, Store } from './types';

/**
 * Format phone number to international wa.me standard format (e.g., 923001234567)
 */
export function formatPhoneNumberForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (!cleaned.startsWith('92') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned;
}

/**
 * Generate WhatsApp URL for Invoice Receipt
 */
export function generateWhatsAppInvoiceUrl(
  sale: Sale,
  store: Store,
  customerPhone?: string
): string {
  const phone = customerPhone ? formatPhoneNumberForWhatsApp(customerPhone) : '';

  const itemsText = sale.items
    .map((item) => `• ${item.product_name} (x${item.quantity}) - PKR ${item.subtotal.toLocaleString()}`)
    .join('\n');

  const text = `🧾 *${store.name}*
*Tax Invoice #${sale.invoice_no}*
----------------------------------------
${itemsText}
----------------------------------------
*Subtotal:* PKR ${sale.subtotal.toLocaleString()}
*Tax (${store.tax_rate}%):* PKR ${sale.tax_amount.toLocaleString()}
${sale.discount > 0 ? `*Discount:* PKR ${sale.discount.toLocaleString()}\n` : ''}*Grand Total:* PKR ${sale.total_amount.toLocaleString()}
*Payment:* ${sale.payment_method.toUpperCase()}
${sale.fbr_invoice_no ? `\n*FBR Ref No:* ${sale.fbr_invoice_no}` : ''}

_Thank you for shopping with us!_
📍 ${store.address || ''}
📞 ${store.phone || ''}`;

  const encoded = encodeURIComponent(text);
  return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

/**
 * Generate WhatsApp URL for Customer Khata Debt Reminder
 */
export function generateWhatsAppKhataReminderUrl(
  customer: Customer,
  store: Store
): string {
  const phone = formatPhoneNumberForWhatsApp(customer.phone);

  const text = `السلام عليكم *${customer.name}* Sahib,

This is a gentle payment reminder from *${store.name}*.

*Current Khata Balance:* PKR ${customer.current_balance.toLocaleString()}

Kindly clear your pending dues at your earliest convenience. Thank you for your continued trust and custom!

📍 ${store.address}
📞 ${store.phone}`;

  const encoded = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${encoded}`;
}
