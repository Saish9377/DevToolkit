// ── DevToolkit Blog Registry ───────────────────────────────────
// All blog content is stored here as structured data.
// No MDX/remark needed — rendered via BlogArticle component.

export interface BlogSection {
  type: 'h2' | 'h3' | 'p' | 'code' | 'ul' | 'ol' | 'tip' | 'warning' | 'note' | 'table';
  content?: string;
  items?: string[];        // for ul / ol
  code?: string;           // for code blocks
  language?: string;       // for code blocks
  headers?: string[];      // for table
  rows?: string[][];       // for table
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  readingTime: number;      // minutes
  publishedAt: string;      // ISO date
  toolSlug?: string;        // related tool
  sections: BlogSection[];
}

// ── Blog Posts ─────────────────────────────────────────────────
export const BLOG_POSTS: BlogPost[] = [
  // ── 1. What is JSON? ─────────────────────────────────────────
  {
    slug: 'what-is-json',
    title: 'What is JSON? A Complete Guide for Developers',
    description: 'Learn what JSON is, how it works, its syntax rules, and why it became the universal data exchange format. With examples and common mistakes.',
    category: 'JSON',
    tags: ['json', 'beginner', 'data-formats', 'api'],
    readingTime: 7,
    publishedAt: '2024-11-15',
    toolSlug: 'json-formatter',
    sections: [
      { type: 'p', content: 'JSON (JavaScript Object Notation) is a lightweight text format for storing and transporting data. It was created by Douglas Crockford in the early 2000s and has since become the most widely used data interchange format on the web — replacing XML in most modern APIs.' },
      { type: 'p', content: 'Despite its name, JSON is completely language-independent. Every major programming language can parse and generate JSON: Python, Java, Go, Rust, PHP, Ruby, C#, and of course JavaScript.' },

      { type: 'h2', content: 'JSON Syntax Rules' },
      { type: 'p', content: 'JSON has only 6 data types and a very strict syntax. Understanding these rules prevents the most common bugs:' },
      { type: 'ul', items: [
        '**Strings** — must use double quotes only. Single quotes are invalid.',
        '**Numbers** — integers or decimals. No NaN or Infinity.',
        '**Booleans** — lowercase `true` or `false`. Not `True` or `True`.',
        '**null** — lowercase only. Not `Null` or `NULL`.',
        '**Arrays** — ordered list in square brackets `[...]`.',
        '**Objects** — unordered key-value pairs in curly braces `{...}`. Keys must be strings.',
      ]},
      { type: 'code', language: 'json', code: `{
  "name": "Alice",
  "age": 30,
  "active": true,
  "score": 98.5,
  "address": null,
  "tags": ["developer", "designer"],
  "location": {
    "city": "Mumbai",
    "country": "India"
  }
}` },

      { type: 'h2', content: 'Common JSON Mistakes' },
      { type: 'table',
        headers: ['Mistake', 'Wrong', 'Correct'],
        rows: [
          ["Single quotes", `{'name': 'Alice'}`, `{"name": "Alice"}`],
          ["Trailing comma", `{"a":1, "b":2,}`, `{"a":1, "b":2}`],
          ["Comments", `// comment\n{"a":1}`, `{"a":1} // not allowed`],
          ["Undefined value", `{"x": undefined}`, `{"x": null}`],
          ["Uppercase boolean", `{"active": True}`, `{"active": true}`],
        ]
      },

      { type: 'h2', content: 'JSON vs Other Formats' },
      { type: 'table',
        headers: ['Feature', 'JSON', 'XML', 'YAML'],
        rows: [
          ["Human-readable", "✅ Yes", "⚠️ Verbose", "✅ Best"],
          ["Comments", "❌ None", "✅ Yes", "✅ Yes"],
          ["Type system", "✅ 6 types", "❌ Strings only", "✅ Rich"],
          ["Browser native", "✅ Yes", "❌ No", "❌ No"],
          ["API standard", "✅ Dominant", "⚠️ Legacy", "❌ Rare"],
        ]
      },

      { type: 'h2', content: 'Why JSON Won the Web' },
      { type: 'p', content: 'JSON won because of three things: it is natively supported in JavaScript (the language of the web), it is much smaller and faster than XML, and its syntax maps directly to data structures developers already use (dictionaries, lists, strings).' },
      { type: 'p', content: 'REST APIs use JSON. GraphQL uses JSON. LocalStorage uses JSON. Config files use JSON. Understanding JSON is non-negotiable for any modern developer.' },

      { type: 'h2', content: 'Parsing JSON in Different Languages' },
      { type: 'code', language: 'javascript', code: `// JavaScript
const obj = JSON.parse('{"name":"Alice"}');
const str = JSON.stringify(obj, null, 2);` },
      { type: 'code', language: 'python', code: `# Python
import json
obj = json.loads('{"name":"Alice"}')
s = json.dumps(obj, indent=2)` },

      { type: 'tip', content: 'Use the **JSON Formatter** tool on DevToolkit to instantly beautify, validate, and explore any JSON — it catches syntax errors with exact line numbers.' },
    ],
  },

  // ── 2. JSON vs XML ───────────────────────────────────────────
  {
    slug: 'json-vs-xml',
    title: 'JSON vs XML: Which Should You Use in 2024?',
    description: 'A detailed comparison of JSON and XML — syntax, performance, use cases, and when to choose each format. With real-world examples.',
    category: 'JSON',
    tags: ['json', 'xml', 'comparison', 'api', 'data-formats'],
    readingTime: 6,
    publishedAt: '2024-11-20',
    toolSlug: 'xml-formatter',
    sections: [
      { type: 'p', content: 'JSON and XML have been rivals for over two decades. XML was the dominant data format of the 2000s — used in SOAP APIs, RSS feeds, and configuration files. JSON emerged in the mid-2000s and has since become the default choice for web APIs. But XML is far from dead.' },

      { type: 'h2', content: 'Side-by-Side Comparison' },
      { type: 'p', content: 'The same user data in both formats:' },
      { type: 'code', language: 'json', code: `{
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "roles": ["admin", "editor"]
  }
}` },
      { type: 'code', language: 'xml', code: `<?xml version="1.0" encoding="UTF-8"?>
<user>
  <id>1</id>
  <name>Alice</name>
  <email>alice@example.com</email>
  <roles>
    <role>admin</role>
    <role>editor</role>
  </roles>
</user>` },
      { type: 'p', content: 'The JSON version is 118 bytes. The XML version is 189 bytes — 60% larger for identical data.' },

      { type: 'h2', content: 'Performance: JSON Wins' },
      { type: 'p', content: 'JSON parsing is consistently 2-5x faster than XML parsing. Browsers parse JSON natively with `JSON.parse()`. XML requires a separate DOM parser. At scale (millions of API calls per day), this difference is significant.' },

      { type: 'h2', content: 'Where XML Still Wins' },
      { type: 'ul', items: [
        '**Document markup** — HTML is XML-like. XML handles mixed content (text + tags) naturally.',
        '**Comments & metadata** — XML supports inline comments. JSON does not.',
        '**Namespaces** — XML supports XML namespaces for complex document standards.',
        '**XSLT transforms** — powerful stylesheet transformations built into XML.',
        '**Legacy enterprise** — SOAP APIs, SAP, Oracle, government systems still use XML.',
        '**Configuration** — Maven (pom.xml), Android layouts, Spring configs use XML.',
      ]},

      { type: 'h2', content: 'When to Choose JSON' },
      { type: 'ul', items: [
        'REST APIs — JSON is the universal standard',
        'Browser-to-server communication',
        'Configuration files (package.json, tsconfig.json)',
        'NoSQL databases (MongoDB, Firestore)',
        'Microservices inter-communication',
      ]},

      { type: 'h2', content: 'When to Choose XML' },
      { type: 'ul', items: [
        'Document-centric data (articles, legal docs, books)',
        'SOAP web services',
        'RSS/Atom feeds',
        'SVG graphics',
        'Android resource files',
        'Microsoft Office formats (.docx, .xlsx)',
      ]},

      { type: 'tip', content: 'Use DevToolkit\'s **JSON Formatter** and **XML Formatter** side-by-side to convert between the two formats instantly.' },
    ],
  },

  // ── 3. Base64 Explained ──────────────────────────────────────
  {
    slug: 'base64-explained',
    title: 'Base64 Encoding Explained — What It Is and How It Works',
    description: 'Understand Base64 encoding from scratch — why it exists, how the algorithm works, and where it is used in the real world. With examples in JavaScript and Python.',
    category: 'Encoding',
    tags: ['base64', 'encoding', 'security', 'images', 'api'],
    readingTime: 5,
    publishedAt: '2024-12-01',
    toolSlug: 'base64',
    sections: [
      { type: 'p', content: 'Base64 is a binary-to-text encoding scheme that represents binary data using only 64 printable ASCII characters. It was designed to safely transport binary data (images, files, binary blobs) through channels that were designed for text.' },

      { type: 'h2', content: 'Why Does Base64 Exist?' },
      { type: 'p', content: 'Many protocols — email (SMTP), URLs, HTTP headers — were originally designed for ASCII text only. If you tried to send binary data (a JPEG image, a PDF) through these channels, special bytes would get corrupted or misinterpreted as control characters.' },
      { type: 'p', content: 'Base64 solves this by converting every 3 bytes of binary into 4 printable characters. The output is always plain text, safe to transmit anywhere.' },

      { type: 'h2', content: 'How Base64 Works' },
      { type: 'p', content: 'The algorithm is simple: take 3 bytes (24 bits), split into 4 groups of 6 bits each, map each 6-bit group to a character from the Base64 alphabet (A-Z, a-z, 0-9, +, /).' },
      { type: 'code', language: 'text', code: `Input:  "Man"
Binary: 01001101 01100001 01101110
Groups: 010011  010110  000101  101110
Index:  19      22      5       46
Output: T       W       F       u  →  "TWFu"` },

      { type: 'h2', content: 'The Base64 Alphabet' },
      { type: 'code', language: 'text', code: `A-Z = 0-25
a-z = 26-51
0-9 = 52-61
+   = 62
/   = 63
=   = padding (when input not divisible by 3)` },

      { type: 'h2', content: 'Real-World Use Cases' },
      { type: 'ul', items: [
        '**Email attachments** — MIME encodes all attachments as Base64',
        '**CSS data URIs** — embed images directly in CSS: `url("data:image/png;base64,...")`',
        '**JWT tokens** — header and payload are Base64URL encoded',
        '**HTTP Basic Auth** — `Authorization: Basic base64(user:password)`',
        '**API payloads** — send binary files through JSON APIs',
        '**Fonts in CSS** — embed web fonts inline',
      ]},

      { type: 'h2', content: 'Base64 in JavaScript' },
      { type: 'code', language: 'javascript', code: `// Encode
const encoded = btoa('Hello, World!');
// → "SGVsbG8sIFdvcmxkIQ=="

// Decode
const decoded = atob('SGVsbG8sIFdvcmxkIQ==');
// → "Hello, World!"

// For Unicode strings (btoa breaks on non-ASCII)
const encoded = btoa(unescape(encodeURIComponent('नमस्ते')));
const decoded = decodeURIComponent(escape(atob(encoded)));` },

      { type: 'h2', content: 'Base64 vs Base64URL' },
      { type: 'p', content: 'Standard Base64 uses `+` and `/` which are unsafe in URLs. Base64URL replaces them: `+` → `-`, `/` → `_`, and removes padding `=`. JWT tokens use Base64URL.' },

      { type: 'warning', content: 'Base64 is **encoding, not encryption**. It provides zero security. Anyone can decode it in 1 second. Never use Base64 to "hide" passwords or secrets.' },

      { type: 'tip', content: 'Use DevToolkit\'s **Base64 Encoder/Decoder** to convert any text or data instantly — supports full Unicode.' },
    ],
  },

  // ── 4. JWT Authentication Guide ──────────────────────────────
  {
    slug: 'jwt-authentication-guide',
    title: 'JWT Authentication: The Complete Developer Guide',
    description: 'Everything about JSON Web Tokens — structure, how authentication works, signing algorithms, common vulnerabilities, and best practices. With code examples.',
    category: 'Security',
    tags: ['jwt', 'authentication', 'security', 'api', 'tokens'],
    readingTime: 10,
    publishedAt: '2024-12-10',
    toolSlug: 'jwt-inspector',
    sections: [
      { type: 'p', content: 'JWT (JSON Web Token) is a compact, URL-safe way to represent claims between two parties. It is the most widely used token format for API authentication — used by OAuth 2.0, OpenID Connect, and most modern REST APIs.' },

      { type: 'h2', content: 'JWT Structure' },
      { type: 'p', content: 'A JWT consists of three Base64URL-encoded parts separated by dots: `header.payload.signature`' },
      { type: 'code', language: 'text', code: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNjk5MDAwMDAwfQ
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c` },
      { type: 'code', language: 'json', code: `// Header (algorithm & type)
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload (claims)
{
  "sub": "1234567890",   // Subject (user ID)
  "name": "Alice",
  "iat": 1699000000,     // Issued At (Unix timestamp)
  "exp": 1699086400      // Expiry (24 hours later)
}` },

      { type: 'h2', content: 'Standard Claims (Registered)' },
      { type: 'table',
        headers: ['Claim', 'Full Name', 'Description'],
        rows: [
          ['`iss`', 'Issuer', 'Who issued the token (e.g., "auth.myapp.com")'],
          ['`sub`', 'Subject', 'User the token refers to (user ID)'],
          ['`aud`', 'Audience', 'Who should accept this token'],
          ['`exp`', 'Expiration', 'Unix timestamp when token expires'],
          ['`iat`', 'Issued At', 'Unix timestamp when token was issued'],
          ['`jti`', 'JWT ID', 'Unique ID for this specific token (prevents replay)'],
        ]
      },

      { type: 'h2', content: 'How JWT Authentication Works' },
      { type: 'ol', items: [
        'User logs in with email + password',
        'Server validates credentials, creates JWT, signs it with a secret key',
        'Server sends JWT back to the client',
        'Client stores JWT (localStorage, cookie, or memory)',
        'On every API request, client sends JWT in `Authorization: Bearer <token>` header',
        'Server validates JWT signature — **no database lookup needed**',
        'If valid and not expired, server processes the request',
      ]},

      { type: 'h2', content: 'Signing Algorithms' },
      { type: 'table',
        headers: ['Algorithm', 'Type', 'Use Case'],
        rows: [
          ['HS256', 'HMAC-SHA256 (symmetric)', 'Same secret for signing & verifying. Single-service apps.'],
          ['HS384', 'HMAC-SHA384 (symmetric)', 'Stronger HMAC. Same use case as HS256.'],
          ['RS256', 'RSA-SHA256 (asymmetric)', 'Private key signs, public key verifies. Microservices.'],
          ['ES256', 'ECDSA-SHA256 (asymmetric)', 'Smaller key size than RSA. High-security APIs.'],
        ]
      },

      { type: 'h2', content: 'Common JWT Vulnerabilities' },
      { type: 'warning', content: '**Algorithm Confusion Attack** — never trust the `alg` field in the header. Always specify the expected algorithm on the server side. Attackers have set `"alg": "none"` to bypass signature verification in vulnerable implementations.' },
      { type: 'ul', items: [
        '**Storing JWT in localStorage** — vulnerable to XSS attacks. Prefer HttpOnly cookies.',
        '**No expiry (`exp`)** — tokens that never expire are permanent security holes.',
        '**Weak secrets** — `secret`, `123456` can be brute-forced. Use 256-bit random secrets.',
        '**No token blacklisting** — after logout, old tokens still work until expiry.',
        '**Sensitive data in payload** — payload is Base64 encoded, not encrypted. Anyone can decode it.',
      ]},

      { type: 'h2', content: 'Best Practices' },
      { type: 'ul', items: [
        'Set short expiry (15 min access tokens + 7 day refresh tokens)',
        'Use RS256 or ES256 for distributed systems',
        'Store in HttpOnly, Secure, SameSite=Strict cookies',
        'Include `jti` claim and maintain a token revocation list',
        'Rotate signing keys periodically',
        'Always validate `iss` and `aud` claims',
      ]},

      { type: 'tip', content: 'Use DevToolkit\'s **JWT Inspector** to instantly decode any JWT token — see expiry countdown, all claims, and security analysis without sending data to any server.' },
    ],
  },

  // ── 5. SQL Formatter Guide ───────────────────────────────────
  {
    slug: 'sql-formatter-guide',
    title: 'SQL Formatting Best Practices — Why and How to Format Your Queries',
    description: 'Learn SQL formatting conventions, why readable SQL matters, and how to format complex queries for readability and maintainability. Examples in MySQL, PostgreSQL, and SQLite.',
    category: 'SQL',
    tags: ['sql', 'formatting', 'mysql', 'postgresql', 'database', 'best-practices'],
    readingTime: 6,
    publishedAt: '2024-12-15',
    toolSlug: 'sql-formatter',
    sections: [
      { type: 'p', content: 'Unformatted SQL is one of the biggest causes of bugs in database-heavy applications. A query that was readable when first written becomes unmaintainable after three months of changes. SQL formatting is not optional — it is part of writing professional database code.' },

      { type: 'h2', content: 'Before and After: The Impact of Formatting' },
      { type: 'code', language: 'sql', code: `-- ❌ Unreadable (real code seen in production)
SELECT u.id,u.name,u.email,COUNT(o.id) as orders,SUM(o.total) as revenue FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.created_at>'2024-01-01' AND u.status='active' GROUP BY u.id,u.name,u.email HAVING COUNT(o.id)>0 ORDER BY revenue DESC LIMIT 20` },
      { type: 'code', language: 'sql', code: `-- ✅ Formatted and readable
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id)   AS orders,
    SUM(o.total)  AS revenue
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE
    u.created_at > '2024-01-01'
    AND u.status = 'active'
GROUP BY
    u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY revenue DESC
LIMIT 20` },

      { type: 'h2', content: 'SQL Formatting Rules' },
      { type: 'ul', items: [
        '**Keywords in UPPERCASE** — SELECT, FROM, WHERE, JOIN, GROUP BY, HAVING, ORDER BY',
        '**One clause per line** — each major clause starts a new line',
        '**Indent column lists** — each selected column on its own indented line',
        '**Align AS keywords** — vertically align aliases for readability',
        '**Explicit JOIN types** — write LEFT JOIN not just JOIN',
        '**Table aliases** — use meaningful short aliases (u for users, o for orders)',
        '**Parentheses for complex conditions** — never guess operator precedence',
      ]},

      { type: 'h2', content: 'Formatting Complex WHERE Clauses' },
      { type: 'code', language: 'sql', code: `-- ❌ Hard to read conditions
WHERE status='active' AND (role='admin' OR role='editor') AND created_at>'2024-01-01' AND NOT deleted

-- ✅ Each condition on its own line
WHERE
    status = 'active'
    AND (
        role = 'admin'
        OR role = 'editor'
    )
    AND created_at > '2024-01-01'
    AND NOT deleted` },

      { type: 'h2', content: 'Formatting CTEs (Common Table Expressions)' },
      { type: 'code', language: 'sql', code: `WITH monthly_revenue AS (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        SUM(total)                       AS revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY 1
),

top_customers AS (
    SELECT
        user_id,
        SUM(total) AS lifetime_value
    FROM orders
    GROUP BY user_id
    HAVING SUM(total) > 1000
)

SELECT
    mr.month,
    mr.revenue,
    COUNT(tc.user_id) AS vip_orders
FROM monthly_revenue mr
LEFT JOIN top_customers tc ON TRUE
GROUP BY mr.month, mr.revenue
ORDER BY mr.month` },

      { type: 'h2', content: 'MySQL vs PostgreSQL Differences' },
      { type: 'table',
        headers: ['Feature', 'MySQL', 'PostgreSQL'],
        rows: [
          ['String quoting', 'Single or double quotes', 'Single quotes only'],
          ['Case sensitivity', 'Tables case-insensitive on Windows', 'Case-sensitive by default'],
          ['Date truncation', '`DATE_FORMAT()`', '`DATE_TRUNC()`'],
          ['String concat', '`CONCAT(a, b)`', '`a || b` or `CONCAT(a, b)`'],
          ['Limit syntax', '`LIMIT 10`', '`LIMIT 10` (same)'],
          ['Booleans', '`TINYINT(1)` or `BOOL`', 'Native `BOOLEAN`'],
        ]
      },

      { type: 'tip', content: 'Use DevToolkit\'s **SQL Formatter** to instantly format any SQL query — supports MySQL, PostgreSQL, SQLite, and T-SQL with configurable indentation.' },
    ],
  },

  // ── 6. Regex Tutorial ────────────────────────────────────────
  {
    slug: 'regex-tutorial',
    title: 'Regular Expressions (Regex) Tutorial — From Beginner to Intermediate',
    description: 'Learn regular expressions from scratch — syntax, character classes, quantifiers, groups, lookaheads, and real-world examples. Works in JavaScript, Python, and most languages.',
    category: 'Utilities',
    tags: ['regex', 'regexp', 'tutorial', 'javascript', 'python', 'validation'],
    readingTime: 9,
    publishedAt: '2024-12-20',
    toolSlug: 'regex-tester',
    sections: [
      { type: 'p', content: 'Regular expressions (regex) are patterns used to match, search, and manipulate text. They look cryptic at first — `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/` — but once you understand the building blocks, they become one of the most powerful tools in any developer\'s toolkit.' },

      { type: 'h2', content: 'Basic Character Matching' },
      { type: 'table',
        headers: ['Pattern', 'Matches', 'Example'],
        rows: [
          ['`a`', 'Literal character "a"', '`/cat/` matches "cat"'],
          ['`.`', 'Any character except newline', '`/c.t/` matches "cat", "cut", "c3t"'],
          ['`\\d`', 'Any digit (0-9)', '`/\\d/` matches "3" in "abc3"'],
          ['`\\w`', 'Word char (a-z, A-Z, 0-9, _)', '`/\\w+/` matches "hello_123"'],
          ['`\\s`', 'Whitespace (space, tab, newline)', '`/\\s/` matches spaces'],
          ['`\\D`', 'Not a digit', 'Opposite of \\d'],
          ['`\\W`', 'Not a word character', 'Opposite of \\w'],
        ]
      },

      { type: 'h2', content: 'Quantifiers — How Many?' },
      { type: 'table',
        headers: ['Quantifier', 'Meaning', 'Example'],
        rows: [
          ['`*`', '0 or more', '`/go*/` matches "g", "go", "goo", "gooo"'],
          ['`+`', '1 or more', '`/go+/` matches "go", "goo" (not "g")'],
          ['`?`', '0 or 1 (optional)', '`/colou?r/` matches "color" and "colour"'],
          ['`{3}`', 'Exactly 3', '`/\\d{3}/` matches "123"'],
          ['`{2,5}`', '2 to 5', '`/\\d{2,5}/` matches "12", "123", "1234"'],
          ['`{2,}`', '2 or more', '`/\\d{2,}/` matches "12" and longer'],
        ]
      },

      { type: 'h2', content: 'Anchors — Position Matching' },
      { type: 'code', language: 'text', code: `^  — Start of string (or line with multiline flag)
$  — End of string (or line with multiline flag)
\\b — Word boundary
\\B — Not a word boundary

Examples:
/^hello/   matches "hello world" but NOT "say hello"
/world$/   matches "hello world" but NOT "world peace"
/\\bcat\\b/  matches "cat" in "the cat sat" but NOT in "catch"` },

      { type: 'h2', content: 'Character Classes' },
      { type: 'code', language: 'text', code: `[abc]    — matches a, b, or c
[a-z]    — matches any lowercase letter
[A-Z]    — matches any uppercase letter
[0-9]    — matches any digit (same as \\d)
[a-zA-Z] — matches any letter
[^abc]   — negation: matches anything EXCEPT a, b, or c
[^0-9]   — matches any non-digit (same as \\D)` },

      { type: 'h2', content: 'Groups and Capturing' },
      { type: 'code', language: 'javascript', code: `// Capturing group — (...)
const match = "2024-12-25".match(/(\\d{4})-(\\d{2})-(\\d{2})/);
console.log(match[1]); // "2024" — year
console.log(match[2]); // "12" — month
console.log(match[3]); // "25" — day

// Named capturing group — (?<name>...)
const { groups } = "2024-12-25".match(
  /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/
);
console.log(groups.year);  // "2024"
console.log(groups.month); // "12"` },

      { type: 'h2', content: 'Lookahead and Lookbehind' },
      { type: 'code', language: 'text', code: `(?=...)   Positive lookahead  — followed by
(?!...)   Negative lookahead  — NOT followed by
(?<=...)  Positive lookbehind — preceded by
(?<!...)  Negative lookbehind — NOT preceded by

Examples:
/\\d+(?= dollars)/  matches "100" in "100 dollars"
/(?<=\\$)\\d+/       matches "100" in "$100"
/\\bword(?!s\\b)/    matches "word" but not "words"` },

      { type: 'h2', content: 'Real-World Regex Patterns' },
      { type: 'code', language: 'javascript', code: `// Email validation (simplified)
/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/

// URL matching
/https?:\\/\\/[\\w-]+(\\.[\\w-]+)+(\\/[\\w-./?%&=]*)?/

// Phone (flexible)
/^[+]?[(]?\\d{3}[)]?[-\\s.]?\\d{3}[-\\s.]?\\d{4,6}$/

// IPv4 address
/^(\\d{1,3}\\.){3}\\d{1,3}$/

// Strong password (8+ chars, upper, lower, digit, special)
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/

// Hex color
/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b/

// ISO date
/^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$/` },

      { type: 'h2', content: 'Flags' },
      { type: 'table',
        headers: ['Flag', 'Name', 'Effect'],
        rows: [
          ['`g`', 'Global', 'Find all matches, not just first'],
          ['`i`', 'Case-insensitive', '`/hello/i` matches "Hello", "HELLO"'],
          ['`m`', 'Multiline', '`^` and `$` match start/end of each line'],
          ['`s`', 'Dotall', '`.` matches newlines too'],
          ['`u`', 'Unicode', 'Enables full Unicode support'],
        ]
      },

      { type: 'tip', content: 'Use DevToolkit\'s **Regex Tester** to build and debug regex patterns in real-time with match highlighting, capture group visualization, and ReDoS detection.' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return BLOG_POSTS.filter(p => p.category === category);
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return BLOG_POSTS.filter(p => p.tags.includes(tag));
}

export const ALL_BLOG_CATEGORIES = [...new Set(BLOG_POSTS.map(p => p.category))];
