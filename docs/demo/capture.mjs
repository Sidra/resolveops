import puppeteer from "puppeteer";
import { setTimeout } from "timers/promises";

const BASE = "http://localhost:3100";
const API = "http://localhost:3101";
const OUT = "/Users/sidra/resolveops/docs/demo";

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  // Helper
  async function snap(name, url, waitMs = 2500) {
    if (url) await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
    await setTimeout(waitMs);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
    console.log(`  captured: ${name}.png`);
  }

  // 1. Dashboard
  console.log("1. Dashboard");
  await snap("01-dashboard", `${BASE}/`);

  // 2. Tickets list
  console.log("2. Tickets list");
  await snap("02-tickets-list", `${BASE}/tickets`);

  // 3. Ticket detail — resolved refund (ticket 1)
  console.log("3. Resolved ticket detail");
  // Get ticket IDs from API
  const ticketsRes = await page.evaluate(async (api) => {
    const r = await fetch(`${api}/tickets?page_size=10`);
    return r.json();
  }, API);
  const tickets = ticketsRes.items;

  // Find resolved ticket
  const resolvedTicket = tickets.find((t) => t.status === "resolved");
  if (resolvedTicket) {
    await snap("03-ticket-resolved", `${BASE}/tickets/${resolvedTicket.id}`);
  }

  // 4. Ticket with shadow mode draft (pending, "Wrong size")
  console.log("4. Shadow mode draft ticket");
  const draftTicket = tickets.find((t) => t.subject.includes("Wrong size"));
  if (draftTicket) {
    await snap("04-ticket-shadow-draft", `${BASE}/tickets/${draftTicket.id}`);
  }

  // 5. Escalated ticket with pending action
  console.log("5. Escalated ticket with pending approval");
  const escalatedTicket = tickets.find((t) => t.status === "escalated");
  if (escalatedTicket) {
    await snap("05-ticket-escalated-action", `${BASE}/tickets/${escalatedTicket.id}`);
  }

  // 6. Open ticket — show AI respond + shadow mode toggle
  console.log("6. Open ticket — action bar");
  const openTicket = tickets.find((t) => t.status === "open" && t.channel === "chat");
  if (openTicket) {
    await snap("06-ticket-open-actionbar", `${BASE}/tickets/${openTicket.id}`);
  }

  // 7. Channels page
  console.log("7. Channels page");
  await snap("07-channels", `${BASE}/channels`);

  // 8. Channels — fill email template
  console.log("8. Channels — email template filled");
  await page.goto(`${BASE}/channels`, { waitUntil: "networkidle2" });
  await setTimeout(1500);
  // Click the first template button ("Refund Request")
  const buttons = await page.$$("button");
  for (const btn of buttons) {
    const text = await btn.evaluate((el) => el.textContent);
    if (text.includes("Refund Request")) {
      await btn.click();
      break;
    }
  }
  await setTimeout(500);
  await snap("08-channels-email-filled");

  // 9. Send the email and show result
  console.log("9. Channels — email sent result");
  const sendBtn = await page.$("button:last-of-type");
  for (const btn of buttons) {
    const text = await btn.evaluate((el) => el.textContent);
    if (text.includes("Send Email")) {
      await btn.click();
      break;
    }
  }
  await setTimeout(2000);
  await snap("09-channels-email-sent");

  // 10. Chat widget — pre-chat form
  console.log("10. Chat widget — pre-chat");
  await snap("10-chat-prechat", `${BASE}/chat`);

  // 11. Chat widget — start chat
  console.log("11. Chat widget — start conversation");
  await page.goto(`${BASE}/chat`, { waitUntil: "networkidle2" });
  await setTimeout(1000);
  // Fill form
  const inputs = await page.$$("input");
  if (inputs.length >= 2) {
    await inputs[0].type("demo@example.com");
    await inputs[1].type("Demo User");
  }
  const textarea = await page.$("textarea");
  if (textarea) {
    await textarea.type("Hi, I need help tracking my order #ORD-9999. It should have arrived yesterday.");
  }
  await setTimeout(500);
  await snap("11-chat-form-filled");

  // Click start
  const startBtns = await page.$$("button");
  for (const btn of startBtns) {
    const text = await btn.evaluate((el) => el.textContent);
    if (text.includes("Start Chat")) {
      await btn.click();
      break;
    }
  }
  await setTimeout(2500);
  await snap("12-chat-active");

  // 13. Audit log
  console.log("13. Audit log");
  await snap("13-audit-log", `${BASE}/audit-log`);

  // 14. Playground
  console.log("14. Playground");
  await snap("14-playground", `${BASE}/playground`);

  await browser.close();
  console.log("\nDone! Screenshots saved to docs/demo/");
}

main().catch(console.error);
