# Club de la Montaña

Sitio web del Club de la Montaña (Sally Willmans): las familias ven las próximas salidas, inscriben a sus hijos y pagan en línea con Mercado Pago. Sally administra todo desde su propio panel.

**Stack:** Next.js (Vercel) · Firebase (Firestore, Auth, Storage) · Mercado Pago Checkout Pro · correos por SMTP.

## Estado

**Etapa 1: prototipo (actual).** El sitio público funciona con datos de ejemplo (`src/lib/demo.ts`) y el pago está simulado. Sirve para revisar diseño y textos con Sally.

- Inicio: portada, próximas salidas, cómo funciona, quiénes somos, cuidados, galería, preguntas y contacto
- Detalle de cada salida: fecha, lugar, edades, horario, qué llevar, precio y cupos
- Ficha de inscripción: datos de cada niño, salud, apoderado, contacto de emergencia y autorización
- Pago simulado y comprobante
- Botón de WhatsApp

**Siguientes etapas:**

1. Conectar Firebase: las salidas, inscripciones y ajustes salen de Firestore (`src/lib/data.ts`, `src/lib/inscripciones.ts` ya están escritos). Listo: el sitio público lee de Firestore
2. Pago real con Mercado Pago y webhook (`src/lib/mercadopago.ts`)
3. Avisos por correo (`src/lib/email.ts`)
4. Contenido real, dominio y SEO
5. Panel de Sally: ya funciona en `/admin` (salidas, inscritos, ajustes). Falta la subida de fotos (necesita Storage con plan Blaze)

## Firebase

- Proyecto: `clubdelamontana-chile` (consola: https://console.firebase.google.com/project/clubdelamontana-chile)
- Firestore en `southamerica-west1` (Santiago). Las reglas bloquean el acceso desde el navegador; todo pasa por el servidor con `firebase-admin`.
- Las credenciales del servidor están como variables de entorno en Vercel (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, etc.).
- Pendiente: el plan Blaze para Storage (fotos).

Publicar reglas:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Emuladores locales (sin tocar datos reales):

```bash
firebase emulators:start --project demo-club-montana
```

## Panel (/admin)

- Se entra con una sola clave, guardada en Vercel como `ADMIN_PASSWORD` (variable secreta).
- La sesión dura 7 días, en una cookie firmada con `SESSION_SECRET`. Si cambias `SESSION_SECRET`, se cierran todas las sesiones.
- Para cambiar la clave: Vercel → Settings → Environment Variables → `ADMIN_PASSWORD`, y volver a publicar.
- Desde el panel se crean, editan, duplican y borran salidas, se ven los inscritos con sus fichas (imprimir o descargar planilla) y se cambian el contacto y el texto de autorización.

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Las variables de entorno están descritas en `.env.example`.
