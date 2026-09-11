import { useState } from "react";
import { StatusBar, TopBar, BottomNav, MagBadge, magInfo } from "../components/shared";
import type { Quake } from "../data";

export default function RecentScreen({
  quakes,
  onNavigate,
}: {
  quakes: Quake[];
  onNavigate: (screen: string, data?: unknown) => void;
}) {
  const [country, setCountry] = useState("Todos");
  const [minMag, setMinMag] = useState("Todos");

  const countries = ["Todos", "Perú", "Chile", "Ecuador", "Colombia", "México"];
  const magOptions = ["Todos", "≥ 3", "≥ 4", "≥ 5"];

  const filtered = quakes.filter((q) => {
    const passCountry = country === "Todos" || q.country === country;
    const passMag = minMag === "Todos" || q.mag >= parseFloat(minMag.replace("≥ ", ""));
    return passCountry && passMag;
  });

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
      <TopBar title="Sismos recientes" />

      {/* Filters */}
      <div style={{ padding: "0 20px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 8 }}>
          {countries.map((c) => (
            <button
              key={c}
              onClick={() => setCountry(c)}
              style={{
                padding: "5px 12px",
                borderRadius: 99,
                border: "1.5px solid",
                borderColor: country === c ? "#2C1810" : "#DDD5C5",
                background: country === c ? "#2C1810" : "#FFFFFF",
                color: country === c ? "#F8F4EE" : "#8A7A6A",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {magOptions.map((m) => (
            <button
              key={m}
              onClick={() => setMinMag(m)}
              style={{
                padding: "5px 12px",
                borderRadius: 99,
                border: "1.5px solid",
                borderColor: minMag === m ? "#C8A96E" : "#DDD5C5",
                background: minMag === m ? "#C8A96E" : "#FFFFFF",
                color: minMag === m ? "#1C0C04" : "#8A7A6A",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {m === "Todos" ? "Todas las magnitudes" : `Mag. ${m}`}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div style={{ padding: "0 20px 8px", flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: "#8A7A6A" }}>
          {filtered.length} evento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((q) => {
            const { dot, bg, text, label } = magInfo(q.mag);
            return (
              <div
                key={q.id}
                onClick={() => onNavigate("detail", q)}
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #DDD5C5",
                  borderRadius: 16,
                  padding: "14px 16px",
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                {/* Mag indicator */}
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: bg,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    gap: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 22,
                      color: text,
                      lineHeight: 1,
                    }}
                  >
                    {q.mag.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: text, letterSpacing: "0.02em" }}>
                    {label.toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1C0C04",
                      margin: 0,
                      lineHeight: 1.35,
                      marginBottom: 4,
                    }}
                  >
                    {q.place}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                    <span style={{ fontSize: 12, color: "#8A7A6A" }}>Prof. {q.depth} km</span>
                    <span style={{ fontSize: 12, color: "#8A7A6A" }}>{q.time}</span>
                  </div>
                </div>

                {/* Right indicator */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                    <path d="M1 1l6 6-6 6" stroke="#DDD5C5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#8A7A6A" }}>
            <p style={{ fontSize: 14 }}>No se encontraron eventos con los filtros seleccionados.</p>
          </div>
        )}
      </div>

      <BottomNav active="recent" onNavigate={onNavigate} />
    </div>
  );
}
