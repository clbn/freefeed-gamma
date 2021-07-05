export function getCanonicalURL(relativeURL) {
  const a = document.createElement('a');
  a.href = relativeURL;
  return a.href;
}

export function copyToClipboard(text) {
  // 1. Try using Async Clipboard API first

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Copying to clipboard failed (async): ', err));
    return;
  }

  // 2. If not available, fallback to the (deprecated) execCommand

  const textArea = document.createElement('textarea');
  textArea.value = text;

  textArea.style.position = 'fixed'; // Avoid scrolling when focusing the textarea
  textArea.style.top = '0';
  textArea.style.left = '0';
  document.body.appendChild(textArea);

  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Copying to clipboard failed:', err);
  }

  document.body.removeChild(textArea);
}
