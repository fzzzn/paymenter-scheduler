import type { Invoice } from "./models/invoice";
import { getInvoices, payInvoice } from "./services/invoice/invoice.service";

async function main() {
  try {
    // Get current time in WIB
    const now = new Date();
    const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);

    console.log(`🕒 Running at: ${wibTime} WIB`);

    const response = await getInvoices();

    const pendingInvoices = response.data.filter(
      (invoice: Invoice) => invoice.status === "pending",
    );

    if (pendingInvoices.length === 0) {
      console.log("No pending invoices.");
      return;
    }

    console.log("Pending Invoices: ", pendingInvoices);
    // console.table(pendingInvoices, [
    //   "id",
    //   "user_id",
    //   "order_id",
    //   "status",
    //   "due_date",
    //   "created_at",
    // ]);

    const enablePayment = process.env.ENABLE_PAYMENT === "true";

    if (!enablePayment) {
      console.log("🚫 Payment is disabled via ENABLE_PAYMENT env variable.");
      return;
    }

    // Pick the first pending invoice to pay
    const invoiceToPay = pendingInvoices[0]!;
    console.log(`Paying invoice #${invoiceToPay.id}...`);

    await payInvoice(invoiceToPay.id, "credits");

    console.log(`✅ Invoice #${invoiceToPay.id} paid successfully!`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
