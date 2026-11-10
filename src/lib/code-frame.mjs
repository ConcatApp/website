// A Shiki transformer that frames every highlighted code block: a head strip naming the
// language and holding a Copy button, over the block. Built into the HTML, so the label shows
// without JavaScript; src/scripts/copy-code.ts makes the button work.

const LABELS = {
  json: 'JSON',
  jsonc: 'JSON',
  sh: 'Shell',
  bash: 'Shell',
  shell: 'Shell',
  zsh: 'Shell',
  console: 'Terminal',
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  rust: 'Rust',
  rs: 'Rust',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  js: 'JavaScript',
  javascript: 'JavaScript',
  py: 'Python',
  python: 'Python',
  toml: 'TOML',
  yaml: 'YAML',
  yml: 'YAML',
  proto: 'Protobuf',
  protobuf: 'Protobuf',
  go: 'Go',
  html: 'HTML',
  css: 'CSS',
  text: 'Text',
  txt: 'Text',
  plaintext: 'Text',
};

const COPY_ICON = {
  type: 'element',
  tagName: 'svg',
  properties: {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ariaHidden: 'true',
    className: ['code-frame-icon'],
  },
  children: [
    {
      type: 'element',
      tagName: 'rect',
      properties: { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' },
      children: [],
    },
    {
      type: 'element',
      tagName: 'path',
      properties: { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' },
      children: [],
    },
  ],
};

const el = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });

/** @type {import('shiki').ShikiTransformer} */
export const codeFrame = {
  name: 'code-frame',
  root(root) {
    const lang = String(this.options.lang ?? '').toLowerCase();
    const label = LABELS[lang] ?? (lang && lang !== 'plaintext' ? lang.toUpperCase() : 'Code');
    const blocks = root.children;
    root.children = [
      el('div', { className: ['code-frame'] }, [
        el('div', { className: ['code-frame-head'] }, [
          el('span', { className: ['code-frame-lang'] }, [{ type: 'text', value: label }]),
          el(
            'button',
            {
              type: 'button',
              className: ['code-frame-copy'],
              dataCopy: '',
              ariaLabel: 'Copy code',
            },
            [
              COPY_ICON,
              el('span', { className: ['code-frame-copy-text'] }, [
                { type: 'text', value: 'Copy' },
              ]),
            ],
          ),
        ]),
        ...blocks,
      ]),
    ];
  },
};
