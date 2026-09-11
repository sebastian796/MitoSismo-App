import { StatusBar, TopBar, BottomNav } from "../components/shared";

type Tip = { icon: string; title: string; desc: string };

const before: Tip[] = [
  { icon: "🔍", title: "Identifica los riesgos", desc: "Reconoce objetos que puedan caer o zonas inseguras en tu hogar." },
  { icon: "🎒", title: "Prepara una mochila", desc: "Incluye agua, comida, botiquín, linterna, radio y documentos." },
  { icon: "📍", title: "Define un punto de encuentro", desc: "Acuerda con tu familia un lugar seguro fuera de casa." },
  { icon: "🏠", title: "Refuerza tu hogar", desc: "Asegura muebles altos a las paredes y revisa la estructura." },
  { icon: "📞", title: "Aprende los números de emergencia", desc: "Ten a mano los contactos de defensa civil y bomberos locales." },
];

const during: Tip[] = [
  { icon: "🛡️", title: "Aléjate de ventanas", desc: "Los vidrios pueden quebrarse y causar heridas graves." },
  { icon: "🐢", title: "Agáchate, cúbrete y sujétate", desc: "Protege tu cabeza y cuello bajo una mesa o junto a una pared interior." },
  { icon: "🚫", title: "No corras hacia afuera", desc: "Los objetos en fachadas son peligrosos mientras dura el sismo." },
  { icon: "🔦", title: "Mantén la calma", desc: "Respira profundo y sigue el plan de emergencia familiar." },
];

const after: Tip[] = [
  { icon: "🚪", title: "Sal con precaución", desc: "Revisa que no haya peligro de derrumbe antes de salir." },
  { icon: "🔥", title: "Evita usar fuego", desc: "Puede haber fugas de gas. No enciendas velas ni fósforos." },
  { icon: "📻", title: "Escucha las autoridades", desc: "Sigue las instrucciones de defensa civil y medios oficiales." },
  { icon: "⚠️", title: "Prepárate para réplicas", desc: "Es normal que ocurran temblores menores después del sismo principal." },
];

function Section({
  title,
  color,
  dotColor,
  tips,
}: {
  title: string;
  color: string;
  dotColor: string;
  tips: Tip[];
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor }} />
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#1C0C04",
            margin: 0,
            letterSpacing: "0.03em",
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tips.map((tip, i) => (
          <div
            key={i}
            style={{
              background: "#FFFFFF",
              border: `1.5px solid ${color}30`,
              borderLeft: `4px solid ${color}`,
              borderRadius: "0 12px 12px 0",
              padding: "12px 14px",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.4 }}>{tip.icon}</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1C0C04", margin: 0 }}>{tip.title}</p>
              <p style={{ fontSize: 13, color: "#8A7A6A", margin: "3px 0 0", lineHeight: 1.4 }}>{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PreventionScreen({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (screen: string, data?: unknown) => void;
}) {
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
      <TopBar title="Prevención sísmica" onBack={onBack} />

      {/* Tab summary */}
      <div
        style={{
          margin: "0 20px 16px",
          background: "#FFFFFF",
          border: "1.5px solid #DDD5C5",
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-around",
          flexShrink: 0,
        }}
      >
        {[
          { label: "Antes", count: before.length, color: "#4A9058" },
          { label: "Durante", count: during.length, color: "#E8942A" },
          { label: "Después", count: after.length, color: "#2E7DA8" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: s.color, margin: 0 }}>{s.count}</p>
            <p style={{ fontSize: 12, color: "#8A7A6A", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 16px" }}>
        <Section title="ANTES del sismo" color="#4A9058" dotColor="#4A9058" tips={before} />
        <Section title="DURANTE el sismo" color="#E8942A" dotColor="#E8942A" tips={during} />
        <Section title="DESPUÉS del sismo" color="#2E7DA8" dotColor="#2E7DA8" tips={after} />

        {/* Emergency numbers */}
        <div
          style={{
            background: "#2C1810",
            borderRadius: 16,
            padding: "16px 20px",
            marginBottom: 8,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: "#F8F4EE", margin: "0 0 12px" }}>
            📞 Números de emergencia
          </p>
          {[
            { country: "Perú", number: "115" },
            { country: "Chile", number: "132" },
            { country: "México", number: "800 003 6800" },
            { country: "Colombia", number: "123" },
          ].map((e) => (
            <div
              key={e.country}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ fontSize: 13, color: "rgba(248,244,238,0.7)" }}>Defensa Civil — {e.country}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#C8A96E" }}>{e.number}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
