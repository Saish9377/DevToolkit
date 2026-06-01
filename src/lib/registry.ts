// ============================================================
// DevToolkit — Master Tool Registry
// 37 fully-implemented tools across 10 categories
// ============================================================

export type ToolCategory =
  | 'json' | 'yaml' | 'xml' | 'html' | 'sql'
  | 'encoding' | 'security' | 'network' | 'generators' | 'utilities';

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  tags: string[];
  popular?: boolean;
  isNew?: boolean;
  features?: string[];
  altKeywords?: string[]; // for SEO
}

export interface ToolCollection {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  toolSlugs: string[];
}

export interface ToolRecipe {
  slug: string;
  name: string;
  description: string;
  icon: string;
  steps: string[]; // tool slugs in order
  stepLabels: string[];
}

// ── All 37 Implemented Tools ──────────────────────────────────
export const TOOLS: Tool[] = [
  // ── JSON (9 tools) ───────────────────────────────────────────
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Beautify or minify JSON with recursive key sorting, auto-repair, and structural analysis.',
    category: 'json',
    icon: '{ }',
    tags: ['format', 'beautify', 'minify', 'repair', 'prettify'],
    popular: true,
    features: ['explain', 'tree', 'copy-as-code', 'history', 'share'],
    altKeywords: ['json pretty print', 'json beautifier', 'json minifier online', 'format json online'],
  },
  {
    slug: 'json-validator',
    name: 'JSON Validator',
    description: 'Validate JSON syntax with line-number error pinpointing and clear diagnostic descriptions.',
    category: 'json',
    icon: '✓',
    tags: ['validate', 'lint', 'syntax', 'check'],
    popular: true,
    features: ['explain', 'error-detect', 'history'],
    altKeywords: ['json lint', 'validate json online', 'json checker', 'json syntax checker'],
  },
  {
    slug: 'json-minifier',
    name: 'JSON Minifier',
    description: 'Strip whitespace from JSON to minimize payload size with real-time byte comparison.',
    category: 'json',
    icon: '⬡',
    tags: ['minify', 'compress', 'size', 'optimize'],
    features: ['history', 'share'],
    altKeywords: ['compress json', 'json compressor', 'minify json online'],
  },
  {
    slug: 'json-diff',
    name: 'JSON Diff',
    description: 'Find structural differences between two JSON objects with color-coded output.',
    category: 'json',
    icon: '⟺',
    tags: ['diff', 'compare', 'difference', 'delta'],
    popular: true,
    features: ['history'],
    altKeywords: ['compare json online', 'json compare tool', 'json difference checker'],
  },
  {
    slug: 'json-to-yaml',
    name: 'JSON to YAML',
    description: 'Convert JSON to clean, readable YAML instantly with recursive key sorting.',
    category: 'json',
    icon: '↓',
    tags: ['convert', 'yaml', 'transform'],
    popular: true,
    features: ['history', 'share'],
    altKeywords: ['json to yaml converter', 'convert json yaml online'],
  },
  {
    slug: 'json-to-typescript',
    name: 'JSON to TypeScript & Zod',
    description: 'Transform JSON to production-ready TypeScript interfaces or Zod schemas instantly.',
    category: 'json',
    icon: 'TS',
    tags: ['typescript', 'zod', 'types', 'schema', 'interface'],
    popular: true,
    isNew: true,
    features: ['explain', 'history', 'share'],
    altKeywords: ['json to typescript interface', 'generate typescript from json', 'json to zod schema'],
  },
  {
    slug: 'json-schema-generator',
    name: 'JSON Schema Generator',
    description: 'Generate high-quality JSON Schemas from your data. Supports Draft 7 with AJV validation.',
    category: 'json',
    icon: '◈',
    tags: ['schema', 'draft-7', 'validate', 'generate', 'ajv'],
    popular: true,
    features: ['explain', 'tree', 'history'],
    altKeywords: ['generate json schema', 'json schema from json', 'json to schema online'],
  },
  {
    slug: 'json-flatten',
    name: 'JSON Flatten & Unflatten',
    description: 'Flatten nested JSON into dot notation or unflatten back. Supports custom delimiters.',
    category: 'json',
    icon: '⇉',
    tags: ['flatten', 'unflatten', 'nested', 'dot-notation'],
    features: ['history', 'share'],
    altKeywords: ['flatten json object', 'json dot notation converter'],
  },
  {
    slug: 'json-string-escape',
    name: 'JSON String Escape',
    description: 'Escape or unescape JSON strings with language-specific literal generation.',
    category: 'json',
    icon: '⎛',
    tags: ['escape', 'unescape', 'string', 'encode'],
    features: ['history'],
    altKeywords: ['escape json string', 'json string escaper', 'unescape json'],
  },

  // ── YAML (1 tool) ────────────────────────────────────────────
  {
    slug: 'yaml-to-json',
    name: 'YAML to JSON',
    description: 'Convert YAML to structured JSON. Supports multi-document streams and NDJSON output.',
    category: 'yaml',
    icon: '⇆',
    tags: ['yaml', 'json', 'convert', 'parse'],
    popular: true,
    features: ['explain', 'history', 'share'],
    altKeywords: ['yaml to json converter', 'convert yaml json online', 'parse yaml online'],
  },

  // ── XML (3 tools) ────────────────────────────────────────────
  {
    slug: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Beautify or minify XML data with syntax highlighting and real-time validation.',
    category: 'xml',
    icon: '</>',
    tags: ['xml', 'format', 'beautify', 'prettify'],
    features: ['tree', 'error-detect', 'history'],
    altKeywords: ['format xml online', 'xml beautifier', 'xml pretty print'],
  },
  {
    slug: 'xml-minifier',
    name: 'XML Minifier',
    description: 'Compress XML by removing comments, collapsing whitespace, and merging empty tags.',
    category: 'xml',
    icon: '⊕',
    tags: ['xml', 'minify', 'compress'],
    features: ['history'],
    altKeywords: ['minify xml online', 'compress xml', 'xml compressor'],
  },
  {
    slug: 'xml-validator',
    name: 'XML Validator',
    description: 'Validate XML well-formedness with line-number error pinpointing.',
    category: 'xml',
    icon: '✓',
    tags: ['xml', 'validate', 'lint', 'check'],
    features: ['error-detect', 'history'],
    altKeywords: ['validate xml online', 'xml checker', 'xml syntax validator'],
  },

  // ── HTML (3 tools) ───────────────────────────────────────────
  {
    slug: 'html-formatter',
    name: 'HTML Formatter',
    description: 'Beautify or minify HTML5 with nested CSS/JS support and structural analysis.',
    category: 'html',
    icon: '⌘',
    tags: ['html', 'format', 'beautify', 'prettify'],
    features: ['history'],
    altKeywords: ['html beautifier online', 'format html online', 'html pretty print'],
  },
  {
    slug: 'html-minifier',
    name: 'HTML Minifier',
    description: 'Minify HTML, CSS, and JavaScript with attribute stripping and advanced optimization.',
    category: 'html',
    icon: '◦',
    tags: ['html', 'minify', 'compress', 'optimize'],
    features: ['history'],
    altKeywords: ['minify html online', 'html compressor', 'compress html css js'],
  },
  {
    slug: 'html-validator',
    name: 'HTML Validator',
    description: 'Validate HTML against industry standards. Detect syntax errors and accessibility violations.',
    category: 'html',
    icon: '✓',
    tags: ['html', 'validate', 'accessibility', 'w3c'],
    features: ['error-detect', 'history'],
    altKeywords: ['html validator online', 'validate html w3c', 'html syntax checker'],
  },

  // ── SQL (1 tool) ─────────────────────────────────────────────
  {
    slug: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Indent and beautify SQL queries — supports MySQL, PostgreSQL, SQLite, and T-SQL.',
    category: 'sql',
    icon: '⊡',
    tags: ['sql', 'format', 'beautify', 'mysql', 'postgresql'],
    popular: true,
    features: ['explain', 'history', 'share'],
    altKeywords: ['sql formatter online', 'format sql query', 'sql beautifier', 'sql pretty print'],
  },

  // ── Encoding (3 tools) ───────────────────────────────────────
  {
    slug: 'base64',
    name: 'Base64 Encode / Decode',
    description: 'Encode and decode Base64 strings with full Unicode support via TextEncoder.',
    category: 'encoding',
    icon: '64',
    tags: ['base64', 'encode', 'decode', 'unicode'],
    popular: true,
    features: ['history', 'share'],
    altKeywords: ['base64 encoder decoder online', 'encode base64', 'decode base64 string'],
  },
  {
    slug: 'url-encode',
    name: 'URL Encode / Decode',
    description: 'Professional URL workbench with RFC 3986 support, deep decoding, and parameter tables.',
    category: 'encoding',
    icon: '🔗',
    tags: ['url', 'encode', 'decode', 'rfc3986', 'query', 'percent'],
    popular: true,
    features: ['explain', 'history', 'share'],
    altKeywords: ['url encoder decoder', 'percent encode url', 'urlencode online'],
  },
  {
    slug: 'html-entity',
    name: 'HTML Entity Encoder',
    description: 'Encode or decode HTML entities instantly with full HTML5 coverage — named, decimal, hexadecimal.',
    category: 'encoding',
    icon: '&',
    tags: ['html', 'entity', 'escape', 'decode', 'encode'],
    features: ['history'],
    altKeywords: ['html entity encoder decoder', 'html escape online', 'html entities tool'],
  },

  // ── Security (2 tools) ───────────────────────────────────────
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    description: 'Compute SHA-1, SHA-256, and SHA-512 digests via the Web Crypto API. 100% client-side.',
    category: 'security',
    icon: '#',
    tags: ['hash', 'sha256', 'sha512', 'sha1', 'crypto', 'checksum'],
    popular: true,
    features: ['security', 'history'],
    altKeywords: ['sha256 hash generator', 'md5 hash online', 'sha512 checksum', 'generate hash'],
  },
  {
    slug: 'jwt-inspector',
    name: 'JWT Inspector',
    description: 'Decode JWT tokens — inspect header, payload, expiry countdown, and security analysis.',
    category: 'security',
    icon: '🔐',
    tags: ['jwt', 'token', 'auth', 'decode', 'security', 'bearer'],
    popular: true,
    isNew: true,
    features: ['explain', 'security', 'history', 'share'],
    altKeywords: ['jwt decoder online', 'decode jwt token', 'jwt parser', 'inspect jwt'],
  },

  // ── Network (3 tools) ────────────────────────────────────────
  {
    slug: 'api-tester',
    name: 'API Tester',
    description: 'Send HTTP requests to any REST API with CORS proxy, response timing, and request history.',
    category: 'network',
    icon: '↗',
    tags: ['api', 'rest', 'http', 'test', 'request', 'postman'],
    popular: true,
    features: ['history'],
    altKeywords: ['api testing tool online', 'rest api tester', 'http request tool', 'postman alternative'],
  },
  {
    slug: 'curl-converter',
    name: 'cURL to Code',
    description: 'Convert cURL commands to Python, JavaScript, Go, PHP, and more. Uses a WASM parser.',
    category: 'network',
    icon: '$',
    tags: ['curl', 'convert', 'python', 'javascript', 'go', 'php'],
    popular: true,
    features: ['history', 'share'],
    altKeywords: ['curl to python', 'curl converter online', 'curl to javascript', 'convert curl command'],
  },
  {
    slug: 'http-error-explorer',
    name: 'HTTP Error Explorer',
    description: 'Comprehensive guide to all HTTP status codes with causes, fixes, and best practices.',
    category: 'network',
    icon: '404',
    tags: ['http', 'status', 'error', '404', '500', 'codes'],
    isNew: true,
    features: ['explain'],
    altKeywords: ['http status codes list', 'http error codes explained', '404 meaning', '500 error fix'],
  },

  // ── Generators (4 tools) ─────────────────────────────────────
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate RFC 9562 compliant UUID v4 and v7 identifiers in bulk.',
    category: 'generators',
    icon: '⊛',
    tags: ['uuid', 'guid', 'generate', 'unique', 'v4', 'v7'],
    popular: true,
    features: ['history'],
    altKeywords: ['uuid generator online', 'generate uuid', 'guid generator', 'random uuid'],
  },
  {
    slug: 'ulid-generator',
    name: 'ULID Generator',
    description: 'Generate, decode, and compare ULIDs with monotonic ordering and UUID conversion.',
    category: 'generators',
    icon: '⊚',
    tags: ['ulid', 'generate', 'unique', 'monotonic', 'sortable'],
    features: ['explain', 'history'],
    altKeywords: ['ulid generator online', 'generate ulid', 'sortable unique id'],
  },
  {
    slug: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Configurable placeholder text — paragraphs, sentences, or word count with HTML output.',
    category: 'generators',
    icon: '¶',
    tags: ['lorem', 'ipsum', 'placeholder', 'text', 'dummy'],
    features: ['history'],
    altKeywords: ['lorem ipsum generator', 'placeholder text generator', 'dummy text generator'],
  },
  {
    slug: 'random-port',
    name: 'Random Port Generator',
    description: 'Generate bias-free random TCP/UDP ports with IANA service lookup and conflict assessment.',
    category: 'generators',
    icon: ':',
    tags: ['port', 'tcp', 'udp', 'network', 'generate', 'iana'],
    features: ['history'],
    altKeywords: ['random port number generator', 'available port finder', 'tcp port generator'],
  },

  // ── Utilities (6 tools) ──────────────────────────────────────
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with match highlighting, capture groups, and ReDoS protection.',
    category: 'utilities',
    icon: '.*',
    tags: ['regex', 'regexp', 'test', 'match', 'pattern', 'expression'],
    popular: true,
    features: ['explain', 'learn', 'history', 'share'],
    altKeywords: ['regex tester online', 'regular expression tester', 'test regex javascript', 'regex debugger'],
  },
  {
    slug: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Real-time GFM previewer with KaTeX math rendering and synchronized scrolling.',
    category: 'utilities',
    icon: 'Md',
    tags: ['markdown', 'preview', 'gfm', 'katex', 'math', 'render'],
    popular: true,
    features: ['history'],
    altKeywords: ['markdown previewer online', 'markdown renderer', 'markdown editor preview', 'gfm preview'],
  },
  {
    slug: 'code-diff',
    name: 'Code Diff Tool',
    description: 'High-precision code comparison with syntax highlighting, side-by-side view, and sync scroll.',
    category: 'utilities',
    icon: '⟺',
    tags: ['diff', 'compare', 'code', 'side-by-side', 'merge'],
    popular: true,
    features: ['history'],
    altKeywords: ['code diff tool online', 'text diff online', 'side by side diff', 'compare code online'],
  },
  {
    slug: 'chmod-calculator',
    name: 'Chmod Calculator',
    description: 'Calculate Linux file permissions in octal and symbolic notation with visual terminal preview.',
    category: 'utilities',
    icon: '⎔',
    tags: ['chmod', 'linux', 'permissions', 'octal', 'unix', 'file'],
    features: ['explain', 'history'],
    altKeywords: ['chmod calculator online', 'linux permission calculator', 'octal permission calculator'],
  },
  {
    slug: 'docker-compose',
    name: 'Docker Compose Builder',
    description: 'Convert between Docker Run commands and Docker Compose files. Supports multiple services.',
    category: 'utilities',
    icon: '🐳',
    tags: ['docker', 'compose', 'convert', 'container', 'yaml'],
    features: ['explain', 'history', 'share'],
    altKeywords: ['docker compose generator', 'docker run to compose', 'docker compose converter'],
  },
  {
    slug: 'error-decoder',
    name: 'Error Decoder',
    description: 'Decode stack traces and errors from Java, Python, JavaScript, Go, and Rust instantly.',
    category: 'utilities',
    icon: '⚠',
    tags: ['error', 'debug', 'exception', 'stack-trace', 'decode'],
    popular: true,
    isNew: true,
    features: ['explain'],
    altKeywords: ['stack trace decoder', 'error decoder online', 'parse stack trace', 'debug exception'],
  },
];

// ── Tool Collections (only referencing implemented tools) ─────
export const COLLECTIONS: ToolCollection[] = [
  {
    slug: 'json-toolkit',
    name: 'JSON Toolkit',
    description: 'Complete JSON development suite',
    icon: '{ }',
    color: 'json',
    toolSlugs: ['json-formatter', 'json-validator', 'json-diff', 'json-schema-generator', 'json-to-typescript', 'json-to-yaml', 'json-flatten'],
  },
  {
    slug: 'security-toolkit',
    name: 'Security Toolkit',
    description: 'JWT, hashing, and token inspection',
    icon: '🔒',
    color: 'security',
    toolSlugs: ['jwt-inspector', 'hash-generator'],
  },
  {
    slug: 'network-toolkit',
    name: 'Network Toolkit',
    description: 'API testing and HTTP utilities',
    icon: '🌐',
    color: 'network',
    toolSlugs: ['api-tester', 'curl-converter', 'http-error-explorer'],
  },
  {
    slug: 'encoding-toolkit',
    name: 'Encoding Toolkit',
    description: 'Base64, URL, and HTML encoding',
    icon: '⊕',
    color: 'encoding',
    toolSlugs: ['base64', 'url-encode', 'html-entity', 'json-string-escape'],
  },
  {
    slug: 'data-conversion',
    name: 'Data Conversion',
    description: 'Transform between data formats',
    icon: '↔',
    color: 'json',
    toolSlugs: ['json-to-yaml', 'json-to-typescript', 'yaml-to-json', 'xml-formatter'],
  },
  {
    slug: 'dev-utilities',
    name: 'Dev Utilities',
    description: 'Everyday developer productivity tools',
    icon: '⚙',
    color: 'utilities',
    toolSlugs: ['regex-tester', 'code-diff', 'markdown-preview', 'docker-compose', 'chmod-calculator'],
  },
];

// ── Tool Recipes (only using implemented tools) ───────────────
export const RECIPES: ToolRecipe[] = [
  {
    slug: 'api-to-typescript',
    name: 'API Response → TypeScript',
    description: 'Convert a raw API JSON response to production-ready TypeScript interfaces',
    icon: '🔗',
    steps: ['json-formatter', 'json-validator', 'json-to-typescript'],
    stepLabels: ['Format', 'Validate', 'Generate Types'],
  },
  {
    slug: 'debug-jwt',
    name: 'Debug JWT Token',
    description: 'Decode, inspect, and security-check a JWT token',
    icon: '🔐',
    steps: ['jwt-inspector'],
    stepLabels: ['Decode + Security Scan'],
  },
  {
    slug: 'clean-sql',
    name: 'Clean & Explain SQL',
    description: 'Format your SQL query and get an explanation of what it does',
    icon: '🗄️',
    steps: ['sql-formatter'],
    stepLabels: ['Format + Explain'],
  },
  {
    slug: 'curl-to-python',
    name: 'cURL → Python Code',
    description: 'Convert a cURL command to Python requests code',
    icon: '🐍',
    steps: ['curl-converter'],
    stepLabels: ['Convert to Code'],
  },
  {
    slug: 'json-pipeline',
    name: 'JSON Processing Pipeline',
    description: 'Validate, format, and convert JSON to YAML in one flow',
    icon: '⚡',
    steps: ['json-validator', 'json-formatter', 'json-to-yaml'],
    stepLabels: ['Validate', 'Format', 'Convert to YAML'],
  },
];

// ── Helpers ───────────────────────────────────────────────────
export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find(t => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter(t => t.category === category);
}

export function getPopularTools(): Tool[] {
  return TOOLS.filter(t => t.popular);
}

export function getNewTools(): Tool[] {
  return TOOLS.filter(t => t.isNew);
}

export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase();
  return TOOLS.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.includes(q)) ||
    (t.altKeywords || []).some(kw => kw.toLowerCase().includes(q))
  );
}

export const CATEGORY_META: Record<ToolCategory, { label: string; icon: string; color: string; description: string }> = {
  json:       { label: 'JSON',       icon: '{ }', color: 'cat-json',     description: 'Format, validate, convert, and analyze JSON data' },
  yaml:       { label: 'YAML',       icon: '≈',   color: 'cat-yaml',     description: 'Parse and convert YAML configuration files' },
  xml:        { label: 'XML',        icon: '</>',  color: 'cat-xml',      description: 'Format, validate, and transform XML documents' },
  html:       { label: 'HTML',       icon: '⌘',   color: 'cat-html',     description: 'Beautify, minify, and validate HTML markup' },
  sql:        { label: 'SQL',        icon: '⊡',   color: 'cat-sql',      description: 'Format and analyze SQL queries across dialects' },
  encoding:   { label: 'Encoding',   icon: '⊕',   color: 'cat-encode',   description: 'Encode and decode Base64, URL, and HTML entities' },
  security:   { label: 'Security',   icon: '🔒',  color: 'cat-security', description: 'JWT inspection, hashing, and cryptographic tools' },
  network:    { label: 'Network',    icon: '🌐',  color: 'cat-network',  description: 'API testing, HTTP tools, and network utilities' },
  generators: { label: 'Generators', icon: '⊛',   color: 'cat-gen',     description: 'Generate UUIDs, ULIDs, lorem ipsum, and more' },
  utilities:  { label: 'Utilities',  icon: '⚙',   color: 'cat-utils',   description: 'Regex testing, diffs, markdown, and dev tools' },
};

export const TOOL_COUNT = TOOLS.length;
export const CATEGORY_COUNT = Object.keys(CATEGORY_META).length;
