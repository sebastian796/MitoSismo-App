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
test("emergencias: consume el GET público existente, filtra país y conserva DTO", async () => {
  const service = api(async (url, options) => {
    assert.equal(url, "https://backend.example/api/contactos-emergencia/");
    assert.equal(options.headers.Authorization, undefined);
    return response([
      { nombre: "Contacto peruano", numero: "105", descripcion: "Dato servidor", pais: "PERU" },
      { nombre: "Contacto chileno", numero: "+56 123 456", descripcion: "Otro país", pais: "CHILE" },
    ]);
  });
  const directory = await service.fetchEmergencyDirectory("CHILE");
  assert.equal(directory.source, "backend"); assert.equal(directory.country, "CHILE");
  assert.equal(directory.contacts.length, 1); assert.equal(directory.contacts[0].name, "Contacto chileno");
  assert.equal(directory.contacts[0].number, "+56123456");
});
test("emergencias: normaliza Perú y elimina números repetidos sin usar fallback local", async () => {
  const directory = await api(async () => response([
    { nombre: "Bomberos del Perú", numero: "116", descripcion: "Rescate e incendios", pais: "PERU" },
    { nombre: "Bomberos duplicado", numero: "(116)", descripcion: "Duplicado", pais: "Perú" },
    { nombre: "SAMU (Salud)", numero: "106", descripcion: "Ambulancias", pais: "PERU" },
  ])).fetchEmergencyDirectory("Perú");
  assert.equal(directory.country, "PERU");
  assert.deepEqual(directory.contacts.map((contact) => contact.number), ["116", "106"]);
});
test("emergencias: lista vacía del servidor se representa como ausencia, sin teléfonos locales", async () => {
  for (const body of [[], [{ nombre: "Otro país", numero: "123", pais: "CHILE" }]]) {
    const directory = await api(async () => response(body)).fetchEmergencyDirectory("PERU");
    assert.equal(directory.source, "backend"); assert.equal(directory.contacts.length, 0); assert.equal(directory.reason, "empty");
  }
});
test("emergencias: SQL recupera los tres números históricos en la tabla existente", () => {
  const sql = fs.readFileSync(path.join(root, "doc/db/contactos_emergencia_seed.sql"), "utf8");
  const ui = fs.readFileSync(path.join(root, "src/app/prevention.tsx"), "utf8");
  assert.match(sql, /public\.contactos_emergencia\s*\(nombre, numero, descripcion, icono, pais\)/i);
  for (const row of [
    /'Bomberos del Perú',\s*'116'/,
    /'Policía Nacional',\s*'105'/,
    /'SAMU \(Salud\)',\s*'106'/,
  ]) assert.match(sql, row);
  assert.match(sql, /WHERE NOT EXISTS/);
  assert.match(sql, /alcance previo pidió tres líneas/i);
  assert.doesNotMatch(sql, /\('INDECI',\s*'115'/i);
  assert.doesNotMatch(sql, /\b(DROP|TRUNCATE|DELETE FROM)\b/i);
  assert.match(ui, /contacts\.map\(\(contact, index\)/);
  assert.match(ui, /handleCall\(contact\.number\)/);
  assert.match(ui, /Linking\.openURL\(`tel:\$\{number\}`\)/);
  assert.doesNotMatch(ui, /emergencyContacts/);
});
test("emergencias: HTTP, red o DTO inválido conservan error; no usan valores simulados", async () => {
  for (const status of [403, 404, 500]) await assert.rejects(api(async () => response(null, status)).fetchEmergencyDirectory(), new RegExp(String(status)));
  await assert.rejects(api(async () => { throw Error("Sin red"); }).fetchEmergencyDirectory(), /Sin red/);
  await assert.rejects(api(async () => response([{ nombre: "Inválido", numero: "javascript:test", pais: "PERU" }])).fetchEmergencyDirectory(), /inválido/);
});test("emergencias: salir de pantalla cancela la solicitud, sin reemplazar datos de otra consulta", async () => {
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

test("detalle público reutiliza la criatura real de la tarjeta y nunca sustituye por Ignis", () => {
  const fs = require("node:fs");
  const card = fs.readFileSync(path.join(root, "src/components/creatures/PublicCreatureCard.tsx"), "utf8");
  const detail = fs.readFileSync(path.join(root, "src/app/creature.tsx"), "utf8");
  assert.match(card, /fetchPublicCreature/); assert.match(card, /router\.push\("\/creature"\)/);
  assert.match(detail, /fetchPublicCreature/); assert.match(detail, /publicCreature\?\.nombre/);
  assert.match(detail, /publicCreature\?\.elemento/); assert.match(detail, /criatura\?\.imageUrl/);
  assert.match(detail, /publicCreature\?\.mitoLore/); assert.doesNotMatch(detail, /ignisCreature/);
  assert.match(card, /imageUrl=\{null\}/); assert.match(detail, /allowIllustration=\{!isGuest\}/);
});
test("catálogo mochila es público sólo para GET; progreso e interacción siguen protegidos", () => {
  const fs = require("node:fs");
  const ui = fs.readFileSync(path.join(root, "src/app/prevention.tsx"), "utf8");
  const security = fs.readFileSync(path.join(root, "server/src/main/java/com/mito/sismo/config/SecurityConfig.java"), "utf8");
  const dto = fs.readFileSync(path.join(root, "server/src/main/java/com/mito/sismo/dto/entidades/ItemMochilaDTO.java"), "utf8");
  assert.match(ui, /itemMochila\/listItems/); assert.match(ui, /itemMochila\/traerList/);
  assert.match(ui, /itemMochila\/actualizar/); assert.match(ui, /requireAuth\("marcar elementos de la mochila"\)/);
  assert.match(ui, /kitGuestRow/); assert.match(security, /HttpMethod\.GET, "\/api\/itemMochila\/listItems"\)\.permitAll\(\)/);
  assert.match(dto, /getImageUrl\(\)/);
  assert.match(ui, /imageUrl:v\.imageUrl\?\?null/);
  assert.match(ui, /description:v\.descripcion\?\?""/);
  assert.match(ui, /kitGuestRow: \{ opacity: 0\.42 \}/);
  assert.match(ui, /servidor no tiene materiales de mochila registrados/);
  const seed = fs.readFileSync(path.join(root, "doc/db/catalogo_mochila_seed.sql"), "utf8");
  const service = fs.readFileSync(path.join(root, "server/src/main/java/com/mito/sismo/service/ItemMochilaService.java"), "utf8");
  for (const name of ["Agua embotellada (2L por persona)", "Alimentos no perecibles (latas, barras)", "Linterna y pilas de repuesto", "Botiquín de primeros auxilios", "Radio a pilas y silbato de auxilio", "Copia de documentos de identidad"]) assert.ok(seed.includes(name));
  assert.match(seed, /INSERT INTO public\.items_mochila \(nombre\)/);
  assert.match(seed, /lower\(btrim\(i\.nombre\)\) = lower\(btrim\(v\.nombre\)\)/);
  assert.doesNotMatch(seed, /INSERT INTO public\.usuario_mochila_items/i);
  const indexes = fs.readFileSync(path.join(root, "doc/db/indices_progreso_idempotentes.sql"), "utf8");
  assert.match(indexes, /ux_items_mochila_nombre_normalizado/);
  assert.match(service, /findByUsuarioId\(usuario\.getId\(\)\)/);
  assert.match(service, /findAllByOrderByIdAsc\(\)/);
});
