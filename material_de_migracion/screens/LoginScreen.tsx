import { StatusBar, Logo } from "../components/shared";

export default function LoginScreen() {
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

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 32px 48px",
          gap: 0,
        }}
      >
        {/* Logo */}
        <Logo size={64} />
        <div style={{ marginTop: 16, textAlign: "center", marginBottom: 40 }}>
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 28,
              color: "#1C0C04",
              margin: 0,
            }}
          >
            MitoSismo
          </h1>
          <p style={{ fontSize: 13, color: "#8A7A6A", margin: "4px 0 0" }}>
            Bienvenido de nuevo
          </p>
        </div>

        {/* Form */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#2C1810" }}>
              Correo electrónico
            </label>
            <div
              style={{
                height: 52,
                background: "#FFFFFF",
                border: "1.5px solid #DDD5C5",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                gap: 10,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="3" width="16" height="12" rx="2.5" stroke="#8A7A6A" strokeWidth="1.4" />
                <path d="M1 6l8 5 8-5" stroke="#8A7A6A" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 15, color: "#C0B4A8" }}>correo@ejemplo.com</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#2C1810" }}>Contraseña</label>
            <div
              style={{
                height: 52,
                background: "#FFFFFF",
                border: "1.5px solid #DDD5C5",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                gap: 10,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="7" width="12" height="10" rx="2.5" stroke="#8A7A6A" strokeWidth="1.4" />
                <path
                  d="M6 7V5.5a3 3 0 016 0V7"
                  stroke="#8A7A6A"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="12" r="1.5" fill="#8A7A6A" />
              </svg>
              <span style={{ fontSize: 15, color: "#C0B4A8" }}>••••••••</span>
            </div>
          </div>

          <div style={{ textAlign: "right", marginTop: -4 }}>
            <span style={{ fontSize: 13, color: "#C8A96E", fontWeight: 500 }}>
              ¿Olvidaste tu contraseña?
            </span>
          </div>
        </div>

        {/* Login button */}
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
            marginTop: 28,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "0.01em",
          }}
        >
          Iniciar sesión
        </button>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "24px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "#DDD5C5" }} />
          <span style={{ fontSize: 13, color: "#8A7A6A" }}>o</span>
          <div style={{ flex: 1, height: 1, background: "#DDD5C5" }} />
        </div>

        {/* Create account */}
        <button
          style={{
            width: "100%",
            height: 54,
            background: "transparent",
            color: "#2C1810",
            border: "1.5px solid #DDD5C5",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Crear cuenta
        </button>

        <p style={{ marginTop: "auto", paddingTop: 32, fontSize: 12, color: "#8A7A6A", textAlign: "center" }}>
          Al continuar, aceptas los{" "}
          <span style={{ color: "#C8A96E" }}>términos de uso</span> y la{" "}
          <span style={{ color: "#C8A96E" }}>política de privacidad</span>.
        </p>
      </div>
    </div>
  );
}
