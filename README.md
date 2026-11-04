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

1. Conectar Firebase: las salidas, inscripciones y ajustes salen de Firestore (`src/lib/data.ts`, `src/lib/inscripciones.ts` ya están escritos)
2. Pago real con Mercado Pago y webhook (`src/lib/mercadopago.ts`)
3. Panel de Sally: login, crear y editar salidas, fotos, lista de inscritos
4. Avisos por correo (`src/lib/email.ts`)
5. Dominio, SEO y publicación

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Las variables de entorno están descritas en `.env.example`.
