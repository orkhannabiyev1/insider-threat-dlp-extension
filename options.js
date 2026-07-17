const fields = ["telegramBotToken", "telegramChatId", "webhookUrl"];

async function load() {
  const data = await chrome.storage.local.get(fields);
  fields.forEach((f) => {
    const el = document.getElementById(f);
    if (data[f]) el.value = data[f];
  });
}

async function save() {
  const values = {};
  fields.forEach((f) => {
    values[f] = document.getElementById(f).value.trim();
  });
  await chrome.storage.local.set(values);
  const status = document.getElementById("status");
  status.textContent = "Yadda saxlanıldı ✅";
  setTimeout(() => (status.textContent = ""), 2000);
}

document.getElementById("save").addEventListener("click", save);
document.addEventListener("DOMContentLoaded", load);
