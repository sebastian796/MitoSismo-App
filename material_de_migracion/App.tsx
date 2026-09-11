import { useState, type ReactNode } from "react";
import { Logo } from "./components/shared";
import { quakes, missions } from "./data";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import RecentScreen from "./screens/RecentScreen";
import QuakeDetailScreen from "./screens/QuakeDetailScreen";
import MissionsScreen from "./screens/MissionsScreen";
import CreatureScreen from "./screens/CreatureScreen";
import PreventionScreen from "./screens/PreventionScreen";
import ProfileScreen from "./screens/ProfileScreen";

// Phone frame with Android-style bezel
function PhoneFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* Phone shell */}
      <div
        style={{
          width: 264,
          height: 574,
          background: "#111111",
          borderRadius: 38,
          padding: "5px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.08)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Camera punch hole */}
        <div
          style={{
            position: "absolute",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            width: 10,
            height: 10,
            background: "#0A0A0A",
            borderRadius: "50%",
            zIndex: 10,
          }}
        />
        {/* Side buttons */}
        <div
          style={{
            position: "absolute",
            left: -3,
            top: 90,
            width: 3,
            height: 28,
            background: "#222",
            borderRadius: "2px 0 0 2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -3,
            top: 128,
            width: 3,
            height: 44,
            background: "#222",
            borderRadius: "2px 0 0 2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -3,
            top: 108,
            width: 3,
            height: 56,
            background: "#222",
            borderRadius: "0 2px 2px 0",
          }}
        />
        {/* Screen area */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 34,
            overflow: "hidden",
            background: "#F8F4EE",
            position: "relative",
          }}
        >
          {/* Scale content from 393×852 to fit inside 254×564 */}
          <div
            style={{
              width: 393,
              height: 852,
              transform: "scale(0.6463)",
              transformOrigin: "0 0",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {children}
          </div>
        </div>
      </div>
      {/* Label */}
      <p
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#8A7A6A",
          textAlign: "center",
          margin: 0,
          letterSpacing: "0.03em",
          maxWidth: 200,
          lineHeight: 1.3,
        }}
      >
        {label}
      </p>
    </div>
  );
}

// Interactive prototype
function InteractivePrototype() {
  const [screen, setScreen] = useState("splash");
  const [prevScreen, setPrevScreen] = useState<string | null>(null);
  const [selectedQuake, setSelectedQuake] = useState(quakes[0]);

  const navigate = (target: string, data?: unknown) => {
    setPrevScreen(screen);
    if (target === "detail" && data) {
      setSelectedQuake(data as typeof quakes[0]);
    }
    setScreen(target);
  };

  const goBack = () => {
    setScreen(prevScreen || "home");
    setPrevScreen(null);
  };

  const renderScreen = () => {
    switch (screen) {
      case "splash": return <SplashScreen />;
      case "login": return <LoginScreen />;
      case "register": return <RegisterScreen />;
      case "home": return <HomeScreen quakes={quakes} onNavigate={navigate} />;
      case "map": return <MapScreen quakes={quakes} onNavigate={navigate} />;
      case "recent": return <RecentScreen quakes={quakes} onNavigate={navigate} />;
      case "detail": return <QuakeDetailScreen quake={selectedQuake} onBack={goBack} onNavigate={navigate} />;
      case "missions": return <MissionsScreen missions={missions} onNavigate={navigate} />;
      case "creature": return <CreatureScreen onBack={goBack} />;
      case "prevention": return <PreventionScreen onBack={goBack} onNavigate={navigate} />;
      case "profile": return <ProfileScreen onNavigate={navigate} />;
      default: return <HomeScreen quakes={quakes} onNavigate={navigate} />;
    }
  };

  const screenLabels: Record<string, string> = {
    splash: "Splash", login: "Inicio de sesión", register: "Registro",
    home: "Inicio", map: "Mapa", recent: "Sismos recientes",
    detail: "Detalle del sismo", missions: "Misiones",
    creature: "Criatura", prevention: "Prevención", profile: "Perfil",
  };

  const navScreens = [
    { id: "splash", label: "Splash" },
    { id: "login", label: "Login" },
    { id: "home", label: "Inicio" },
    { id: "map", label: "Mapa" },
    { id: "recent", label: "Sismos" },
    { id: "missions", label: "Misiones" },
    { id: "profile", label: "Perfil" },
    { id: "detail", label: "Detalle" },
    { id: "creature", label: "Criatura" },
    { id: "prevention", label: "Prevención" },
    { id: "register", label: "Registro" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        padding: "32px 20px",
        background: "rgba(255,255,255,0.4)",
        borderRadius: 24,
        border: "1.5px solid #DDD5C5",
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 700, color: "#8A7A6A", letterSpacing: "0.08em", margin: 0 }}>
        PROTOTIPO INTERACTIVO
      </p>
      <p style={{ fontSize: 13, color: "#C8A96E", fontWeight: 600, margin: 0 }}>
        {screenLabels[screen] || screen}
      </p>

      {/* Phone */}
      <div
        style={{
          width: 284,
          height: 614,
          background: "#111111",
          borderRadius: 42,
          padding: "5px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.08)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            width: 11,
            height: 11,
            background: "#0A0A0A",
            borderRadius: "50%",
            zIndex: 10,
          }}
        />
        <div style={{ position: "absolute", left: -3, top: 95, width: 3, height: 30, background: "#222", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 135, width: 3, height: 48, background: "#222", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", right: -3, top: 115, width: 3, height: 60, background: "#222", borderRadius: "0 2px 2px 0" }} />
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 38,
            overflow: "hidden",
            background: "#F8F4EE",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 393,
              height: 852,
              transform: "scale(0.6947)",
              transformOrigin: "0 0",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {renderScreen()}
          </div>
        </div>
      </div>

      {/* Screen nav */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 340 }}>
        {navScreens.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              if (s.id === "detail") setSelectedQuake(quakes[0]);
              setScreen(s.id);
            }}
            style={{
              padding: "5px 12px",
              borderRadius: 99,
              border: "1.5px solid",
              borderColor: screen === s.id ? "#2C1810" : "#DDD5C5",
              background: screen === s.id ? "#2C1810" : "#FFFFFF",
              color: screen === s.id ? "#F8F4EE" : "#8A7A6A",
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  // All 11 screens rendered statically for the gallery
  const screens = [
    { label: "01 · Splash / Bienvenida", el: <SplashScreen /> },
    { label: "02 · Inicio de sesión", el: <LoginScreen /> },
    { label: "03 · Registro", el: <RegisterScreen /> },
    { label: "04 · Inicio", el: <HomeScreen quakes={quakes} onNavigate={() => {}} /> },
    { label: "05 · Mapa de sismos", el: <MapScreen quakes={quakes} onNavigate={() => {}} /> },
    { label: "06 · Sismos recientes", el: <RecentScreen quakes={quakes} onNavigate={() => {}} /> },
    { label: "07 · Detalle del sismo", el: <QuakeDetailScreen quake={quakes[0]} onBack={() => {}} onNavigate={() => {}} /> },
    { label: "08 · Misiones", el: <MissionsScreen missions={missions} onNavigate={() => {}} /> },
    { label: "09 · Criatura — Ignis", el: <CreatureScreen onBack={() => {}} /> },
    { label: "10 · Prevención sísmica", el: <PreventionScreen onBack={() => {}} onNavigate={() => {}} /> },
    { label: "11 · Perfil de usuario", el: <ProfileScreen onNavigate={() => {}} /> },
  ];

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#EDE8DC",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#2C1810",
          padding: "32px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Logo size={56} />
          <div>
            <h1
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 36,
                color: "#F8F4EE",
                margin: 0,
                lineHeight: 1,
              }}
            >
              MitoSismo
            </h1>
            <p style={{ fontSize: 14, color: "#C8A96E", margin: "6px 0 0" }}>
              Infórmate, prepárate y aprende
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 12, color: "rgba(248,244,238,0.5)", margin: 0, letterSpacing: "0.06em" }}>
            PROYECTO UNIVERSITARIO
          </p>
          <p style={{ fontSize: 13, color: "rgba(248,244,238,0.7)", margin: "4px 0 0" }}>
            Diseño de interfaces · React Native
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
            {["Educativa", "Sísmica", "Latinoamérica"].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  padding: "2px 10px",
                  borderRadius: 99,
                  border: "1px solid rgba(200,169,110,0.4)",
                  color: "#C8A96E",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(200,169,110,0.15)" }} />

      {/* Gallery section */}
      <div style={{ padding: "48px 40px 24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1C0C04", margin: 0 }}>
            Conjunto de pantallas
          </h2>
          <span style={{ fontSize: 14, color: "#8A7A6A" }}>11 interfaces · Android</span>
        </div>

        {/* Phone grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(264px, 1fr))",
            gap: "40px 28px",
            justifyItems: "center",
            marginBottom: 64,
          }}
        >
          {screens.map((s) => (
            <PhoneFrame key={s.label} label={s.label}>
              {s.el}
            </PhoneFrame>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "#DDD5C5",
            marginBottom: 48,
          }}
        />

        {/* Interactive prototype */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1C0C04", margin: 0 }}>
              Prototipo navegable
            </h2>
            <span style={{ fontSize: 14, color: "#8A7A6A" }}>Navega entre pantallas</span>
          </div>
          <InteractivePrototype />
        </div>

        {/* Color palette */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1C0C04", margin: "0 0 20px" }}>
            Identidad visual
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {[
              { name: "Marrón oscuro", hex: "#2C1810", text: "#F8F4EE", role: "Principal" },
              { name: "Beige cálido", hex: "#F8F4EE", text: "#1C0C04", role: "Fondo" },
              { name: "Dorado suave", hex: "#C8A96E", text: "#1C0C04", role: "Acento" },
              { name: "Beige borde", hex: "#DDD5C5", text: "#1C0C04", role: "Borde" },
              { name: "Texto secundario", hex: "#8A7A6A", text: "#F8F4EE", role: "Muted" },
              { name: "Rojo sísmico", hex: "#D4421A", text: "#FFFFFF", role: "Peligro" },
              { name: "Naranja sísmico", hex: "#E8942A", text: "#FFFFFF", role: "Alerta" },
              { name: "Verde seguro", hex: "#4A9058", text: "#FFFFFF", role: "OK" },
            ].map((c) => (
              <div
                key={c.hex}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#FFFFFF",
                  border: "1.5px solid #DDD5C5",
                  borderRadius: 12,
                  padding: "8px 14px 8px 8px",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: c.hex,
                    border: c.hex === "#F8F4EE" ? "1px solid #DDD5C5" : "none",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1C0C04", margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: "#8A7A6A", margin: 0 }}>
                    {c.hex} · {c.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1C0C04", margin: "0 0 20px" }}>
            Tipografía
          </h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #DDD5C5",
                borderRadius: 16,
                padding: "20px 24px",
                flex: 1,
                minWidth: 240,
              }}
            >
              <p style={{ fontSize: 12, color: "#8A7A6A", margin: "0 0 8px", letterSpacing: "0.04em" }}>
                DISPLAY · DM SERIF DISPLAY
              </p>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: "#1C0C04", margin: "0 0 4px", lineHeight: 1 }}>
                M 5.2
              </p>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#8A7A6A", margin: 0 }}>
                MitoSismo
              </p>
            </div>
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #DDD5C5",
                borderRadius: 16,
                padding: "20px 24px",
                flex: 1,
                minWidth: 240,
              }}
            >
              <p style={{ fontSize: 12, color: "#8A7A6A", margin: "0 0 8px", letterSpacing: "0.04em" }}>
                CUERPO · OUTFIT
              </p>
              <p style={{ fontSize: 17, fontWeight: 600, color: "#1C0C04", margin: "0 0 4px" }}>
                120 km al oeste de Lima
              </p>
              <p style={{ fontSize: 14, color: "#8A7A6A", margin: 0 }}>
                Profundidad: 38 km · Hoy, 03:42 a.m.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: "#2C1810",
          padding: "20px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo size={32} />
          <span style={{ fontSize: 14, color: "rgba(248,244,238,0.6)" }}>MitoSismo · 2026</span>
        </div>
        <span style={{ fontSize: 13, color: "#C8A96E" }}>
          Diseño de interfaces para proyecto universitario
        </span>
      </div>
    </div>
  );
}
