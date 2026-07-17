
const CARD_REGEX = /\b(?:\d[ -]*?){13,19}\b/g;

function luhnCheck(numStr) {
  const digits = numStr.replace(/[^0-9]/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function findCardNumbers(text) {
  const matches = text.match(CARD_REGEX) || [];
  return matches.filter(luhnCheck);
}


function randomizeSameFormat(original) {
  return original.replace(/\d/g, () => Math.floor(Math.random() * 10).toString());
}


function maskCard(num) {
  const digits = num.replace(/[^0-9]/g, "");
  return digits.slice(0, 6) + "*".repeat(Math.max(digits.length - 10, 0)) + digits.slice(-4);
}


function getComposeBodies() {
  return document.querySelectorAll('div[aria-label="Message Body"], div[contenteditable="true"][role="textbox"]');
}


function scrubComposeBody(bodyEl) {
  const html = bodyEl.innerHTML;
  const text = bodyEl.innerText;
  const found = findCardNumbers(text);

  if (found.length === 0) return { changed: false, found: [] };

  let newHtml = html;
  const details = [];

  found.forEach((cardNum) => {
    const fake = randomizeSameFormat(cardNum);
    details.push({ original: maskCard(cardNum), replaced: true });
    const escaped = cardNum.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "g");
    newHtml = newHtml.replace(re, fake);
  });

  if (newHtml !== html) {
    bodyEl.innerHTML = newHtml;
    return { changed: true, found: details };
  }
  return { changed: false, found: [] };
}


function findSendButtons() {
  return document.querySelectorAll('div[role="button"][data-tooltip^="Send"], div[role="button"][aria-label^="Send"]');
}

function attachSendInterceptor() {
  document.addEventListener(
    "click",
    (e) => {
      const sendBtn = e.target.closest('div[role="button"][data-tooltip^="Send"], div[role="button"][aria-label^="Send"]');
      if (!sendBtn) return;

      const bodies = getComposeBodies();
      let anyChanged = false;
      let allFound = [];

      bodies.forEach((body) => {
        const result = scrubComposeBody(body);
        if (result.changed) {
          anyChanged = true;
          allFound = allFound.concat(result.found);
        }
      });

      if (anyChanged) {
        chrome.runtime.sendMessage({
          type: "DLP_ALERT",
          payload: {
            url: location.href,
            timestamp: new Date().toISOString(),
            findings: allFound,
          },
        });
      }
    },
    true 
  );
}

attachSendInterceptor();
