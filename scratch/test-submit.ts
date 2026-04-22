import { submitComplaint } from '../src/lib/server/complaints';

async function run() {
  try {
    const res = await submitComplaint({
      category: "Test",
      product: "Test",
      description: "This is a test description with 30 characters long.",
      preferred_resolution: "Other",
      financial_loss_customer: null,
      attachment_urls: [],
      customer_id: "c0000001-0000-0000-0000-000000000001"
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
