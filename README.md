# Club de la Montaña

Sitio web del Club de la Montaña (Sally Willmans): las familias ven las próximas salidas, inscriben a sus hijos y pagan en línea con Flow. Sally administra todo desde su propio panel.

**Stack:** Next.js (Vercel) · Firebase (Firestore, Auth, Storage) · Flow (flow.cl) · correos con Resend.

## Estado

El sitio está en producción en clubdelamontaña.cl, con pago real, correos y dominio propio. No quedan pendientes.

**Sitio público**

- Inicio: portada, próximas salidas, cómo funciona, quiénes somos, cuidados, galería, preguntas y contacto. Textos y fotos se editan desde el panel.
- Detalle de cada salida: fecha, lugar, edades, horario, qué llevar, precio, cupos y fotos de la salida.
- Ficha de inscripción: datos de cada niño, salud, apoderado, contacto de emergencia y autorización.
- Club de Verano por semanas: la familia elige semanas completas (y días sueltos si la salida tiene precio por día); los cupos se cuentan por día.
- Pago con Flow, comprobante en `/inscripcion/[id]` y reintento si el pago falla.
- Política de cambios y devoluciones en `/devoluciones` (enlazada desde el pie). Ver **Devoluciones**.
- Blog en `/blog`: listado y cada artículo en `/blog/[id]`, con portada, fotos, autora, tiempo de lectura y «Sigue leyendo». Los tres más nuevos aparecen en el inicio (solo si hay alguno publicado). Enlazado en el menú y en el pie.
- Encuesta para jóvenes de 13 a 16 años en `/encuesta` (juegos, actividades, temas y formatos). Se puede destacar con un aviso en el inicio desde el panel.
- Imágenes para compartir (WhatsApp, Instagram) del sitio, de cada salida, de la encuesta, del blog y de cada artículo (con su portada, o cerros si no tiene) (`opengraph-image.tsx`). Las páginas sin imagen propia repiten la del sitio (`OG_IMAGEN_SITIO`).
- Animaciones al hacer scroll, favicon y botón de WhatsApp.
- SEO: `/sitemap.xml` (inicio, salidas vigentes, blog y encuesta), `/robots.txt` (cierra panel, pagos y fichas) y datos estructurados para Google: el club y sus preguntas frecuentes en el inicio, cada salida como evento con fecha, lugar, precio y cupos, y cada artículo del blog (`src/lib/datos-estructurados.tsx`).

**Correos (Resend)**

- Al pagar: confirmación al apoderado (con un resumen de la política de devoluciones) y aviso a `ADMIN_NOTIFY_EMAIL`. Cada correo sale una sola vez aunque Flow avise dos veces.
- Cada respuesta de la encuesta llega también por correo.
- Sin `RESEND_API_KEY` los correos solo se anotan en la consola.

**Puesta en marcha (completada)**

- Pago real con Flow: claves de Sally en Vercel y compra de prueba hecha.
- Dominio del remitente verificado en Resend.
- Dominio propio clubdelamontaña.cl (a nombre de Sally), con `NEXT_PUBLIC_SITE_URL` actualizado, el sitio en Google Search Console y `/sitemap.xml` enviado.
- Texto de autorización definitivo cargado en Panel → Ajustes.
- Link del sitio en la bio de Instagram y Perfil de Empresa en Google.

## Panel (/admin)

- **Salidas**: crear, editar, duplicar y borrar salidas; armar las semanas del Club de Verano; subir fotos de cada salida.
- **Inscritos**: fichas de cada salida, para imprimir o descargar en planilla (CSV).
- **Blog**: escribir, editar y borrar artículos (título, resumen, fecha, portada y texto), como borrador o publicados. El editor tiene botones de formato, fotos dentro del texto y vista previa. El formato está explicado en `src/lib/blog.ts`. La dirección de cada artículo sale del título al crearlo y no cambia después. Las fotos que se quitan o reemplazan se borran de Storage al guardar.
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

## Devoluciones

Política acordada con Sally en noviembre de 2026:

- **La familia cancela una salida:** con aviso por WhatsApp de al menos 24 horas antes del inicio, se devuelve el 100%. Con menos de 24 horas, el mismo día o si el niño no llega, no hay devolución: puede recuperar el día en otra salida sin pagar de nuevo, según cupos, dentro de 6 meses.
- **Club de Verano:** cada semana se cancela completa, con 24 horas de aviso antes de su primer día (100% de esa semana). Una vez que la semana comenzó, los días faltados no se devuelven, pero se recuperan dentro de 6 meses.
- **El club suspende la salida** (mal tiempo, pocos inscritos u otro motivo): la familia elige otra fecha o la devolución del 100%.
- **Trámite:** los avisos solo por WhatsApp; la devolución se hace por transferencia dentro de 3 días hábiles desde que la familia envía los datos de su cuenta. Los casos excepcionales, como una enfermedad con certificado médico, se evalúan caso a caso.

Dónde aparece:

- Página `/devoluciones`, enlazada desde el pie de página y en `/sitemap.xml`.
- Ficha de inscripción: casilla obligatoria antes de pagar. Cada inscripción guarda `devoluciones: { aceptada, version, fecha }`.
- Preguntas frecuentes del inicio (la del mal tiempo y «¿Y si mi hijo o hija no puede ir?»). Si las preguntas ya se guardaron desde el panel, hay que actualizarlas ahí.
- Correo de confirmación: resumen y enlace.

El texto está en `src/lib/devoluciones.ts`. Si la política cambia, edita ese archivo y sube `VERSION_DEVOLUCIONES`, para distinguir qué versión aceptó cada familia.

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
