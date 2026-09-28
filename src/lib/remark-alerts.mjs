/**
 * GitHub-style alerts in Markdown and MDX:
 *
 *   > [!TIP]
 *   > The same lines work over a socket.
 *
 * becomes <aside class="alert alert-tip"><p class="alert-label">Tip</p><p>…</p></aside>.
 * Styles live in src/styles/global.css. No dependencies: a plain walk over the mdast tree.
 */
const LABELS = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
};

const MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/;

function transform(node) {
  if (!Array.isArray(node.children)) return;
  for (const child of node.children) {
    if (child.type === 'blockquote') convert(child);
    transform(child);
  }
}

function convert(quote) {
  const paragraph = quote.children?.[0];
  const first = paragraph?.type === 'paragraph' ? paragraph.children?.[0] : undefined;
  if (!first || first.type !== 'text') return;
  const match = MARKER.exec(first.value);
  if (!match) return;

  const kind = match[1].toLowerCase();
  first.value = first.value.slice(match[0].length);
  if (first.value === '') paragraph.children.shift();
  if (paragraph.children.length === 0) quote.children.shift();

  quote.data = {
    hName: 'aside',
    hProperties: { className: ['alert', `alert-${kind}`] },
  };
  quote.children.unshift({
    type: 'paragraph',
    data: { hName: 'p', hProperties: { className: ['alert-label'] } },
    children: [{ type: 'text', value: LABELS[kind] }],
  });
}

export default function remarkAlerts() {
  return (tree) => transform(tree);
}
