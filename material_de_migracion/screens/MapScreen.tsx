import { useState } from "react";
import { StatusBar, TopBar, BottomNav, magInfo } from "../components/shared";
import type { Quake } from "../data";

function LatAmMap({
  quakes,
  selectedId,
  onSelect,
}: {
  quakes: Quake[];
  selectedId: number | null;
  onSelect: (q: Quake | null) => void;
}) {
  // Convert lat/lon to SVG coordinates
  // Longitude range [-118, -34] → x [0, 420], scale = 5
  // Latitude range [33, -57] → y [0, 450], scale = 5
  const toXY = (lon: number, lat: number) => ({
    x: (lon + 118) * 5,
    y: (33 - lat) * 5,
  });

  const quakeDots = quakes.map((q) => ({ ...q, ...toXY(q.lng, q.lat) }));

  return (
    <svg width="420" height="450" viewBox="0 0 420 450" style={{ display: "block" }}>
      {/* Ocean */}
      <rect width="420" height="450" fill="#C8DFE8" />

      {/* Grid lines */}
      {[0, 90, 180, 270, 360].map((x) => (
        <line key={x} x1={x} y1={0} x2={x} y2={450} stroke="white" strokeWidth="0.4" opacity="0.4" />
      ))}
      {[0, 90, 180, 270, 360, 450].map((y) => (
        <line key={y} x1={0} y1={y} x2={420} y2={y} stroke="white" strokeWidth="0.4" opacity="0.4" />
      ))}

      {/* Mexico */}
      <path
        d="M 5,5 L 98,5 L 105,52 L 140,58 L 152,88 L 138,92 L 118,86 L 100,76 L 88,90 L 72,88 L 55,74 L 36,62 Z"
        fill="#C8B88A"
        stroke="#A09868"
        strokeWidth="0.8"
      />

      {/* Central America (thin strip) */}
      <path
        d="M 152,88 L 168,88 L 178,105 L 182,118 L 172,122 L 160,114 L 148,105 Z"
        fill="#C8B88A"
        stroke="#A09868"
        strokeWidth="0.8"
      />

      {/* Caribbean (Cuba + Hispaniola) */}
      <ellipse cx="168" cy="50" rx="26" ry="7" fill="#C8B88A" stroke="#A09868" strokeWidth="0.6" />
      <ellipse cx="215" cy="57" rx="12" ry="5" fill="#C8B88A" stroke="#A09868" strokeWidth="0.6" />
      <ellipse cx="235" cy="60" rx="6" ry="4" fill="#C8B88A" stroke="#A09868" strokeWidth="0.6" />

      {/* South America */}
      <path
        d="
          M 183,158
          C 192,140 202,118 208,110
          L 255,106
          L 278,112
          L 280,124
          C 315,148 368,175 414,192
          L 415,228
          L 400,242
          L 348,297
          L 322,332
          L 305,356
          L 265,396
          L 248,438
          L 252,444
          L 226,432
          L 218,396
          L 233,316
          L 240,256
          L 204,192
          L 188,176
          Z
        "
        fill="#C8B88A"
        stroke="#A09868"
        strokeWidth="0.8"
      />

      {/* Earthquake dots */}
      {quakeDots.map((q) => {
        const { dot } = magInfo(q.mag);
        const isSelected = q.id === selectedId;
        const r = q.mag >= 6 ? 10 : q.mag >= 5 ? 8 : q.mag >= 4 ? 6.5 : 5;
        return (
          <g key={q.id} onClick={() => onSelect(isSelected ? null : q)} style={{ cursor: "pointer" }}>
            <circle cx={q.x} cy={q.y} r={r + 6} fill={dot} opacity="0.15" />
            <circle
              cx={q.x}
              cy={q.y}
              r={r}
              fill={dot}
              stroke={isSelected ? "white" : "rgba(255,255,255,0.6)"}
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
            {isSelected && (
              <circle cx={q.x} cy={q.y} r={r + 10} fill="none" stroke={dot} strokeWidth="1.5" opacity="0.5" />
            )}
            <text
              x={q.x}
              y={q.y + 0.6}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={q.mag >= 5 ? 7 : 6}
              fontWeight="700"
              fill="white"
              fontFamily="'Outfit', sans-serif"
            >
              {q.mag.toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* Country labels */}
      <text x="68" y="52" fontSize="9" fill="#8A7060" fontFamily="'Outfit',sans-serif" opacity="0.9">MÉXICO</text>
      <text x="195" y="185" fontSize="9" fill="#8A7060" fontFamily="'Outfit',sans-serif" opacity="0.9">PERÚ</text>
      <text x="305" y="228" fontSize="9" fill="#8A7060" fontFamily="'Outfit',sans-serif" opacity="0.9">BRASIL</text>
      <text x="218" y="350" fontSize="9" fill="#8A7060" fontFamily="'Outfit',sans-serif" opacity="0.9">CHILE</text>
      <text x="290" y="355" fontSize="9" fill="#8A7060" fontFamily="'Outfit',sans-serif" opacity="0.9">ARG.</text>
      <text x="218" y="148" fontSize="9" fill="#8A7060" fontFamily="'Outfit',sans-serif" opacity="0.9">COL.</text>
    </svg>
  );
}

export default function MapScreen({
  quakes,
  onNavigate,
}: {
  quakes: Quake[];
  onNavigate: (screen: string, data?: unknown) => void;
}) {
  const [selectedQuake, setSelectedQuake] = useState<Quake | null>(null);
  const [magFilter, setMagFilter] = useState<string>("Todos");

  const magFilters = ["Todos", "≥ 3", "≥ 4", "≥ 5"];
  const filteredQuakes =
    magFilter === "Todos"
      ? quakes
      : quakes.filter((q) => q.mag >= parseFloat(magFilter.replace("≥ ", "")));

  const { dot } = selectedQuake ? magInfo(selectedQuake.mag) : { dot: "#888" };

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
      <TopBar title="Mapa de sismos" />

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "0 20px 12px",
          flexShrink: 0,
          overflowX: "auto",
        }}
      >
        {magFilters.map((f) => (
          <button
            key={f}
            onClick={() => setMagFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 99,
              border: "1.5px solid",
              borderColor: magFilter === f ? "#2C1810" : "#DDD5C5",
              background: magFilter === f ? "#2C1810" : "#FFFFFF",
              color: magFilter === f ? "#F8F4EE" : "#8A7A6A",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {f === "Todos" ? "Todos" : `Mag. ${f}`}
          </button>
        ))}
      </div>

      {/* Map */}
      <div
        style={{
          flex: 1,
          background: "#C8DFE8",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ transform: "scale(0.935)", transformOrigin: "center center" }}>
              <LatAmMap
                quakes={filteredQuakes}
                selectedId={selectedQuake?.id ?? null}
                onSelect={setSelectedQuake}
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "white",
            borderRadius: 10,
            padding: "8px 10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          {[
            { label: "< 4.0", color: "#4A9058" },
            { label: "4.0–4.9", color: "#E8942A" },
            { label: "5.0–5.9", color: "#D4421A" },
            { label: "≥ 6.0", color: "#9A1208" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <div
                style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0 }}
              />
              <span style={{ fontSize: 10, color: "#1C0C04", fontFamily: "'Outfit', sans-serif" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected quake card */}
      {selectedQuake && (
        <div
          style={{
            background: "#FFFFFF",
            borderTop: "1px solid #DDD5C5",
            padding: "16px 20px 12px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: dot + "18",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: dot }}
              >
                {selectedQuake.mag.toFixed(1)}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1C0C04", margin: 0, lineHeight: 1.3 }}>
                {selectedQuake.place}
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: "#8A7A6A" }}>Prof. {selectedQuake.depth} km</span>
                <span style={{ fontSize: 12, color: "#8A7A6A" }}>{selectedQuake.time}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedQuake(null)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: "1px solid #DDD5C5",
                background: "#F8F4EE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="#8A7A6A" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => onNavigate("detail", selectedQuake)}
            style={{
              width: "100%",
              height: 44,
              background: "#2C1810",
              color: "#F8F4EE",
              border: "none",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Ver detalle
          </button>
        </div>
      )}

      <BottomNav active="map" onNavigate={onNavigate} />
    </div>
  );
}
