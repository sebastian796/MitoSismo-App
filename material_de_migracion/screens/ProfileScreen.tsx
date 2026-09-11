import { useState } from "react";
import { StatusBar, BottomNav } from "../components/shared";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        background: on ? "#2C1810" : "#DDD5C5",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "white",
          top: 3,
          left: on ? 23 : 3,
          transition: "left 0.2s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

export default function ProfileScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [notifSismos, setNotifSismos] = useState(true);
  const [notifMisiones, setNotifMisiones] = useState(true);
  const [notifPrevención, setNotifPrevención] = useState(false);

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

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Header */}
        <div
          style={{
            background: "#2C1810",
            padding: "16px 24px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#C8A96E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid rgba(255,255,255,0.2)",
              }}
            >
              <span style={{ fontSize: 36 }}>👩</span>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#C8A96E",
                border: "2px solid #2C1810",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 24,
                color: "#F8F4EE",
                margin: 0,
              }}
            >
              María González
            </h2>
            <p style={{ fontSize: 14, color: "rgba(248,244,238,0.6)", margin: "4px 0 0" }}>
              maria.gonzalez@correo.pe
            </p>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 4,
              padding: "10px 20px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: 14,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#F8F4EE", margin: 0 }}>1</p>
              <p style={{ fontSize: 11, color: "rgba(248,244,238,0.6)", margin: 0 }}>Completada</p>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#C8A96E", margin: 0 }}>100</p>
              <p style={{ fontSize: 11, color: "rgba(248,244,238,0.6)", margin: 0 }}>XP total</p>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#F8F4EE", margin: 0 }}>Nv. 7</p>
              <p style={{ fontSize: 11, color: "rgba(248,244,238,0.6)", margin: 0 }}>Ignis 🔥</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 20px 32px" }}>
          {/* Personal info */}
          <p style={{ fontSize: 13, fontWeight: 600, color: "#8A7A6A", marginBottom: 10, letterSpacing: "0.04em" }}>
            INFORMACIÓN PERSONAL
          </p>
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #DDD5C5",
              borderRadius: 16,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            {[
              { label: "Nombre", value: "María González" },
              { label: "Correo", value: "maria.gonzalez@correo.pe" },
              { label: "País", value: "🇵🇪 Perú" },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  padding: "14px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: i < arr.length - 1 ? "1px solid #F0EAE0" : "none",
                }}
              >
                <span style={{ fontSize: 14, color: "#8A7A6A" }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#1C0C04" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Creature */}
          <p style={{ fontSize: 13, fontWeight: 600, color: "#8A7A6A", marginBottom: 10, letterSpacing: "0.04em" }}>
            MI CRIATURA
          </p>
          <button
            onClick={() => onNavigate("creature")}
            style={{
              width: "100%",
              background: "#FFFFFF",
              border: "1.5px solid #DDD5C5",
              borderRadius: 16,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              textAlign: "left",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "rgba(232,82,26,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              🔥
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#1C0C04", margin: 0 }}>Ignis</p>
              <p style={{ fontSize: 13, color: "#8A7A6A", margin: 0 }}>Fuego · Nivel 7 · 680 XP</p>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1l6 6-6 6" stroke="#DDD5C5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Notifications */}
          <p style={{ fontSize: 13, fontWeight: 600, color: "#8A7A6A", marginBottom: 10, letterSpacing: "0.04em" }}>
            NOTIFICACIONES
          </p>
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #DDD5C5",
              borderRadius: 16,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            {[
              { label: "Alertas de sismos", sub: "Sismos M≥4.0 en tu región", on: notifSismos, toggle: () => setNotifSismos(!notifSismos) },
              { label: "Recordatorios de misiones", sub: "Progreso y nuevas misiones", on: notifMisiones, toggle: () => setNotifMisiones(!notifMisiones) },
              { label: "Consejos de prevención", sub: "Recomendaciones semanales", on: notifPrevención, toggle: () => setNotifPrevención(!notifPrevención) },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderBottom: i < arr.length - 1 ? "1px solid #F0EAE0" : "none",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#1C0C04", margin: 0 }}>{row.label}</p>
                  <p style={{ fontSize: 12, color: "#8A7A6A", margin: 0 }}>{row.sub}</p>
                </div>
                <Toggle on={row.on} onToggle={row.toggle} />
              </div>
            ))}
          </div>

          {/* Sign out */}
          <button
            style={{
              width: "100%",
              height: 52,
              background: "transparent",
              border: "1.5px solid #E8A090",
              borderRadius: 14,
              color: "#D4421A",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 2H3a1 1 0 00-1 1v12a1 1 0 001 1h4" stroke="#D4421A" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 13l4-4-4-4" stroke="#D4421A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 9h9" stroke="#D4421A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>

      <BottomNav active="profile" onNavigate={onNavigate} />
    </div>
  );
}
