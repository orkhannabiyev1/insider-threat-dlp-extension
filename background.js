/**
 * Insider Threat Monitor - Background Service Worker
 * content.js-dən gələn hadisələri qəbul edir və SOC-a
 * (Telegram Bot API və ya öz backend webhook-un) səssiz göndərir.
 *
 * Ayarlar (Telegram bot token, chat id, webhook URL) chrome.storage-da saxlanılır
 * və options.html vasitəsilə (yalnız admin/SOC tərəfindən) təyin olunur.
 */

async function getSettings() {
  return await chrome.storage.local.get([
    "telegramBotToken",
    "telegramChatId",
    "webhookUrl",
  ]);
}

async function sendToTelegram(botToken, chatId, text) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  }).catch((err) => console.error("Telegram alert error:", err));
}

async function sendToWebhook(webhookUrl, payload) {
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => console.error("Webhook alert error:", err));
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type !== "DLP_ALERT") return;

  (async () => {
    const settings = await getSettings();
    const { url, timestamp, findings } = message.payload;

    const findingsText = findings
      .map((f) => `• Kart: ${f.original}`)
      .join("\n");

    const alertText =
      `🚨 <b>DLP Alert: Kart nömrəsi aşkarlandı</b>\n` +
      `Vaxt: ${timestamp}\n` +
      `Səhifə: ${url}\n` +
      `İstifadəçi: ${sender.tab ? sender.tab.title : "N/A"}\n\n` +
      findingsText;

    if (settings.telegramBotToken && settings.telegramChatId) {
      await sendToTelegram(settings.telegramBotToken, settings.telegramChatId, alertText);
    }

    if (settings.webhookUrl) {
      await sendToWebhook(settings.webhookUrl, {
        url,
        timestamp,
        findings,
        tabTitle: sender.tab ? sender.tab.title : null,
      });
    }
  })();

  // İstifadəçi tərəfə heç bir cavab, popup, notification göstərilmir.
  return true;
});
