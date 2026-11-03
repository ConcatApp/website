/**
 * The page side of the media tools: the drop zone (FileDrop.astro) and the progress and result
 * panel (JobStatus.astro). Each tool page wires its own options and calls these on
 * `astro:page-load`.
 */
import { formatBytes, type Job } from '@/scripts/media';

/** Calls `onFile` with each file chosen or dropped on the zone inside `root`. */
export function bindDrop(root: HTMLElement, onFile: (file: File) => void) {
  const zone = root.querySelector<HTMLElement>('[data-drop]');
  const input = root.querySelector<HTMLInputElement>('[data-drop-input]');
  if (!zone || !input) return;
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) onFile(file);
    input.value = '';
  });
  zone.addEventListener('dragover', (event) => {
    event.preventDefault();
    zone.dataset.over = '';
  });
  zone.addEventListener('dragleave', () => delete zone.dataset.over);
  zone.addEventListener('drop', (event) => {
    event.preventDefault();
    delete zone.dataset.over;
    const file = event.dataTransfer?.files?.[0];
    if (file) onFile(file);
  });
}

/** Shows the chosen file's name and size on the drop zone. */
export function showChosen(root: HTMLElement, file: File) {
  const hint = root.querySelector('[data-drop-hint]');
  if (hint)
    hint.textContent = `${file.name}, ${formatBytes(file.size)}. Choose or drop another to swap.`;
}

/** The progress and result panel inside `root`. */
export function jobView(root: HTMLElement) {
  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const panel = q('[data-job]');
  const running = q('[data-job-running]');
  const result = q('[data-job-result]');
  const error = q('[data-job-error]');
  const bar = q('[data-job-bar]');
  const percent = q('[data-job-percent]');
  const label = q('[data-job-label]');
  const link = q<HTMLAnchorElement>('[data-job-download]');
  let url: string | undefined;
  let current: Job | undefined;

  q('[data-job-cancel]').addEventListener('click', () => current?.cancel());
  document.addEventListener('astro:before-swap', () => url && URL.revokeObjectURL(url), {
    once: true,
  });

  const progress = (p: number) => {
    const pct = Math.max(0, Math.min(100, Math.round(p * 100)));
    bar.style.width = `${pct}%`;
    percent.textContent = `${pct}%`;
  };

  return {
    busy: () => current !== undefined,
    progress,
    /** Runs a job, showing its progress, then its download or its error. */
    async run(start: (onProgress: (p: number) => void) => Job, text: string, before?: number) {
      if (url) URL.revokeObjectURL(url);
      panel.hidden = false;
      running.hidden = false;
      result.hidden = true;
      error.hidden = true;
      label.textContent = text;
      progress(0);
      current = start(progress);
      try {
        const { blob, name } = await current.done;
        url = URL.createObjectURL(blob);
        link.href = url;
        link.download = name;
        q('[data-job-name]').textContent = name;
        const change =
          before && before > 0
            ? `, ${blob.size < before ? `${Math.round((1 - blob.size / before) * 100)}% smaller than` : `${Math.round((blob.size / before - 1) * 100)}% larger than`} the original`
            : '';
        q('[data-job-size]').textContent = `${formatBytes(blob.size)}${change}`;
        result.hidden = false;
      } catch (err) {
        error.textContent = err instanceof Error ? err.message : String(err);
        error.hidden = false;
      } finally {
        running.hidden = true;
        current = undefined;
      }
    },
    fail(message: string) {
      panel.hidden = false;
      running.hidden = true;
      result.hidden = true;
      error.textContent = message;
      error.hidden = false;
    },
  };
}
