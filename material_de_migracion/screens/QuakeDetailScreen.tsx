import { StatusBar, TopBar, magInfo } from "../components/shared";
import type { Quake } from "../data";

function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  // Simple epicenter map centered on the quake location
  // Show a grid + epicenter marker
  return (
    <div
      style={{
        width: "100%",
        height: 140,
        background: "#C8DFE8",
        borderRadius: 14,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg width="100%" height="140" viewBox="0 0 353 140">
        <rect width="353" height="140" fill="#C8DFE8" />
        {/* Grid */}
        {[0, 70, 140, 210, 280, 353].map((x) => (
          <line key={x} x1={x} y1={0} x2={x} y2={140} stroke="white" strokeWidth="0.5" opacity="0.5" />
        ))}
        {[0, 35, 70, 105, 140].map((y) => (
          <line key={y} x1={0} y1={y} x2={353} y2={y} stroke="white" strokeWidth="0.5" opacity="0.5" />
        ))}
        {/* Epicenter rings */}
        <circle cx="176" cy="70" r="45" fill="none" stroke="#D4421A" strokeWidth="1" opacity="0.3" />
        <circle cx="176" cy="70" r="28" fill="none" stroke="#D4421A" strokeWidth="1" opacity="0.5" />
        <circle cx="176" cy="70" r="14" fill="#D4421A" opacity="0.2" />
        {/* Crosshair */}
        <line x1="176" y1="52" x2="176" y2="88" stroke="#D4421A" strokeWidth="1.5" />
        <line x1="158" y1="70" x2="194" y2="70" stroke="#D4421A" strokeWidth="1.5" />
        <circle cx="176" cy="70" r="5" fill="#D4421A" stroke="white" strokeWidth="1.5" />
        {/* Coord labels */}
        <text x="8" y="135" fontSize="9" fill="#8A7A6A" fontFamily="'Outfit',sans-serif">
          {Math.abs(lat).toFixed(2)}° {lat < 0 ? "S" : "N"}
        </text>
        <text x="280" y="135" fontSize="9" fill="#8A7A6A" fontFamily="'Outfit',sans-serif">
          {Math.abs(lng).toFixed(2)}° {lng < 0 ? "O" : "E"}
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "white",
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: 10,
          fontWeight: 600,
          color: "#1C0C04",
        }}
      >
        EPICENTRO
      </div>
    </div>
  );
}

const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 0",
      borderBottom: "1px solid #F0EAE0",
    }}
  >
    <span style={{ fontSize: 14, color: "#8A7A6A" }}>{label}</span>
    <span
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: highlight ? "#D4421A" : "#1C0C04",
        textAlign: "right",
        maxWidth: "55%",
      }}
    >
      {value}
    </span>
  </div>
);

export default function QuakeDetailScreen({
  quake,
  onBack,
  onNavigate,
}: {
  quake: Quake;
  onBack: () => void;
  onNavigate: (screen: string, data?: unknown) => void;
}) {
  const { bg, text, label, dot } = magInfo(quake.mag);

  return (
    <div
      style={{
        width: 393,
        height: 852,
        background: "#F8F4EE",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <StatusBar />
      <TopBar title="Detalle del sismo" onBack={onBack} />

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>
        {/* Hero magnitude */}
        <div
          style={{
            background: "#2C1810",
            borderRadius: 20,
            padding: "24px 24px 20px",
            marginBottom: 20,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* BG rings */}
          <svg width="200" height="200" style={{ position: "absolute", right: -40, top: -40, opacity: 0.07 }}>
            <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="40" />
          </svg>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 88,
                color: "#FFFFFF",
                lineHeight: 0.9,
              }}
            >
              {quake.mag.toFixed(1)}
            </span>
            <div style={{ paddingBottom: 8 }}>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", margin: 0 }}>Magnitud</p>
              <span
                style={{
                  background: bg,
                  color: text,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "3px 12px",
                  borderRadius: 99,
                  display: "inline-block",
                }}
              >
                {label}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1C4.8 1 3 2.8 3 5c0 3.1 4 8 4 8s4-4.9 4-8c0-2.2-1.8-4-4-4z" fill="#C8A96E" />
              <circle cx="7" cy="5" r="1.5" fill="white" />
            </svg>
            <span style={{ fontSize: 15, color: "#F8F4EE", fontWeight: 500 }}>{quake.place}</span>
          </div>
          <span style={{ fontSize: 13, color: "rgba(248,244,238,0.6)" }}>{quake.fullDate}</span>
        </div>

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Profundidad", value: `${quake.depth} km`, icon: "⬇️" },
            { label: "Coordenadas", value: quake.coords, icon: "📍" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #DDD5C5",
                borderRadius: 16,
                padding: "16px",
              }}
            >
              <p style={{ fontSize: 20, margin: "0 0 8px" }}>{item.icon}</p>
              <p style={{ fontSize: 12, color: "#8A7A6A", margin: "0 0 4px" }}>{item.label}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1C0C04", margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Mini map */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#8A7A6A", marginBottom: 10, letterSpacing: "0.04em" }}>
            UBICACIÓN DEL EPICENTRO
          </p>
          <MiniMap lat={quake.lat} lng={quake.lng} />
        </div>

        {/* Event info */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #DDD5C5",
            borderRadius: 16,
            padding: "16px 20px",
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1C0C04", margin: "0 0 4px" }}>
            Información del evento
          </p>
          <p style={{ fontSize: 12, color: "#8A7A6A", margin: "0 0 12px" }}>
            Datos registrados por la red sísmica regional
          </p>
          <Row label="Fecha y hora" value={quake.fullDate} />
          <Row label="Magnitud" value={`M ${quake.mag.toFixed(1)}`} highlight />
          <Row label="Profundidad" value={`${quake.depth} km`} />
          <Row label="Coordenadas" value={quake.coords} />
          <Row label="País" value={quake.country} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
            <span style={{ fontSize: 14, color: "#8A7A6A" }}>Intensidad estimada</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: n <= Math.round(quake.mag / 2) ? dot : "#EDE8DC",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Prevention button */}
        <button
          onClick={() => onNavigate("prevention")}
          style={{
            width: "100%",
            height: 52,
            background: "#F8F4EE",
            border: "1.5px solid #2C1810",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1.5L2.25 5.25v4.5C2.25 13.5 5.1 17.3 9 18.5 12.9 17.3 15.75 13.5 15.75 9.75v-4.5L9 1.5z" stroke="#2C1810" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M6.75 9l1.5 1.5 3-3" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#2C1810" }}>
            Ver recomendaciones de prevención
          </span>
        </button>
      </div>
    </div>
  );
}
