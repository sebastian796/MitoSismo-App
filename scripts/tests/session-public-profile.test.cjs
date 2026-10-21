const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(__dirname, "../..");

// Ejecuta componentes reales con contexto y navegación aislados. Ningún mock
// se instala en la app ni se almacena una sesión de prueba en el dispositivo.
function loader(
  overrides = {},
  transport = async () => {
    throw Error("Sin transporte de prueba");
  },
) {
  const cache = new Map();
  function load(file) {
    const absolute = path.resolve(root, file);
    if (cache.has(absolute)) return cache.get(absolute);
    const exports = {};
    cache.set(absolute, exports);
    const source = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(source, {
      exports,
      fetch: transport,
      AbortController,
      URLSearchParams,
      setTimeout,
      clearTimeout,
      require: (id) => {
        if (Object.hasOwn(overrides, id)) return overrides[id];
        if (!id.startsWith(".")) return require(id);
        const target = path.resolve(path.dirname(absolute), id);
        for (const candidate of [
          target + ".ts",
          target + ".tsx",
          path.join(target, "index.ts"),
        ]) {
          if (fs.existsSync(candidate)) return load(candidate);
        }
        throw Error("Import no encontrado: " + id);
      },
    });
    return exports;
  }
  return load;
}
const shell =
  (tag) =>
  ({ children }) =>
    React.createElement(tag, null, children);
const native = {
  View: shell("div"),
  Text: shell("span"),
  ScrollView: shell("div"),
  Pressable: shell("button"),
  ActivityIndicator: () => null,
  StyleSheet: { create: (value) => value },
  Platform: { OS: "web" },
};
const user = {
  id: 7,
  nombreUsuario: "Prueba aislada",
  email: "test@example.test",
  dataMascota: {
    nivel: 2,
    xpActual: 45,
    criatura: { nombre: "Criatura de la cuenta" },
  },
};
function harness(state) {
  const calls = { prompts: 0, redirects: [], effects: [] };
  const auth = {
    ...state,
    requireAuth: () => {
      calls.prompts++;
      return !!state.user;
    },
  };
  const router = {
    replace: (route) => calls.redirects.push(route),
    push: () => {},
    back: () => {},
  };
  const ui = {
    Card: shell("section"),
    TopBar: () => null,
    Button: ({ title }) => React.createElement("button", null, title),
  };
  const load = loader({
    "react-native": native,
    "react-native-safe-area-context": { SafeAreaView: shell("main") },
    "@expo/vector-icons": { Ionicons: () => null },
    "expo-router": {
      useRouter: () => router,
      useFocusEffect: (effect) => calls.effects.push(effect),
    },
    "../../context/AuthContext": { useAuth: () => auth },
    "../../components": ui,
    "./ui/Card": { Card: ui.Card },
    "../../components/creatures/CreatureCards": {
      ProfileCreatureCard: () =>
        React.createElement("section", null, "Tarjeta de criatura conservada"),
    },
  });
  return { load, calls };
}
test("URL o navegación directa: un invitado no monta ninguna misión y vuelve a Inicio con aviso", () => {
  const { load, calls } = harness({ loading: false, user: null });
  const Screen = load("src/app/(tabs)/missions.tsx").default;
  assert.equal(renderToStaticMarkup(React.createElement(Screen)), "");
  calls.effects.forEach((effect) => effect());
  assert.equal(calls.prompts, 1);
  assert.equal(calls.redirects[0], "/(tabs)");
});
test("restauración de sesión: no se monta contenido privado ni se redirige prematuramente", () => {
  const { load, calls } = harness({ loading: true, user });
  const Screen = load("src/app/(tabs)/missions.tsx").default;
  assert.equal(renderToStaticMarkup(React.createElement(Screen)), "");
  calls.effects.forEach((effect) => effect());
  assert.equal(calls.prompts, 0);
  assert.equal(calls.redirects.length, 0);
});
test("la misma ruta conserva las misiones y XP de la cuenta autenticada", () => {
  const { load, calls } = harness({ loading: false, user });
  const html = renderToStaticMarkup(
    React.createElement(load("src/app/(tabs)/missions.tsx").default),
  );
  assert.match(html, /Misiones Disponibles/);
  assert.match(html, /45 XP/);
  assert.match(html, /Criatura de la cuenta/);
  calls.effects.forEach((effect) => effect());
  assert.equal(calls.prompts, 0);
  assert.equal(calls.redirects.length, 0);
});
test("pestaña Misiones: cancela la navegación sólo para invitados", () => {
  for (const currentUser of [null, user]) {
    const routes = [];
    const Tabs = ({ children }) =>
      React.createElement(React.Fragment, null, children);
    Tabs.Screen = (props) => {
      routes.push(props);
      return null;
    };
    let prompts = 0;
    const load = loader({
      "expo-router": { Tabs },
      "react-native": native,
      "@expo/vector-icons": { Ionicons: () => null },
      "../../context/AuthContext": {
        useAuth: () => ({ user: currentUser, requireAuth: () => prompts++ }),
      },
    });
    renderToStaticMarkup(
      React.createElement(load("src/app/(tabs)/_layout.tsx").default),
    );
    let prevented = false;
    routes
      .find((route) => route.name === "missions")
      .listeners.tabPress({
        preventDefault: () => {
          prevented = true;
        },
      });
    assert.equal(prevented, !currentUser);
    assert.equal(prompts, currentUser ? 0 : 1);
  }
});
test("Perfil público y privado: frase local presente, sin Medallas e Insignias", () => {
  for (const currentUser of [null, user]) {
    const { load } = harness({
      loading: false,
      user: currentUser,
      logout: async () => {},
    });
    const html = renderToStaticMarkup(
      React.createElement(load("src/app/(tabs)/profile.tsx").default),
    );
    assert.match(html, /Identifica tus zonas seguras/);
    assert.match(html, /Consejo informativo local/);
    assert.match(html, /Tarjeta de criatura conservada/);
    assert.doesNotMatch(html, /medallas|insignias/i);
    if (currentUser) assert.match(html, /45/);
  }
});

function api(fetch) {
  return loader(
    { "../config/api": { API_BASE_URL: "https://backend.example/api" } },
    fetch,
  )("src/services/publicContentService.ts");
}
const response = (body, status = 200) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => body,
});
function expectPeruFallback(directory) {
  assert.equal(directory.source, "local");
  assert.equal(directory.country, "PERU");
  assert.equal(directory.contacts.length, 3);
  assert.equal(
    JSON.stringify(directory.contacts.map((item) => item.number)),
    JSON.stringify(["105", "116", "106"]),
  );
}
test("emergencias: usa la ruta existente, filtra el país y conserva los datos del DTO", async () => {
  const service = api(async (url, options) => {
    assert.equal(
      url,
      "https://backend.example/api/contectoEmergencia/getListContactoEmergencia",
    );
    assert.equal(options.headers.Authorization, undefined);
    return response([
      {
        nombre: "Contacto peruano",
        numero: "105",
        descripcion: "Dato del servidor",
        pais: "PERU",
      },
      {
        nombre: "Contacto chileno",
        numero: "+56 123 456",
        descripcion: "Otro país",
        pais: "CHILE",
      },
    ]);
  });
  const directory = await service.fetchEmergencyDirectory("CHILE");
  assert.equal(directory.source, "backend");
  assert.equal(directory.country, "CHILE");
  assert.equal(directory.contacts.length, 1);
  assert.equal(directory.contacts[0].name, "Contacto chileno");
  assert.equal(directory.contacts[0].number, "+56123456");
});
test("emergencias: lista vacía o sin el país solicitado usa exactamente tres contactos de Perú", async () => {
  for (const body of [
    [],
    [{ nombre: "Otro país", numero: "123", pais: "CHILE" }],
  ]) {
    const directory = await api(async () =>
      response(body),
    ).fetchEmergencyDirectory("PERU");
    expectPeruFallback(directory);
    assert.equal(directory.reason, "empty");
  }
});
test("emergencias: HTTP, error de red o DTO inválido utiliza fallback y no números arbitrarios", async () => {
  for (const status of [403, 404, 500]) {
    const directory = await api(async () =>
      response(null, status),
    ).fetchEmergencyDirectory();
    expectPeruFallback(directory);
    assert.equal(directory.reason, "unavailable");
  }
  expectPeruFallback(
    await api(async () => {
      throw Error("Sin red");
    }).fetchEmergencyDirectory(),
  );
  expectPeruFallback(
    await api(async () =>
      response([
        { nombre: "Inválido", numero: "javascript:test", pais: "PERU" },
      ]),
    ).fetchEmergencyDirectory(),
  );
});
test("emergencias: salir de pantalla cancela la solicitud, sin reemplazar datos de otra consulta", async () => {
  const controller = new AbortController();
  const service = api(
    async (_, options) =>
      new Promise((resolve, reject) => {
        options.signal.addEventListener("abort", () =>
          reject(Error("cancelada")),
        );
      }),
  );
  const pending = service.fetchEmergencyDirectory("PERU", controller.signal);
  controller.abort();
  await assert.rejects(pending, /cancelada/);
});
