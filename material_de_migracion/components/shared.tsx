import type { ReactNode } from "react";

export function magInfo(mag: number): { bg: string; text: string; label: string; dot: string } {
  if (mag < 3.0) return { bg: "#EBEBEB", text: "#555555", label: "Leve", dot: "#888888" };
  if (mag < 4.0) return { bg: "#D4EDDA", text: "#2D6A3F", label: "Menor", dot: "#4A9058" };
  if (mag < 5.0) return { bg: "#FFF3CD", text: "#856404", label: "Ligero", dot: "#E8942A" };
  if (mag < 6.0) return { bg: "#FFE4D8", text: "#C43010", label: "Moderado", dot: "#D4421A" };
  if (mag < 7.0) return { bg: "#FFD0C0", text: "#9A1A08", label: "Fuerte", dot: "#A01208" };
  return { bg: "#FFCCCC", text: "#7A0000", label: "Mayor", dot: "#7A0000" };
}

export function MagBadge({ mag }: { mag: number }) {
  const { bg, text, label } = magInfo(mag);
  return (
    <span
      style={{
        background: bg,
        color: text,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 99,
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </span>
  );
}

export function StatusBar({ dark = false }: { dark?: boolean }) {
  const c = dark ? "rgba(255,255,255,0.9)" : "#1C0C04";
  return (
    <div
      style={{
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 700, color: c }}>9:41</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg width="17" height="12" viewBox="0 0 17 12" fill={c}>
          <rect x="0" y="7" width="3" height="5" rx="0.8" />
          <rect x="4.5" y="5" width="3" height="7" rx="0.8" />
          <rect x="9" y="2.5" width="3" height="9.5" rx="0.8" />
          <rect x="13.5" y="0" width="3" height="12" rx="0.8" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill={c}>
          <path d="M8 2C4.5 2 1.5 4 0 7c1.5-1.5 4-2.5 8-2.5S14.5 5.5 16 7C14.5 4 11.5 2 8 2z" />
          <path d="M8 5C5.5 5 3.5 6 2.5 7.5 4 6.5 6 6 8 6s4 .5 5.5 1.5C12.5 6 10.5 5 8 5z" />
          <circle cx="8" cy="10" r="2" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke={c} strokeWidth="1.2" />
          <rect x="22" y="3.5" width="2.5" height="5" rx="1" fill={c} />
          <rect x="2" y="2" width="15" height="8" rx="1.5" fill={c} />
        </svg>
      </div>
    </div>
  );
}

export function TopBar({
  title,
  onBack,
  dark = false,
  rightEl,
}: {
  title: string;
  onBack?: () => void;
  dark?: boolean;
  rightEl?: ReactNode;
}) {
  const c = dark ? "white" : "#1C0C04";
  return (
    <div
      style={{
        height: 52,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        flexShrink: 0,
        gap: 8,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "none",
            background: dark ? "rgba(255,255,255,0.15)" : "#EDE8DC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7l6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <span
        style={{
          flex: 1,
          fontSize: 17,
          fontWeight: 600,
          color: c,
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {title}
      </span>
      {rightEl}
    </div>
  );
}

export function BottomNav({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (s: string) => void;
}) {
  const items = [
    {
      id: "home",
      label: "Inicio",
      icon: (a: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H14v-5H8v5H4a1 1 0 01-1-1V9.5z"
            fill={a ? "#2C1810" : "none"}
            stroke={a ? "#2C1810" : "#8A7A6A"}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "map",
      label: "Mapa",
      icon: (a: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 2C8.24 2 6 4.24 6 7c0 4.25 5 11 5 11s5-6.75 5-11c0-2.76-2.24-5-5-5z"
            fill={a ? "#2C1810" : "none"}
            stroke={a ? "#2C1810" : "#8A7A6A"}
            strokeWidth="1.6"
          />
          <circle cx="11" cy="7" r="2" fill={a ? "white" : "#8A7A6A"} />
        </svg>
      ),
    },
    {
      id: "recent",
      label: "Sismos",
      icon: (a: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M2 11h3l2-7 4 14 3-10 2 3h4"
            stroke={a ? "#2C1810" : "#8A7A6A"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "missions",
      label: "Misiones",
      icon: (a: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <polygon
            points="11,2 13.5,8.5 20,9 15,13.5 16.8,20 11,16.5 5.2,20 7,13.5 2,9 8.5,8.5"
            fill={a ? "#2C1810" : "none"}
            stroke={a ? "#2C1810" : "#8A7A6A"}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Perfil",
      icon: (a: boolean) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle
            cx="11"
            cy="7"
            r="4"
            fill={a ? "#2C1810" : "none"}
            stroke={a ? "#2C1810" : "#8A7A6A"}
            strokeWidth="1.6"
          />
          <path
            d="M3 19c0-4 3.5-7 8-7s8 3 8 7"
            stroke={a ? "#2C1810" : "#8A7A6A"}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        height: 72,
        borderTop: "1px solid #DDD5C5",
        background: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 4px 8px",
        flexShrink: 0,
      }}
    >
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: "8px 0",
            }}
          >
            {item.icon(isActive)}
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "#2C1810" : "#8A7A6A",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Logo({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="38" fill="#2C1810" />
      <circle cx="40" cy="40" r="35" fill="none" stroke="#C8A96E" strokeWidth="1.2" />
      <path
        d="M10,40 L20,40 L25,28 L31,52 L36,34 L41,46 L46,40 L52,24 L57,56 L62,40 L70,40"
        fill="none"
        stroke="#C8A96E"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        border: "1px solid #DDD5C5",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
