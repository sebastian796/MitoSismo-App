import { StatusBar, TopBar } from "../components/shared";

function IgnisFull() {
  return (
    <svg width="160" height="190" viewBox="0 0 160 190">
      {/* Shadow */}
      <ellipse cx="80" cy="178" rx="44" ry="8" fill="rgba(0,0,0,0.08)" />
      {/* Body */}
      <ellipse cx="80" cy="120" rx="44" ry="48" fill="#E8521A" />
      {/* Belly */}
      <ellipse cx="80" cy="130" rx="26" ry="28" fill="#F07040" opacity="0.5" />
      {/* Flame head - multiple layers */}
      <path d="M80,85 C65,65 52,38 68,12 C72,32 84,22 80,6 C98,20 105,45 95,68 C103,54 114,58 110,74 C102,60 90,68 80,85Z" fill="#F07C28" />
      <path d="M80,80 C70,65 62,48 72,28 C74,38 82,32 80,20 C92,32 96,50 88,66Z" fill="#FFC030" />
      <path d="M80,75 C74,65 70,55 76,42 C78,50 83,46 82,38 C88,46 90,58 84,68Z" fill="#FFF0A0" opacity="0.8" />
      {/* Eyes */}
      <circle cx="64" cy="116" r="10" fill="white" />
      <circle cx="96" cy="116" r="10" fill="white" />
      <circle cx="66" cy="118" r="5.5" fill="#1C0C04" />
      <circle cx="98" cy="118" r="5.5" fill="#1C0C04" />
      <circle cx="68" cy="116" r="2" fill="white" />
      <circle cx="100" cy="116" r="2" fill="white" />
      {/* Eyebrows */}
      <path d="M56,105 Q64,100 72,105" stroke="#C03808" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M88,105 Q96,100 104,105" stroke="#C03808" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Smile */}
      <path d="M62,133 Q80,148 98,133" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Teeth */}
      <path d="M68,133 L68,139" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M80,136 L80,143" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M92,133 L92,139" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Arms */}
      <ellipse cx="30" cy="118" rx="12" ry="9" fill="#D44010" transform="rotate(-25 30 118)" />
      <ellipse cx="130" cy="118" rx="12" ry="9" fill="#D44010" transform="rotate(25 130 118)" />
      {/* Claws */}
      <path d="M22,110 L18,105 M22,113 L17,111 M24,117 L18,116" stroke="#C03808" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M138,110 L142,105 M138,113 L143,111 M136,117 L142,116" stroke="#C03808" strokeWidth="1.8" strokeLinecap="round" />
      {/* Legs */}
      <ellipse cx="60" cy="163" rx="18" ry="12" fill="#C03808" />
      <ellipse cx="100" cy="163" rx="18" ry="12" fill="#C03808" />
      {/* Feet */}
      <path d="M48,170 L44,174 M55,172 L53,177 M62,172 L62,177" stroke="#A02008" strokeWidth="2" strokeLinecap="round" />
      <path d="M98,172 L98,177 M105,172 L107,177 M112,170 L116,174" stroke="#A02008" strokeWidth="2" strokeLinecap="round" />
      {/* Tail */}
      <path d="M118,145 C135,135 145,125 140,110 C136,100 130,105 132,118" stroke="#D44010" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M140,110 C143,100 148,92 142,85 C140,95 135,98 138,108" fill="#F07C28" />
    </svg>
  );
}

function OtherCreature({
  element,
  color,
  emoji,
  name,
}: {
  element: string;
  color: string;
  emoji: string;
  name: string;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1.5px solid #DDD5C5",
        borderRadius: 16,
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        flex: 1,
        opacity: 0.6,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: color + "20",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
        }}
      >
        {emoji}
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: "#1C0C04", margin: 0 }}>{name}</p>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: 99,
          background: color + "20",
          color: color,
        }}
      >
        {element}
      </span>
      <p style={{ fontSize: 11, color: "#8A7A6A", margin: 0 }}>Bloqueada</p>
    </div>
  );
}

export default function CreatureScreen({ onBack }: { onBack: () => void }) {
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
      <TopBar title="Mi criatura" onBack={onBack} />

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>
        {/* Main creature card */}
        <div
          style={{
            background: "linear-gradient(145deg, #2C1810 0%, #3D2218 100%)",
            borderRadius: 24,
            padding: "24px 24px 20px",
            marginBottom: 20,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(232,82,26,0.25) 0%, transparent 70%)",
              bottom: -40,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />

          {/* Element badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <span
              style={{
                background: "rgba(232,148,42,0.25)",
                color: "#E8942A",
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 99,
                letterSpacing: "0.05em",
              }}
            >
              🔥 FUEGO
            </span>
            <span
              style={{
                background: "rgba(200,169,110,0.2)",
                color: "#C8A96E",
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: 99,
              }}
            >
              Etapa 2 — Llamas
            </span>
          </div>

          {/* Creature */}
          <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
            <IgnisFull />
          </div>

          {/* Name & level */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 36,
                color: "#FFFFFF",
                margin: 0,
                letterSpacing: "0.02em",
              }}
            >
              Ignis
            </h2>
            <p style={{ fontSize: 14, color: "rgba(248,244,238,0.6)", margin: "4px 0 0" }}>
              Criatura elemental de fuego
            </p>
          </div>

          {/* Level & XP */}
          <div
            style={{
              background: "rgba(0,0,0,0.25)",
              borderRadius: 16,
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "rgba(248,244,238,0.7)" }}>Nivel 7</span>
              <span style={{ fontSize: 13, color: "#C8A96E", fontWeight: 600 }}>680 / 1000 XP</span>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.15)", borderRadius: 99, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: "68%",
                  background: "linear-gradient(90deg, #E8521A, #E8942A)",
                  borderRadius: 99,
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: "rgba(248,244,238,0.5)", margin: "6px 0 0", textAlign: "center" }}>
              320 XP para siguiente nivel
            </p>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #DDD5C5",
            borderRadius: 16,
            padding: "16px 20px",
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1C0C04", margin: "0 0 14px" }}>
            Estadísticas
          </p>
          {[
            { label: "Fuerza", value: 72, color: "#D4421A" },
            { label: "Velocidad", value: 58, color: "#E8942A" },
            { label: "Resistencia", value: 65, color: "#C8A96E" },
            { label: "Inteligencia", value: 80, color: "#4A9058" },
          ].map((stat) => (
            <div key={stat.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#8A7A6A" }}>{stat.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: stat.color }}>{stat.value}</span>
              </div>
              <div style={{ height: 5, background: "#F0EAE0", borderRadius: 99, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${stat.value}%`,
                    background: stat.color,
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Evolution */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#8A7A6A", marginBottom: 10, letterSpacing: "0.04em" }}>
            EVOLUCIÓN
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {["🥚 Huevo", "🔥 Llamas", "🌋 Volcán"].map((stage, i) => (
              <div key={stage} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: i === 1 ? "#E8521A" : i < 1 ? "#4A9058" : "#EDE8DC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      margin: "0 auto 6px",
                      border: i === 1 ? "2px solid #C8A96E" : "none",
                    }}
                  >
                    {stage.split(" ")[0]}
                  </div>
                  <p style={{ fontSize: 11, color: i === 1 ? "#1C0C04" : "#8A7A6A", margin: 0, fontWeight: i === 1 ? 700 : 400 }}>
                    {stage.split(" ").slice(1).join(" ")}
                  </p>
                </div>
                {i < 2 && (
                  <svg width="20" height="8" viewBox="0 0 20 8">
                    <path d="M0 4h16M13 1l3 3-3 3" stroke={i < 1 ? "#4A9058" : "#DDD5C5"} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Other creatures */}
        <p style={{ fontSize: 13, fontWeight: 600, color: "#8A7A6A", marginBottom: 10, letterSpacing: "0.04em" }}>
          OTRAS CRIATURAS
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <OtherCreature element="AGUA" color="#2E7DA8" emoji="💧" name="Aqua" />
          <OtherCreature element="PLANTA" color="#4A9058" emoji="🌿" name="Sylva" />
          <OtherCreature element="RAYO" color="#C8A030" emoji="⚡" name="Volt" />
        </div>
      </div>
    </div>
  );
}
