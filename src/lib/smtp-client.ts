/**
 * Minimal SMTP client — zero dependencies, uses Node.js net + tls built-ins.
 * Supports STARTTLS (port 587) and implicit TLS (port 465).
 * AUTH LOGIN only (covers Gmail App Password, Outlook, any standard SMTP).
 */

import * as net from "net";
import * as tls from "tls";

export interface SmtpConfig {
  host: string;
  port: number;
  /** true = implicit TLS (port 465). false = plaintext + STARTTLS (port 587). */
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName?: string;
}

function b64(s: string): string {
  return Buffer.from(s, "utf8").toString("base64");
}

function sanitizeName(name: string): string {
  // Remove characters that break MIME From header
  return name.replace(/["\r\n]/g, "").trim();
}

function buildMime(
  from: string,
  to: string,
  subject: string,
  text: string,
  html: string,
): string {
  const boundary = `=_Part_${Date.now().toString(16)}_${Math.random().toString(36).slice(2)}`;
  const msgId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@ff.io>`;
  const lines = [
    `Message-ID: ${msgId}`,
    `Date: ${new Date().toUTCString()}`,
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    text.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n"),
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    html,
    ``,
    `--${boundary}--`,
  ];
  // Dot-stuffing: lines starting with "." must be doubled
  return lines
    .map(l => (l.startsWith(".") ? "." + l : l))
    .join("\r\n");
}

export async function smtpSend(
  cfg: SmtpConfig,
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<void> {
  const displayFrom = cfg.fromName
    ? `"${sanitizeName(cfg.fromName)}" <${cfg.fromEmail}>`
    : cfg.fromEmail;

  const mime = buildMime(displayFrom, to, subject, text, html);

  return new Promise<void>((resolve, reject) => {
    let finished = false;
    const timer = setTimeout(() => done(new Error("SMTP timeout")), 20_000);

    function done(err?: Error) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      try { rawSock?.destroy(); } catch {}
      if (err) reject(err); else resolve();
    }

    // State machine
    // 0=greeting 1=ehlo 2=starttls 3=ehlo2 4=auth 5=username 6=password
    // 7=mailfrom 8=rcptto 9=data_cmd 10=data_body 11=quit
    let state = 0;
    let buffer = "";
    // rawSock is always the original TCP socket; activeSock may be upgraded to TLS
    let rawSock: net.Socket | null = null;
    let activeSock: net.Socket | tls.TLSSocket | null = null;

    const write = (line: string) => {
      activeSock?.write(line + "\r\n");
    };

    const handleLine = (line: string) => {
      // Only process terminal lines of multi-line responses (code + space)
      if (line.length < 4 || line[3] !== " ") return;
      const code = parseInt(line.slice(0, 3), 10);

      switch (state) {
        case 0: // waiting for 220 greeting
          if (code === 220) { state = 1; write("EHLO icloseleads.com"); }
          else done(new Error(`Bad greeting: ${line}`));
          break;

        case 1: // EHLO response
          if (code === 250) {
            if (!cfg.secure) { state = 2; write("STARTTLS"); }
            else { state = 4; write("AUTH LOGIN"); }
          } else done(new Error(`EHLO failed: ${line}`));
          break;

        case 2: // STARTTLS response
          if (code === 220) {
            // Upgrade TCP → TLS in-place
            const tlsSock = tls.connect({
              socket: rawSock as net.Socket,
              host: cfg.host,
              rejectUnauthorized: false,
            });
            tlsSock.once("error", (e) => done(e));
            tlsSock.once("secureConnect", () => {
              activeSock = tlsSock;
              activeSock.on("data", onData);
              state = 3;
              write("EHLO icloseleads.com");
            });
          } else done(new Error(`STARTTLS failed: ${line}`));
          break;

        case 3: // post-TLS EHLO
          if (code === 250) { state = 4; write("AUTH LOGIN"); }
          else done(new Error(`EHLO2 failed: ${line}`));
          break;

        case 4: // AUTH LOGIN challenge (334 + base64("Username:"))
          if (code === 334) { state = 5; write(b64(cfg.user)); }
          else done(new Error(`AUTH LOGIN rejected: ${line}`));
          break;

        case 5: // password challenge (334 + base64("Password:"))
          if (code === 334) { state = 6; write(b64(cfg.pass)); }
          else done(new Error(`AUTH username rejected: ${line}`));
          break;

        case 6: // auth result
          if (code === 235) { state = 7; write(`MAIL FROM:<${cfg.fromEmail}>`); }
          else done(new Error(`Authentication failed (check credentials): ${line}`));
          break;

        case 7: // MAIL FROM response
          if (code === 250) { state = 8; write(`RCPT TO:<${to}>`); }
          else done(new Error(`MAIL FROM rejected: ${line}`));
          break;

        case 8: // RCPT TO response
          if (code === 250) { state = 9; write("DATA"); }
          else done(new Error(`RCPT TO rejected (check recipient): ${line}`));
          break;

        case 9: // DATA go-ahead (354)
          if (code === 354) {
            state = 10;
            activeSock?.write(mime + "\r\n.\r\n");
          } else done(new Error(`DATA failed: ${line}`));
          break;

        case 10: // message accepted
          if (code === 250) { state = 11; write("QUIT"); done(); }
          else done(new Error(`Message rejected by server: ${line}`));
          break;
      }
    };

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\r\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) handleLine(line);
    };

    // Open connection
    if (cfg.secure) {
      // Implicit TLS (port 465)
      const tlsSock = tls.connect({
        host: cfg.host,
        port: cfg.port,
        rejectUnauthorized: false,
      });
      tlsSock.once("error", (e) => done(e));
      tlsSock.once("secureConnect", () => {
        rawSock = tlsSock as unknown as net.Socket;
        activeSock = tlsSock;
        activeSock.on("data", onData);
      });
    } else {
      // Plaintext → STARTTLS (port 587 / 25)
      rawSock = net.createConnection({ host: cfg.host, port: cfg.port });
      activeSock = rawSock;
      rawSock.once("error", (e) => done(e));
      rawSock.on("data", onData);
    }

    rawSock?.once("close", () => {
      if (!finished && state < 11) done(new Error("Connection closed unexpectedly"));
    });
  });
}
