import { Logo } from "../components/shared";

export default function SplashScreen() {
  return (
    <div
      style={{
        width: 393,
        height: 852,
        background: "#2C1810",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background texture circles */}
      <div
        style={{
          position: "absolute",
          width: 480,
          height: 480,
          borderRadius: "50%",
          border: "1px solid rgba(200,169,110,0.12)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          border: "1px solid rgba(200,169,110,0.1)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />

      {/* Wave line decoration at bottom */}
      <svg
        width="393"
        height="120"
        viewBox="0 0 393 120"
        style={{ position: "absolute", bottom: 0, left: 0 }}
      >
        <path
          d="M0,80 C60,50 120,100 180,70 C240,40 300,90 393,60 L393,120 L0,120 Z"
          fill="rgba(200,169,110,0.08)"
        />
        <path
          d="M0,95 C80,65 160,110 240,80 C310,55 360,95 393,75 L393,120 L0,120 Z"
          fill="rgba(200,169,110,0.06)"
        />
      </svg>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        <Logo size={100} />

        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 40,
              color: "#F8F4EE",
              letterSpacing: "-0.5px",
              lineHeight: 1,
              margin: 0,
            }}
          >
            MitoSismo
          </h1>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 15,
              color: "#C8A96E",
              letterSpacing: "0.04em",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Infórmate, prepárate y aprende
          </p>
        </div>
      </div>

      {/* Bottom indicator */}
      <div style={{ position: "absolute", bottom: 52, display: "flex", gap: 6 }}>
        <div style={{ width: 24, height: 4, borderRadius: 2, background: "#C8A96E" }} />
        <div style={{ width: 8, height: 4, borderRadius: 2, background: "rgba(200,169,110,0.3)" }} />
        <div style={{ width: 8, height: 4, borderRadius: 2, background: "rgba(200,169,110,0.3)" }} />
      </div>
    </div>
  );
}
