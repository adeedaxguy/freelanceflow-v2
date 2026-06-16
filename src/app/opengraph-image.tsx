import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "iCloseLeads — AI-Powered Client Acquisition for Freelancers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f0a1e 0%, #1a0f3a 50%, #0a1628 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
        }} />

        {/* Logo mark */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 32,
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
          }}>⚡</div>
          <span style={{ fontSize: 40, fontWeight: 800, color: "#ffffff", letterSpacing: "-1px" }}>
            iCloseLeads
          </span>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 56,
          fontWeight: 900,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.1,
          maxWidth: 900,
          marginBottom: 24,
        }}>
          Find Freelance Clients
          <br />
          <span style={{ color: "#a78bfa" }}>on Autopilot</span>
        </div>

        {/* Subtext */}
        <div style={{
          fontSize: 24,
          color: "#94a3b8",
          textAlign: "center",
          maxWidth: 720,
          marginBottom: 40,
        }}>
          23 live sources · AI proposals · CRM pipeline · Free to start
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Remote Jobs", "Local Leads", "AI Proposals", "Free Plan"].map(badge => (
            <div key={badge} style={{
              padding: "10px 20px",
              borderRadius: 50,
              border: "1px solid rgba(139,92,246,0.4)",
              background: "rgba(139,92,246,0.1)",
              color: "#c4b5fd",
              fontSize: 18,
              fontWeight: 600,
            }}>
              {badge}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          position: "absolute",
          bottom: 32,
          color: "#475569",
          fontSize: 18,
        }}>
          icloseleads.com
        </div>
      </div>
    ),
    { ...size }
  );
}
