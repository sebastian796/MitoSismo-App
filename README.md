# MitoSismo

Aplicación móvil de alerta, prevención y monitoreo sísmico, construida con React Native, Expo SDK 57, Expo Router y TypeScript.

## Arquitectura

- `src/app/`: rutas y layouts de Expo Router exclusivamente.
- `src/components/ui/`: componentes reutilizables de interfaz.
- `src/components/quake/`: componentes del dominio sísmico.
- `src/components/icons/`: iconos vectoriales propios.
- `src/constants/`: tema y datos locales temporales.
- `src/types/`: contratos TypeScript, incluido `earthquake.ts`.

Las pantallas móviles usan componentes nativos de React Native; no dependen de CSS ni HTML web. Los datos sísmicos actuales son locales y se reemplazarán mediante un servicio cuando se defina la API a consumir.

## Ejecutar

```bash
npm install
npm start
```

Para verificar tipos:

```bash
npx tsc --noEmit
```
