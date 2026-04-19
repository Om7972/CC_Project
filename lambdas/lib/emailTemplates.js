function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function orderConfirmationHtml({ orderId, totalAmount, items, storeName, estimatedDays = 5 }) {
  const rows = (items || [])
    .map(
      (i) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(i.name)}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">$${Number(i.price).toFixed(2)}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Order confirmation</title></head>
<body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
        <tr><td style="padding:28px 28px 8px;">
          <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#38bdf8;">CloudMart</div>
          <h1 style="margin:12px 0 0;font-size:22px;color:#f8fafc;">Thanks for your order</h1>
          <p style="margin:12px 0 0;font-size:14px;color:#94a3b8;">Order <strong style="color:#f8fafc;">${escapeHtml(orderId)}</strong> is confirmed.</p>
        </td></tr>
        <tr><td style="padding:0 28px 16px;">
          <p style="font-size:14px;color:#cbd5e1;">Sold by <strong>${escapeHtml(storeName || 'Vendor')}</strong>. Estimated delivery in about <strong>${estimatedDays}</strong> business days.</p>
        </td></tr>
        <tr><td style="padding:0 28px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px;border:1px solid #334155;">
            <thead><tr>
              <th align="left" style="padding:10px 12px;font-size:12px;color:#94a3b8;">Item</th>
              <th style="padding:10px 12px;font-size:12px;color:#94a3b8;">Qty</th>
              <th align="right" style="padding:10px 12px;font-size:12px;color:#94a3b8;">Price</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="margin:16px 0 0;font-size:18px;font-weight:700;color:#38bdf8;">Total: $${Number(totalAmount).toFixed(2)}</p>
        </td></tr>
        <tr><td style="padding:16px 28px 28px;border-top:1px solid #334155;font-size:12px;color:#64748b;">
          You will receive shipping updates from CloudMart and your seller.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function vendorNewOrderHtml({ orderId, totalAmount, buyerEmail, items }) {
  const rows = (items || [])
    .map(
      (i) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(i.name)}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${i.quantity}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>New order</title></head>
<body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
        <tr><td style="padding:28px;">
          <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#a78bfa;">Vendor alert</div>
          <h1 style="margin:12px 0 0;font-size:22px;color:#f8fafc;">New order received</h1>
          <p style="margin:12px 0 0;font-size:14px;color:#94a3b8;">Order <strong style="color:#f8fafc;">${escapeHtml(orderId)}</strong> · Total <strong style="color:#f8fafc;">$${Number(totalAmount).toFixed(2)}</strong></p>
          <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">Buyer contact: ${escapeHtml(buyerEmail)}</p>
        </td></tr>
        <tr><td style="padding:0 28px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px;border:1px solid #334155;">
            <thead><tr>
              <th align="left" style="padding:10px 12px;font-size:12px;color:#94a3b8;">Item</th>
              <th style="padding:10px 12px;font-size:12px;color:#94a3b8;">Qty</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function weeklyVendorReportHtml({ storeName, weekLabel, rows }) {
  const bodyRows = rows
    .map(
      (r) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(r.day)}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${r.orders}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${r.units}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">$${r.revenue.toFixed(2)}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Weekly report</title></head>
<body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
        <tr><td style="padding:28px;">
          <h1 style="margin:0;font-size:22px;color:#f8fafc;">Weekly performance · ${escapeHtml(storeName)}</h1>
          <p style="margin:12px 0 0;font-size:14px;color:#94a3b8;">${escapeHtml(weekLabel)}</p>
        </td></tr>
        <tr><td style="padding:0 28px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px;border:1px solid #334155;">
            <thead><tr>
              <th align="left" style="padding:10px 12px;font-size:12px;color:#94a3b8;">Day</th>
              <th align="right" style="padding:10px 12px;font-size:12px;color:#94a3b8;">Orders</th>
              <th align="right" style="padding:10px 12px;font-size:12px;color:#94a3b8;">Units</th>
              <th align="right" style="padding:10px 12px;font-size:12px;color:#94a3b8;">Revenue</th>
            </tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

module.exports = {
  orderConfirmationHtml,
  vendorNewOrderHtml,
  weeklyVendorReportHtml,
  escapeHtml,
};
