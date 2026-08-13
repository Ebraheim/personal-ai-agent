import { ImageResponse } from "next/og";

export const alt =
  "Gradfolio — Turn your CV into a website that speaks for you.";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#070b12",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 760,
            height: 760,
            borderRadius: 9999,
            background: "rgba(103, 232, 249, 0.10)",
            filter: "blur(80px)",
            top: -360,
            right: -140,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(34, 211, 238, 0.06)",
            filter: "blur(70px)",
            bottom: -300,
            left: -120,
          }}
        />

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 76px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 16,
                border: "1px solid rgba(103,232,249,0.28)",
                background: "rgba(103,232,249,0.08)",
                color: "#67e8f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
              }}
            >
              ✦
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                Gradfolio
              </div>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 18,
                  color: "rgba(255,255,255,0.46)",
                }}
              >
                AI-powered career websites for students & graduates
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 960,
            }}
          >
            <div
              style={{
                fontSize: 72,
                lineHeight: 1.03,
                letterSpacing: "-0.045em",
                fontWeight: 750,
              }}
            >
              Turn your CV into a
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 72,
                lineHeight: 1.03,
                letterSpacing: "-0.045em",
                fontWeight: 750,
                color: "#67e8f9",
              }}
            >
              website that speaks for you.
            </div>

            <div
              style={{
                marginTop: 30,
                fontSize: 25,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.55)",
                maxWidth: 860,
              }}
            >
              Projects. Skills. Education. Experience. Achievements.
              One polished link for recruiters.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 18,
              color: "rgba(255,255,255,0.34)",
            }}
          >
            <div>gradfolio-ai.vercel.app</div>
            <div style={{ color: "#67e8f9" }}>Build your Gradfolio →</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}