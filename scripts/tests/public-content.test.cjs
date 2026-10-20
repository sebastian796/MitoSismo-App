const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');

// Ejecuta los servicios reales con transporte aislado. No usa cuentas ni base de datos.
function load(file, fetch) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, {
    exports, fetch, AbortController, URLSearchParams, setTimeout, clearTimeout,
    require: id => {
      if (id === '../config/api') return { API_BASE_URL: 'https://backend.example/api/' };
      if (id === '../utils/countryFilter') return { isQuakeInCountry: () => true };
      throw new Error('Import inesperado: ' + id);
    },
  });
  return exports;
}
const response = (body, status = 200) => ({ status, ok: status >= 200 && status < 300, json: async () => body });
test('criatura pública usa el DTO real y consulta sin Authorization', async () => {
  const creature = { id: 8, nombre: 'Criatura del servidor', titulo: 'Título', elemento: 'AIRE', imageUrl: '/images/8.png' };
  const api = load('src/services/publicContentService.ts', async (url, options) => {
    assert.equal(url, 'https://backend.example/api/criatura/publico');
    assert.equal(options.headers.Authorization, undefined);
    return response(creature);
  });
  assert.equal(await api.fetchPublicCreature(), creature);
});
test('criatura ausente no crea valores predeterminados', async () => {
  for (const status of [204, 404]) {
    const api = load('src/services/publicContentService.ts', async () => response(null, status));
    assert.equal(await api.fetchPublicCreature(), null);
  }
});
test('las tres fases consultan las rutas existentes y conservan consejo', async () => {
  for (const phase of ['antes', 'durante', 'despues']) {
    const tips = [{ fase: { clave: phase.toUpperCase() }, consejo: 'Consejo desde el servidor' }];
    const api = load('src/services/publicContentService.ts', async url => {
      assert.equal(url, 'https://backend.example/api/prevencion/' + phase);
      return response(tips);
    });
    assert.equal(await api.fetchPreventionTips(phase), tips);
  }
});
test('lista vacía, errores HTTP y DTO malformado no producen consejos inventados', async () => {
  const empty = load('src/services/publicContentService.ts', async () => response([]));
  assert.equal((await empty.fetchPreventionTips('antes')).length, 0);
  const denied = load('src/services/publicContentService.ts', async () => response(null, 403));
  await assert.rejects(denied.fetchPreventionTips('antes'), /403/);
  const invalid = load('src/services/publicContentService.ts', async () => response([{ texto: 'otra propiedad' }]));
  await assert.rejects(invalid.fetchPreventionTips('durante'), /inválidos/);
});
test('cancelar una consulta pública aborta el transporte', async () => {
  const api = load('src/services/publicContentService.ts', async (_, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('cancelada')));
  }));
  const controller = new AbortController();
  const pending = api.fetchPreventionTips('despues', controller.signal);
  controller.abort();
  await assert.rejects(pending, /cancelada/);
});
test('Home consulta USGS global por fecha, descarta magnitudes inválidas y conserva detalle', async () => {
  const feature = (id, mag, time) => ({ id, properties: { mag, time, place: 'Ubicación USGS', magType: 'ml' }, geometry: { coordinates: [-77, -12, 15] } });
  let calls = 0;
  const api = load('src/services/earthquakeService.ts', async url => {
    calls++;
    const params = new URL(url).searchParams;
    assert.equal(params.get('limit'), '5');
    assert.equal(params.get('orderby'), 'time');
    assert.equal(params.has('minlatitude'), false);
    return response({ features: [feature('nuevo', 3.1, Date.now()), feature('invalido', null, Date.now()), feature('anterior', 5.2, Date.now()-60000)] });
  });
  const quakes = await api.fetchRecentEarthquakes(5);
  assert.equal(quakes.length, 2);
  assert.equal(quakes[0].id, 'nuevo');
  assert.equal(Math.max(...quakes.map(q => q.mag)), 5.2);
  assert.equal((await api.fetchEarthquakeById('nuevo')).id, 'nuevo');
  assert.equal(calls, 1);
});
test('catálogo de Registro coincide exactamente con el enum Pais del backend', () => {
  const countries = load('src/constants/countries.ts').COUNTRIES.map(country => country.value);
  const java = fs.readFileSync(path.join(root, 'server/src/main/java/com/mito/sismo/entity/enums/Pais.java'), 'utf8');
  const values = java.slice(java.indexOf('{') + 1, java.lastIndexOf('}')).trim().split(/,\s*/);
  assert.equal(JSON.stringify(countries), JSON.stringify(values));
});

test('Home y Perfil comparten consulta y mascota durante la sesión, aunque otro consumidor se cancele', async () => {
  let calls = 0;
  let complete;
  const creature = { id: 10, nombre: 'Mascota pública' };
  const api = load('src/services/publicContentService.ts', async () => {
    calls++;
    return new Promise(resolve => { complete = () => resolve(response(creature)); });
  });
  const home = new AbortController();
  const first = api.fetchPublicCreature(home.signal);
  const profile = api.fetchPublicCreature();
  home.abort();
  await assert.rejects(first, { name: 'AbortError' });
  complete();
  assert.equal(await profile, creature);
  assert.equal(await api.fetchPublicCreature(), creature);
  assert.equal(calls, 1);
});
test('la caché pública permite reintentar después de un fallo o ausencia', async () => {
  let calls = 0;
  const api = load('src/services/publicContentService.ts', async () => {
    calls++;
    return calls === 1 ? response(null, 503) : calls === 2 ? response(null, 404) : response({ id: 2, nombre: 'Disponible' });
  });
  await assert.rejects(api.fetchPublicCreature(), /503/);
  assert.equal(await api.fetchPublicCreature(), null);
  assert.equal((await api.fetchPublicCreature()).nombre, 'Disponible');
  assert.equal(calls, 3);
});
test('Prevención distingue 200 vacío de HTTP 401, 403, 404, 500 y respuestas null', async () => {
  for (const status of [401, 403, 404, 500]) {
    const api = load('src/services/publicContentService.ts', async () => response(null, status));
    await assert.rejects(api.fetchPreventionTips('antes'), new RegExp('HTTP ' + status));
  }
  const invalid = load('src/services/publicContentService.ts', async () => response(null));
  await assert.rejects(invalid.fetchPreventionTips('antes'), /inválidos/);
});
