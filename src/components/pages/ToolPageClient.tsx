'use client';

import React, { lazy, Suspense, useEffect } from 'react';
import { type Tool } from '@/lib/registry';
import ToolShell from '@/components/tools/ToolShell';
import { recordToolVisit } from '@/components/features/RecentToolsBar';


// ── Lazy-load all tool components ─────────────────────────────
const JSON_FORMATTER     = lazy(() => import('@/components/tools/json/JSONFormatter'));
const JWT_INSPECTOR      = lazy(() => import('@/components/tools/security/JWTInspector'));
const REGEX_TESTER       = lazy(() => import('@/components/tools/utilities/RegexTester'));
const BASE64_TOOL        = lazy(() => import('@/components/tools/encoding/Base64Tool'));
const URL_ENCODE_TOOL    = lazy(() => import('@/components/tools/encoding/URLEncode'));
const UUID_GENERATOR     = lazy(() => import('@/components/tools/generators/UUIDGenerator'));
const HASH_GENERATOR     = lazy(() => import('@/components/tools/security/HashGenerator'));
const SQL_FORMATTER      = lazy(() => import('@/components/tools/sql/SQLFormatter'));
const YAML_TO_JSON       = lazy(() => import('@/components/tools/yaml/YAMLToJSON'));
const JSON_TO_YAML       = lazy(() => import('@/components/tools/json/JSONToYAML'));
const JSON_DIFF          = lazy(() => import('@/components/tools/json/JSONDiff'));
const JSON_TO_TYPESCRIPT = lazy(() => import('@/components/tools/json/JSONToTypeScript'));
const JSON_SCHEMA_GEN    = lazy(() => import('@/components/tools/json/JSONSchemaGenerator'));
const MARKDOWN_PREVIEW   = lazy(() => import('@/components/tools/utilities/MarkdownPreview'));
const CODE_DIFF          = lazy(() => import('@/components/tools/utilities/CodeDiff'));
const HTTP_ERROR         = lazy(() => import('@/components/tools/network/HTTPErrorExplorer'));
const ERROR_DECODER      = lazy(() => import('@/components/tools/utilities/ErrorDecoder'));
const CHMOD_CALCULATOR   = lazy(() => import('@/components/tools/utilities/ChmodCalculator'));
const CURL_CONVERTER     = lazy(() => import('@/components/tools/network/CurlConverter'));
const LOREM_IPSUM        = lazy(() => import('@/components/tools/generators/LoremIpsum'));
const DOCKER_COMPOSE     = lazy(() => import('@/components/tools/utilities/DockerCompose'));
const JSON_FLATTEN       = lazy(() => import('@/components/tools/json/JSONFlatten'));
const JSON_STRING_ESCAPE = lazy(() => import('@/components/tools/json/JSONStringEscape'));
const HTML_ENTITY        = lazy(() => import('@/components/tools/encoding/HTMLEntity'));
const ULID_GENERATOR     = lazy(() => import('@/components/tools/generators/ULIDGenerator'));
const RANDOM_PORT        = lazy(() => import('@/components/tools/generators/RandomPort'));
const API_TESTER         = lazy(() => import('@/components/tools/network/APITester'));
const XML_FORMATTER      = lazy(() => import('@/components/tools/xml/XMLFormatter'));
const HTML_FORMATTER     = lazy(() => import('@/components/tools/html/HTMLFormatter'));

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  'json-formatter':     JSON_FORMATTER,
  'json-validator':     JSON_FORMATTER,
  'json-minifier':      JSON_FORMATTER,
  'jwt-inspector':      JWT_INSPECTOR,
  'regex-tester':       REGEX_TESTER,
  'base64':             BASE64_TOOL,
  'url-encode':         URL_ENCODE_TOOL,
  'uuid-generator':     UUID_GENERATOR,
  'hash-generator':     HASH_GENERATOR,
  'sql-formatter':      SQL_FORMATTER,
  'yaml-to-json':       YAML_TO_JSON,
  'json-to-yaml':       JSON_TO_YAML,
  'json-diff':          JSON_DIFF,
  'json-to-typescript': JSON_TO_TYPESCRIPT,
  'json-schema-generator': JSON_SCHEMA_GEN,
  'markdown-preview':   MARKDOWN_PREVIEW,
  'code-diff':          CODE_DIFF,
  'http-error-explorer': HTTP_ERROR,
  'error-decoder':      ERROR_DECODER,
  'chmod-calculator':   CHMOD_CALCULATOR,
  'curl-converter':     CURL_CONVERTER,
  'lorem-ipsum':        LOREM_IPSUM,
  'docker-compose':     DOCKER_COMPOSE,
  'json-flatten':       JSON_FLATTEN,
  'json-string-escape': JSON_STRING_ESCAPE,
  'html-entity':        HTML_ENTITY,
  'html-entity-escape': HTML_ENTITY,
  'ulid-generator':     ULID_GENERATOR,
  'random-port':        RANDOM_PORT,
  'api-tester':         API_TESTER,
  'xml-formatter':      XML_FORMATTER,
  'xml-minifier':       XML_FORMATTER,
  'xml-validator':       XML_FORMATTER,
  'html-formatter':     HTML_FORMATTER,
  'html-minifier':      HTML_FORMATTER,
  'html-validator':     HTML_FORMATTER,
};



function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem', color: 'var(--text-muted)' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Loading tool…
    </div>
  );
}

function ComingSoon({ tool }: { tool: Tool }) {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{tool.icon}</div>
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{tool.name}</h3>
      <p style={{ marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
        {tool.description}
      </p>
      <div className="badge badge-beta" style={{ fontSize: '0.875rem', padding: '0.375rem 0.875rem' }}>
        🚧 Coming Soon — Phase 2
      </div>
    </div>
  );
}

interface Props {
  tool: Tool;
}

export default function ToolPageClient({ tool }: Props) {
  const Component = TOOL_COMPONENTS[tool.slug];

  useEffect(() => {
    recordToolVisit(tool.slug);
  }, [tool.slug]);

  return (
    <ToolShell tool={tool}>
      <Suspense fallback={<LoadingSpinner />}>
        {Component ? <Component /> : <ComingSoon tool={tool} />}
      </Suspense>
    </ToolShell>
  );
}
