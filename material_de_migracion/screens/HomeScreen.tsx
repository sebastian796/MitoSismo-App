import { StatusBar, BottomNav, MagBadge, magInfo } from "../components/shared";
import type { Quake } from "../data";

function IgnisCreature() {
  return (
    <svg width="52" height="60" viewBox="0 0 52 60">
      {/* Body */}
      <ellipse cx="26" cy="40" rx="16" ry="17" fill="#E8521A" />
      {/* Flame head */}
      <path
        d="M26,28 C20,20 16,10 22,2 C24,12 30,6 28,0 C36,8 38,18 32,26 C36,20 41,22 38,30 C34,22 30,26 26,28Z"
        fill="#E8942A"
      />
      {/* Eyes */}
      <circle cx="20" cy="38" r="3.5" fill="white" />
      <circle cx="32" cy="38" r="3.5" fill="white" />
      <circle cx="21" cy="38.8" r="1.8" fill="#1C0C04" />
      <circle cx="33" cy="38.8" r="1.8" fill="#1C0C04" />
      {/* Smile */}
      <path
        d="M20,46 Q26,51 32,46"
        stroke="white"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Arms */}
      <ellipse cx="9" cy="39" rx="5" ry="4" fill="#D44010" transform="rotate(-20 9 39)" />
      <ellipse cx="43" cy="39" rx="5" ry="4" fill="#D44010" transform="rotate(20 43 39)" />
      {/* Legs */}
      <ellipse cx="19" cy="54" rx="6" ry="4.5" fill="#C03808" />
      <ellipse cx="33" cy="54" rx="6" ry="4.5" fill="#C03808" />
    </svg>
  );
}

export default function HomeScreen({
  quakes,
  onNavigate,
}: {
  quakes: Quake[];
  onNavigate: (screen: string, data?: unknown) => void;
}) {
  const latest = quakes[0];
  const { bg, text } = magInfo(latest.mag);

  const quickActions = [
    {
      id: "map",
      label: "Ver mapa",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.7 2 6 4.7 6 8c0 5.3 6 13 6 13s6-7.7 6-13c0-3.3-2.7-6-6-6z" stroke="#2C1810" strokeWidth="1.8" />
          <circle cx="12" cy="8" r="2.5" stroke="#2C1810" strokeWidth="1.6" />
        </svg>
      ),
    },
    {
      id: "recent",
      label: "Sismos",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M2 12h4l3-9 4 18 3-12 2 3h4" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "prevention",
      label: "Prevención",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7L12 2z" stroke="#2C1810" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "missions",
      label: "Misiones",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polygon points="12,2 14.5,8.5 21,9.3 16,14 17.6,21 12,17.5 6.4,21 8,14 3,9.3 9.5,8.5" stroke="#2C1810" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

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

      {/* Header */}
      <div
        style={{
          padding: "8px 24px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ fontSize: 13, color: "#8A7A6A", margin: 0 }}>Lunes, 7 sep</p>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#1C0C04",
              margin: 0,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Hola, María 👋
          </h2>
        </div>

        {/* Creature indicator */}
        <button
          onClick={() => onNavigate("creature")}
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #DDD5C5",
            borderRadius: 16,
            padding: "6px 10px 6px 6px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <IgnisCreature />
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 11, color: "#8A7A6A", margin: 0, lineHeight: 1 }}>Criatura</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1C0C04", margin: 0 }}>Ignis</p>
            <p style={{ fontSize: 10, color: "#E8521A", margin: 0 }}>Nv. 7 🔥</p>
          </div>
        </button>
      </div>

      {/* Main scroll content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 16px" }}>
        {/* Latest quake card */}
        <div
          onClick={() => onNavigate("detail", latest)}
          style={{
            background: "#2C1810",
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background decoration */}
          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            style={{ position: "absolute", right: -30, top: -30, opacity: 0.06 }}
          >
            <circle cx="90" cy="90" r="80" fill="none" stroke="white" strokeWidth="40" />
          </svg>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: "rgba(248,244,238,0.6)", margin: 0, marginBottom: 4 }}>
                ÚLTIMO SISMO REGISTRADO
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 60,
                    color: "#FFFFFF",
                    lineHeight: 1,
                  }}
                >
                  {latest.mag.toFixed(1)}
                </span>
                <span style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", fontWeight: 300 }}>M</span>
              </div>
            </div>
            <span
              style={{
                background: bg,
                color: text,
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 99,
              }}
            >
              {latest.mag >= 6 ? "Fuerte" : latest.mag >= 5 ? "Moderado" : latest.mag >= 4 ? "Ligero" : "Menor"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1C4.8 1 3 2.8 3 5c0 3.1 4 8 4 8s4-4.9 4-8c0-2.2-1.8-4-4-4z" fill="rgba(200,169,110,0.8)" />
                <circle cx="7" cy="5" r="1.5" fill="white" />
              </svg>
              <span style={{ fontSize: 14, color: "rgba(248,244,238,0.9)", fontWeight: 500 }}>
                {latest.place}
              </span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 13, color: "rgba(248,244,238,0.6)" }}>
                Prof. {latest.depth} km
              </span>
              <span style={{ fontSize: 13, color: "rgba(248,244,238,0.6)" }}>{latest.time}</span>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 13, color: "rgba(200,169,110,0.9)", fontWeight: 500 }}>
              Ver detalle completo
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="#C8A96E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Quick access */}
        <p style={{ fontSize: 13, fontWeight: 600, color: "#8A7A6A", marginBottom: 12, letterSpacing: "0.04em" }}>
          ACCESO RÁPIDO
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #DDD5C5",
                borderRadius: 16,
                padding: "18px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 10,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "#F8F4EE",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {action.icon}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1C0C04" }}>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Recent quakes mini-list */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#8A7A6A", letterSpacing: "0.04em" }}>
            RECIENTES
          </p>
          <span
            onClick={() => onNavigate("recent")}
            style={{ fontSize: 13, color: "#C8A96E", fontWeight: 500, cursor: "pointer" }}
          >
            Ver todos
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {quakes.slice(1, 4).map((q) => {
            const { dot } = magInfo(q.mag);
            return (
              <div
                key={q.id}
                onClick={() => onNavigate("detail", q)}
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #DDD5C5",
                  borderRadius: 14,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: dot + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 18,
                      color: dot,
                      fontWeight: 400,
                    }}
                  >
                    {q.mag.toFixed(1)}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1C0C04",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {q.place}
                  </p>
                  <p style={{ fontSize: 12, color: "#8A7A6A", margin: 0 }}>
                    Prof. {q.depth} km · {q.time}
                  </p>
                </div>
                <MagBadge mag={q.mag} />
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}
