# Club de la Montaña

Sitio web del Club de la Montaña (Sally Willmans): las familias ven las próximas salidas, inscriben a sus hijos y pagan en línea con Flow. Sally administra todo desde su propio panel.

**Stack:** Next.js (Vercel) · Firebase (Firestore, Auth, Storage) · Flow (flow.cl) · correos con Resend.

## Estado

El sitio público y el panel funcionan con datos reales en Firestore. Lo que queda está en **Pendiente**.

**Sitio público**

- Inicio: portada, próximas salidas, cómo funciona, quiénes somos, cuidados, galería, preguntas y contacto. Textos y fotos se editan desde el panel.
- Detalle de cada salida: fecha, lugar, edades, horario, qué llevar, precio, cupos y fotos de la salida.
- Ficha de inscripción: datos de cada niño, salud, apoderado, contacto de emergencia y autorización.
- Club de Verano por semanas: la familia elige semanas completas (y días sueltos si la salida tiene precio por día); los cupos se cuentan por día.
- Pago con Flow, comprobante en `/inscripcion/[id]` y reintento si el pago falla.
- Encuesta para jóvenes de 13 a 16 años en `/encuesta` (juegos, actividades, temas y formatos). Se puede destacar con un aviso en el inicio desde el panel.
- Imágenes para compartir (WhatsApp, Instagram) del sitio, de cada salida y de la encuesta (`opengraph-image.tsx`).
- Animaciones al hacer scroll, favicon y botón de WhatsApp.

**Correos (Resend)**

- Al pagar: confirmación al apoderado y aviso a `ADMIN_NOTIFY_EMAIL`. Cada correo sale una sola vez aunque Flow avise dos veces.
- Cada respuesta de la encuesta llega también por correo.
- Sin `RESEND_API_KEY` los correos solo se anotan en la consola.

**Pendiente**

1. Pago real: cargar `FLOW_API_KEY` y `FLOW_SECRET_KEY` de Sally en Vercel y hacer una compra de prueba en sandbox.flow.cl.
2. Verificar el dominio del remitente en Resend.
3. Dominio propio y SEO final.

## Panel (/admin)

- **Salidas**: crear, editar, duplicar y borrar salidas; armar las semanas del Club de Verano; subir fotos de cada salida.
- **Inscritos**: fichas de cada salida, para imprimir o descargar en planilla (CSV).
- **Encuesta**: resumen de respuestas y borrar las que no sirvan.
- **Contenido**: textos de la página de inicio y fotos (portada, quiénes somos y galería, con formato normal, ancha, alta o grande). Lo que no se edite usa los textos de `src/lib/site.ts`.
- **Ajustes**: contacto y texto de autorización.

Acceso:

- Se entra con una sola clave, guardada en Vercel como `ADMIN_PASSWORD` (variable secreta).
- La sesión dura 7 días, en una cookie firmada con `SESSION_SECRET`. Si cambias `SESSION_SECRET`, se cierran todas las sesiones.
- Para cambiar la clave: Vercel → Settings → Environment Variables → `ADMIN_PASSWORD`, y volver a publicar.

## Firebase

- Proyecto: `clubdelamontana-chile` (consola: https://console.firebase.google.com/project/clubdelamontana-chile)
- Firestore en `southamerica-west1` (Santiago). Las reglas bloquean el acceso desde el navegador; todo pasa por el servidor con `firebase-admin`.
- Las credenciales del servidor están como variables de entorno en Vercel (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, etc.).
- Storage guarda las fotos que se suben desde el panel (carpeta `public/`, solo lectura para el público; `storage.rules`). Las fotos se achican en el navegador (lado mayor 1920 px) antes de subirse.

Publicar reglas:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Emuladores locales (sin tocar datos reales):

```bash
firebase emulators:start --project demo-club-montana
```

## Pagos (Flow)

1. La ficha llama a `iniciarInscripcion`: reserva el cupo por 30 minutos y crea la orden en Flow.
2. El apoderado paga en Flow. Flow avisa a `/api/flow/confirmacion` y devuelve al apoderado a `/api/flow/retorno` (con POST), que lo manda a `/inscripcion/[id]`.
3. En ambos casos se consulta el estado a la API de Flow y se marca la inscripción como pagada. Se envían los correos una sola vez.
4. Si el pago se rechaza, el cupo sigue guardado y el apoderado puede reintentar desde `/inscripcion/[id]`. Si no paga en 30 minutos, el cupo se libera solo.

Para probar con dinero ficticio: crea una cuenta en https://sandbox.flow.cl, usa sus credenciales y `FLOW_API_URL=https://sandbox.flow.cl/api`. Flow tiene que poder llegar a la URL del sitio, así que se prueba en un deploy de Vercel, no en localhost. En local, `PAGO_SIMULADO=1` salta Flow.

Si corres un segundo servidor de desarrollo en la misma carpeta (por ejemplo, desde otra sesión), usa la configuración `web-aparte` de `.claude/launch.json`: compila en `.next-aparte` en el puerto 3005 para no pisar la carpeta `.next`.

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Las variables de entorno están descritas en `.env.example`.

Para cargar salidas desde un JSON (por ejemplo `scripts/datos-ejemplo.json`):

```bash
npm run cargar -- --emulador scripts/datos-ejemplo.json
```

En `logo/` están los logos del club y en `redes/` el material para anunciar el sitio en Instagram.
