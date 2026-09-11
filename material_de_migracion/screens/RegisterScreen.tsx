import { StatusBar, TopBar } from "../components/shared";

const Field = ({
  label,
  placeholder,
  icon,
}: {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: "#2C1810" }}>{label}</label>
    <div
      style={{
        height: 50,
        background: "#FFFFFF",
        border: "1.5px solid #DDD5C5",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        gap: 10,
      }}
    >
      {icon}
      <span style={{ fontSize: 14, color: "#C0B4A8" }}>{placeholder}</span>
    </div>
  </div>
);

export default function RegisterScreen() {
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
      <TopBar title="Crear cuenta" />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 28px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <p style={{ fontSize: 14, color: "#8A7A6A", marginBottom: 4 }}>
          Completa tus datos para comenzar
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <Field
            label="Nombre"
            placeholder="Juan"
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3.5" stroke="#8A7A6A" strokeWidth="1.4" />
                <path d="M1 14c0-3.5 3-6 7-6s7 2.5 7 6" stroke="#8A7A6A" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            }
          />
          <Field
            label="Apellido"
            placeholder="Pérez"
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3.5" stroke="#8A7A6A" strokeWidth="1.4" />
                <path d="M1 14c0-3.5 3-6 7-6s7 2.5 7 6" stroke="#8A7A6A" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            }
          />
        </div>

        <Field
          label="Correo electrónico"
          placeholder="correo@ejemplo.com"
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2.5" width="14" height="11" rx="2.5" stroke="#8A7A6A" strokeWidth="1.4" />
              <path d="M1 5.5l7 4.5 7-4.5" stroke="#8A7A6A" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          }
        />

        <Field
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="6.5" width="12" height="9" rx="2.5" stroke="#8A7A6A" strokeWidth="1.4" />
              <path d="M5 6.5V4.5a3 3 0 016 0v2" stroke="#8A7A6A" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="8" cy="11" r="1.5" fill="#8A7A6A" />
            </svg>
          }
        />

        {/* Country */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#2C1810" }}>País</label>
          <div
            style={{
              height: 50,
              background: "#FFFFFF",
              border: "1.5px solid #DDD5C5",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              gap: 10,
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#8A7A6A" strokeWidth="1.4" />
                <path d="M1.5 8h13M8 1.5C6 4 5 6 5 8s1 4 3 6.5M8 1.5C10 4 11 6 11 8s-1 4-3 6.5" stroke="#8A7A6A" strokeWidth="1.2" />
              </svg>
              <span style={{ fontSize: 14, color: "#1C0C04" }}>Perú</span>
            </div>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1.5l5 5 5-5" stroke="#8A7A6A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Register button */}
        <button
          style={{
            width: "100%",
            height: 54,
            background: "#2C1810",
            color: "#F8F4EE",
            border: "none",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            marginTop: 8,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Registrarme
        </button>

        <p style={{ fontSize: 12, color: "#8A7A6A", textAlign: "center", lineHeight: 1.5 }}>
          Al registrarte, aceptas los{" "}
          <span style={{ color: "#C8A96E" }}>términos de uso</span> y la{" "}
          <span style={{ color: "#C8A96E" }}>política de privacidad</span>.
        </p>
      </div>
    </div>
  );
}
