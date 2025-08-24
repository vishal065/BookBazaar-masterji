type itemType = {
  id: string;
  orderId: string;
  bookId: string;
  quantity: number;
  price: string;
}[];

type dbBooksType = {
  id: string;
  title: string;
  price: string;
  stock: number;
}[];

export function generateOrderTableData(items: itemType, dbBooks: dbBooksType) {
  return items
    .map((i) => {
      const b = dbBooks.find((bb) => bb.id === i.bookId);
      const title = b?.title ?? `Book ID: ${i.bookId}`;
      const qty = i.quantity;
      const total = (qty * Number(i.price)).toFixed(2);

      return `
    <tr>
      <td style="padding: 8px 10px; border-bottom: 1px solid #eee;">${title} × ${qty}</td>
      <td style="padding: 8px 10px; text-align: right; border-bottom: 1px solid #eee;">₹${total}</td>
    </tr>
  `;
    })
    .join("");
}

export function generateOrderEmailHTML(
  order: { id: string; totalAmount: number },
  itemLines: string,
) {
  const emailHTML = `
<div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 30px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">

    <h2 style="color: #2c3e50; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; margin-top: 0;">
      ✅ Thanks for your purchase!
    </h2>

    <p style="font-size: 16px; margin: 20px 0 10px;">
      <strong>Order ID:</strong> <span style="color: #555;">${order.id}</span>
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th style="text-align: left; padding: 10px; font-size: 14px; border-bottom: 1px solid #ddd;">Item</th>
          <th style="text-align: right; padding: 10px; font-size: 14px; border-bottom: 1px solid #ddd;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemLines}
      </tbody>
    </table>

    <p style="font-size: 16px; margin: 10px 0;">
      <strong>Total:</strong> <span style="color: #000;">₹${Number(order.totalAmount).toFixed(2)}</span>
    </p>

    <p style="font-size: 16px; margin: 10px 0;">
      <strong>Status:</strong>
      <span style="color: green; font-weight: bold;">PAID</span>
    </p>

    <p style="margin-top: 30px; font-size: 14px; color: #999;">
      If you have any questions, feel free to reply to this email. We're here to help!
    </p>

  </div>
</div>
`;
  return emailHTML;
}
