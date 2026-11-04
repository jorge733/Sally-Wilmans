#!/usr/bin/env node
/**
 * Carga salidas y ajustes en Firestore desde un archivo JSON.
 * Mientras no exista el panel, así se cargan las fechas que mande Sally.
 *
 *   Emuladores:  npm run cargar -- --emulador [archivo.json]
 *   Real:        npm run cargar -- --proyecto clubdelamontana-chile [archivo.json]
 *
 * En modo real usa la sesión de firebase-tools (`firebase login`), así que no
 * hace falta descargar claves. Cada salida se guarda con su `id`: si ya existe,
 * se reemplaza (incluido el contador de cupos tomados).
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const args = process.argv.slice(2);
const emulador = args.includes("--emulador");
const iProyecto = args.indexOf("--proyecto");
const proyecto = emulador ? "demo-club-montana" : args[iProyecto + 1];
const archivo = args.find((a, i) => !a.startsWith("--") && i !== iProyecto + 1) ?? "scripts/datos-ejemplo.json";

if (!emulador && (iProyecto === -1 || !proyecto)) {
  console.error("Indica --emulador o --proyecto <id>");
  process.exit(1);
}

/** Token de acceso a partir de la sesión de `firebase login`. */
async function token() {
  if (emulador) return "owner";
  const require = createRequire(import.meta.url);
  const npmGlobal = process.env.APPDATA ? path.join(process.env.APPDATA, "npm") : "/usr/local";
  const auth = require(path.join(npmGlobal, "node_modules/firebase-tools/lib/auth"));
  const home = process.env.USERPROFILE ?? process.env.HOME;
  const cfg = JSON.parse(readFileSync(path.join(home, ".config/configstore/firebase-tools.json"), "utf8"));
  const t = await auth.getAccessToken(cfg.tokens.refresh_token, ["https://www.googleapis.com/auth/cloud-platform"]);
  return t.access_token;
}

/** Convierte un valor JS al formato de la API REST de Firestore. */
function valor(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(valor) } };
  return { mapValue: { fields: campos(v) } };
}
const campos = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, valor(v)]));

const base = emulador
  ? `http://${process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080"}/v1`
  : "https://firestore.googleapis.com/v1";
const raiz = `projects/${proyecto}/databases/(default)/documents`;

const datos = JSON.parse(readFileSync(archivo, "utf8"));
const ahora = Date.now();
const writes = [];

if (datos.ajustes) {
  writes.push({
    update: { name: `${raiz}/ajustes/sitio`, fields: campos(datos.ajustes) },
    updateMask: { fieldPaths: Object.keys(datos.ajustes) },
  });
}
for (const { id, ...s } of datos.salidas ?? []) {
  if (!id) throw new Error(`Falta el id en la salida "${s.titulo}"`);
  const doc = {
    fechaFin: null,
    fotoUrl: null,
    fotoPath: null,
    cuposTomados: 0,
    estado: "publicada",
    ...s,
    creadoEn: s.creadoEn || ahora,
    actualizadoEn: ahora,
  };
  writes.push({ update: { name: `${raiz}/salidas/${id}`, fields: campos(doc) } });
}

const r = await fetch(`${base}/${raiz}:commit`, {
  method: "POST",
  headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
  body: JSON.stringify({ writes }),
});
if (!r.ok) {
  console.error("Error de Firestore:", r.status, await r.text());
  process.exit(1);
}
console.log(
  `Listo en ${emulador ? "emuladores" : proyecto}: ${datos.salidas?.length ?? 0} salidas${datos.ajustes ? " y ajustes" : ""}.`,
);
