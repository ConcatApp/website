/**
 * The Copy button on every code block (src/lib/code-frame.mjs): copies the block's text and says
 * so for a moment. One listener on the document, so it keeps working across the ClientRouter's
 * page swaps without being bound again.
 */
const DONE_MS = 1600;

function copyFallback(text: string): boolean {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyFallback(text);
  }
}

if (!(window as unknown as { __copyCode?: boolean }).__copyCode) {
  (window as unknown as { __copyCode?: boolean }).__copyCode = true;
  document.addEventListener('click', async (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-copy]');
    if (!button) return;
    const code = button.closest('.code-frame')?.querySelector('pre code, pre');
    if (!code) return;
    const label = button.querySelector('.code-frame-copy-text');
    const ok = await copy((code.textContent ?? '').replace(/\n$/, ''));
    button.toggleAttribute('data-copied', ok);
    if (label) label.textContent = ok ? 'Copied' : 'Copy failed';
    window.setTimeout(() => {
      button.removeAttribute('data-copied');
      if (label) label.textContent = 'Copy';
    }, DONE_MS);
  });
}
