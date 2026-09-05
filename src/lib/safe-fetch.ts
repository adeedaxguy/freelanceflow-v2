import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { TextDecoder } from "node:util";

const BLOCKED_HOST_SUFFIXES = [".internal", ".local", ".localhost", ".home", ".lan"];

export function isPrivateAddress(address: string): boolean {
  if (address.includes(":")) {
    const normalized = (address.toLowerCase().split("%")[0] ?? "").replace(/^\[|\]$/g, "");
    if (normalized.startsWith("::ffff:")) return true;
    return normalized === "::" || normalized === "::1"
      || normalized.startsWith("fc") || normalized.startsWith("fd")
      || /^fe[89ab]/.test(normalized)
      || normalized.startsWith("ff")
      || normalized.startsWith("2001:db8:");
  }

  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b, c] = parts as [number, number, number, number];
  return a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 168 || (b === 0 && (c === 0 || c === 2))))
    || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100)))
    || (a === 203 && b === 0 && c === 113);
}

async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Only public HTTP and HTTPS URLs are allowed");
  }

  const hostname = url.hostname.replace(/\.$/, "").replace(/^\[|\]$/g, "").toLowerCase();
  if (!hostname || hostname === "localhost" || !hostname.includes(".")
    || BLOCKED_HOST_SUFFIXES.some(suffix => hostname.endsWith(suffix))) {
    throw new Error("Private network URLs are not allowed");
  }

  const literalVersion = isIP(hostname);
  if (literalVersion) {
    if (isPrivateAddress(hostname)) throw new Error("Private network URLs are not allowed");
    return url;
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("Private network URLs are not allowed");
  }
  return url;
}

export async function safeFetch(raw: string, init: RequestInit = {}, maxRedirects = 4): Promise<Response> {
  let url = await assertPublicUrl(raw);
  const headers = new Headers(init.headers);
  headers.delete("authorization");
  headers.delete("cookie");
  headers.delete("proxy-authorization");

  for (let redirects = 0; redirects <= maxRedirects; redirects += 1) {
    const response = await fetch(url.toString(), { ...init, headers, redirect: "manual" });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;

    const location = response.headers.get("location");
    if (!location || redirects === maxRedirects) throw new Error("Too many redirects");
    url = await assertPublicUrl(new URL(location, url).toString());
  }

  throw new Error("Too many redirects");
}

export async function readLimitedText(response: Response, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    const output = await response.text();
    if (Buffer.byteLength(output, "utf8") > maxBytes) {
      throw new Error("Response exceeded the allowed size");
    }
    return output;
  }

  const decoder = new TextDecoder();
  let bytes = 0;
  let output = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maxBytes) {
      await reader.cancel();
      throw new Error("Response exceeded the allowed size");
    }
    output += decoder.decode(value, { stream: true });
  }
  return output + decoder.decode();
}
