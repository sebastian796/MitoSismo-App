import { StatusBar, BottomNav } from "../components/shared";
import type { Mission } from "../data";

function MissionCard({ mission }: { mission: Mission }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: `1.5px solid ${mission.completed ? "#4A9058" : "#DDD5C5"}`,
        borderRadius: 16,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {mission.completed && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "#4A9058",
            borderRadius: "16px 16px 0 0",
          }}
        />
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Icon */}
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: mission.completed ? "#D4EDDA" : "#F8F4EE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {mission.icon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1C0C04",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {mission.title}
            </p>
            {mission.completed && (
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#4A9058",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
          <p style={{ fontSize: 13, color: "#8A7A6A", margin: "4px 0 0", lineHeight: 1.4 }}>
            {mission.description}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#8A7A6A" }}>
            {mission.completed ? "Completada" : `Progreso: ${mission.progress}%`}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#C8A96E",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polygon points="6,1 7.2,4.3 10.8,4.5 8,6.8 9,10.2 6,8.2 3,10.2 4,6.8 1.2,4.5 4.8,4.3" fill="#C8A96E" />
            </svg>
            +{mission.xp} XP
          </span>
        </div>
        <div
          style={{
            height: 6,
            background: "#F0EAE0",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${mission.progress}%`,
              background: mission.completed ? "#4A9058" : "#C8A96E",
              borderRadius: 99,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {!mission.completed && mission.progress > 0 && (
        <button
          style={{
            height: 38,
            background: "#2C1810",
            color: "#F8F4EE",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Continuar misión
        </button>
      )}

      {!mission.completed && mission.progress === 0 && (
        <button
          style={{
            height: 38,
            background: "transparent",
            color: "#2C1810",
            border: "1.5px solid #DDD5C5",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Comenzar misión
        </button>
      )}
    </div>
  );
}

export default function MissionsScreen({
  missions,
  onNavigate,
}: {
  missions: Mission[];
  onNavigate: (screen: string, data?: unknown) => void;
}) {
  const completed = missions.filter((m) => m.completed).length;
  const totalXP = missions.filter((m) => m.completed).reduce((acc, m) => acc + m.xp, 0);

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
      <div style={{ padding: "8px 24px 16px", flexShrink: 0 }}>
        <p style={{ fontSize: 13, color: "#8A7A6A", margin: 0 }}>Aprende y gana experiencia</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1C0C04", margin: "2px 0 0", fontFamily: "'Outfit', sans-serif" }}>
          Misiones
        </h2>
      </div>

      {/* Summary bar */}
      <div
        style={{
          margin: "0 20px 16px",
          background: "#2C1810",
          borderRadius: 16,
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div>
          <p style={{ fontSize: 12, color: "rgba(248,244,238,0.6)", margin: 0 }}>Completadas</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "white", margin: 0 }}>
            {completed} / {missions.length}
          </p>
        </div>
        <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 12, color: "rgba(248,244,238,0.6)", margin: 0 }}>XP ganado</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#C8A96E", margin: 0 }}>{totalXP}</p>
        </div>
        <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 12, color: "rgba(248,244,238,0.6)", margin: 0 }}>Progreso</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "white", margin: 0 }}>
            {Math.round((completed / missions.length) * 100)}%
          </p>
        </div>
      </div>

      {/* Missions list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      </div>

      <BottomNav active="missions" onNavigate={onNavigate} />
    </div>
  );
}
