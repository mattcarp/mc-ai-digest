import twilio from "twilio";
import { dateSlug } from "./page.js";
import { logInfo, logError } from "./logger.js";

export async function sendDigestSms(date, items, cfg) {
  const sid = cfg.twilio.accountSid;
  const token = cfg.twilio.authToken;

  if (!sid || !token) {
    logInfo("Twilio not configured, skipping SMS");
    return;
  }

  const client = twilio(sid, token);

  const slug = dateSlug(date, cfg.timeZone);
  const base = cfg.output.baseUrl.replace(/\/$/,"");
  const url = `${base}/${slug}`;

  // Cleaner format: Count + top headline + viability score + link
  const count = items.length;
  const topItem = items[0];
  const topHeadline = topItem?.title || "Latest AI news";

  // Include viability score if available
  const scoreInfo = topItem?.viabilityScore > 0
    ? ` [💼 ${topItem.viabilityScore}]`
    : '';

  // Truncate headline if needed to fit in SMS
  const maxHeadlineLength = 90;
  const headline = topHeadline.length > maxHeadlineLength
    ? topHeadline.slice(0, maxHeadlineLength) + "…"
    : topHeadline;

  let body = `Matt's AI Digest (${count} articles)\n\nTop: ${headline}${scoreInfo}\n\n${url}`;

  // SMS limit is 160 chars, but we'll allow up to 320 (2 segments) for readability
  if (body.length > 320) {
    body = body.slice(0,317) + "…";
  }

  try {
    const msg = await client.messages.create({
      body,
      from: cfg.twilio.fromNumber,
      to: cfg.twilio.toNumber
    });
    logInfo(`SMS sent: ${msg.sid}`);
  } catch (err) {
    logError("SMS failure", err);
  }
}
