import { NextResponse } from "next/server";

const listResponse = {
  description: "A paginated list of iCloseLeads results.",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          object: { const: "list" },
          data: { type: "array", items: { type: "object" } },
          pagination: { $ref: "#/components/schemas/Pagination" },
          meta: { type: "object" },
        },
      },
    },
  },
};

const errorResponses = {
  "400": { description: "Invalid query parameters." },
  "401": { description: "Missing, invalid, or revoked API key." },
  "403": { description: "The key lacks the required scope or eligible plan." },
  "429": { description: "Daily request limit reached." },
  "503": { description: "Search is temporarily unavailable." },
};

const pagingParameters = [
  { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 25 } },
  { name: "cursor", in: "query", schema: { type: "integer", minimum: 0, maximum: 500, default: 0 } },
];

const jobParameters = [
  { name: "niches", in: "query", description: "Comma-separated niche slugs.", schema: { type: "string", default: "web-development" } },
  { name: "max_hours", in: "query", schema: { type: "integer", minimum: 1, maximum: 720 } },
  { name: "min_confidence", in: "query", schema: { type: "integer", minimum: 0, maximum: 100, default: 45 } },
  { name: "keyword", in: "query", schema: { type: "string", maxLength: 100 } },
  { name: "has_email", in: "query", schema: { type: "boolean", default: false } },
  { name: "urgent_only", in: "query", schema: { type: "boolean", default: false } },
  ...pagingParameters,
];

const document = {
  openapi: "3.1.0",
  info: {
    title: "iCloseLeads API",
    version: "1.0.0",
    description: "Search local business leads, remote jobs, and fresh live job opportunities.",
  },
  servers: [{ url: "https://icloseleads.com/api/v1" }],
  security: [{ bearerAuth: [] }],
  paths: {
    "/local-businesses": {
      get: {
        summary: "Search local businesses",
        operationId: "searchLocalBusinesses",
        parameters: [
          { name: "keyword", in: "query", required: true, schema: { type: "string", maxLength: 100 } },
          { name: "location", in: "query", required: true, schema: { type: "string", maxLength: 150 } },
          { name: "filter", in: "query", schema: { type: "string", enum: ["all", "no_website", "outdated_website", "has_website"], default: "no_website" } },
          ...pagingParameters,
        ],
        responses: { "200": listResponse, ...errorResponses },
      },
    },
    "/remote-jobs": {
      get: {
        summary: "Search remote jobs",
        operationId: "searchRemoteJobs",
        parameters: jobParameters,
        responses: { "200": listResponse, ...errorResponses },
      },
    },
    "/live-jobs": {
      get: {
        summary: "Search fresh live jobs",
        operationId: "searchLiveJobs",
        parameters: jobParameters,
        responses: { "200": listResponse, ...errorResponses },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "iCloseLeads API key" },
    },
    schemas: {
      Pagination: {
        type: "object",
        required: ["count", "total", "next_cursor", "has_more"],
        properties: {
          count: { type: "integer" },
          total: { type: "integer" },
          next_cursor: { type: ["integer", "null"] },
          has_more: { type: "boolean" },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(document, { headers: { "Cache-Control": "public, max-age=3600" } });
}
