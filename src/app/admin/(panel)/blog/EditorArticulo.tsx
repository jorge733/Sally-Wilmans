"use client";

import { useActionState, useRef, useState } from "react";
import { TextoArticulo } from "@/components/TextoArticulo";
import { achicar } from "@/lib/achicar-foto";
import { MAX_RESUMEN, MAX_TITULO, minutosLectura, type Articulo, type ImagenArticulo } from "@/lib/blog";
import { eliminarArticulo, guardarArticulo, subirFotoArticulo } from "./acciones";

type Portada = Articulo["portada"];

/** Sube una foto ya achicada y devuelve su URL, o lanza el error para mostrarlo. */
async function subirFoto(archivo: File): Promise<ImagenArticulo> {
  const form = new FormData();
  form.append("foto", await achicar(archivo));
  const r = await subirFotoArticulo(form);
  if (!r.foto) throw new Error(r.error ?? "No se pudo subir la foto.");
  return r.foto;
}

export function EditorArticulo({ articulo, hoy }: { articulo?: Articulo; hoy: string }) {
  const [estado, accion, guardando] = useActionState(guardarArticulo, null);
  const [titulo, setTitulo] = useState(articulo?.titulo ?? "");
  const [resumen, setResumen] = useState(articulo?.resumen ?? "");
  const [cuerpo, setCuerpo] = useState(articulo?.cuerpo ?? "");
  const [fecha, setFecha] = useState(articulo?.fecha || hoy);
  const [publicado, setPublicado] = useState(articulo?.estado === "publicado");
  const [portada, setPortada] = useState<Portada>(articulo?.portada ?? null);
  const [subidas, setSubidas] = useState<ImagenArticulo[]>(articulo?.imagenes ?? []);
  const [vista, setVista] = useState(false);
  const [subiendo, setSubiendo] = useState<"portada" | "texto" | null>(null);
  const [errorFoto, setErrorFoto] = useState("");
  const texto = useRef<HTMLTextAreaElement>(null);

  /** Envuelve lo seleccionado (o inserta en el cursor) y deja el cursor en un lugar cómodo. */
  function insertar(antes: string, despues = "", ejemplo = "") {
    const t = texto.current;
    if (!t) return;
    const { selectionStart: ini, selectionEnd: fin } = t;
    const elegido = cuerpo.slice(ini, fin) || ejemplo;
    const nuevo = cuerpo.slice(0, ini) + antes + elegido + despues + cuerpo.slice(fin);
    setCuerpo(nuevo);
    requestAnimationFrame(() => {
      t.focus();
      t.setSelectionRange(ini + antes.length, ini + antes.length + elegido.length);
    });
  }

  /** Inserta algo en una línea propia (subtítulos, listas, fotos). */
  function insertarLinea(prefijo: string, ejemplo: string) {
    const t = texto.current;
    if (!t) return;
    const ini = t.selectionStart;
    const antes = cuerpo.slice(0, ini);
    const salto = !antes || antes.endsWith("\n\n") ? "" : antes.endsWith("\n") ? "\n" : "\n\n";
    insertar(`${salto}${prefijo}`, "\n\n", ejemplo);
  }

  async function elegirPortada(archivo: File | undefined) {
    if (!archivo) return;
    setErrorFoto("");
    setSubiendo("portada");
    try {
      const f = await subirFoto(archivo);
      setSubidas((s) => [...s, f]);
      setPortada({ ...f, alt: portada?.alt ?? "" });
    } catch (e) {
      setErrorFoto(e instanceof Error ? e.message : "No se pudo subir la foto.");
    } finally {
      setSubiendo(null);
    }
  }

  async function fotoEnTexto(archivo: File | undefined) {
    if (!archivo) return;
    setErrorFoto("");
    setSubiendo("texto");
    try {
      const f = await subirFoto(archivo);
      setSubidas((s) => [...s, f]);
      // Va en su propia línea, donde estaba el cursor (o al final si nunca se tocó el texto).
      const pos = texto.current?.selectionStart ?? cuerpo.length;
      setCuerpo((c) => {
        const antes = c.slice(0, pos);
        const salto = !antes || antes.endsWith("\n\n") ? "" : antes.endsWith("\n") ? "\n" : "\n\n";
        return `${antes}${salto}![](${f.url})\n\n${c.slice(pos).replace(/^\n+/, "")}`;
      });
    } catch (e) {
      setErrorFoto(e instanceof Error ? e.message : "No se pudo subir la foto.");
    } finally {
      setSubiendo(null);
    }
  }

  const json = JSON.stringify({
    titulo,
    resumen,
    cuerpo,
    fecha,
    estado: publicado ? "publicado" : "borrador",
    portada,
    subidas,
  });

  const herramientas: { etiqueta: string; titulo: string; hacer: () => void; clase?: string }[] = [
    { etiqueta: "Subtítulo", titulo: "Subtítulo", hacer: () => insertarLinea("## ", "Subtítulo") },
    { etiqueta: "B", titulo: "Negrita", hacer: () => insertar("**", "**", "texto en negrita"), clase: "font-bold" },
    { etiqueta: "I", titulo: "Cursiva", hacer: () => insertar("*", "*", "texto en cursiva"), clase: "italic font-serif" },
    { etiqueta: "• Lista", titulo: "Lista con puntos", hacer: () => insertarLinea("- ", "Primer punto") },
    { etiqueta: "1. Lista", titulo: "Lista numerada", hacer: () => insertarLinea("1. ", "Primer paso") },
    { etiqueta: "❝ Cita", titulo: "Cita destacada", hacer: () => insertarLinea("> ", "Una frase para destacar") },
    {
      etiqueta: "Enlace",
      titulo: "Enlace",
      hacer: () => {
        const url = prompt("Pega la dirección del enlace (https://…)");
        if (url) insertar("[", `](${url.trim()})`, "texto del enlace");
      },
    },
  ];

  return (
    <form action={accion} className="space-y-6">
      {articulo && <input type="hidden" name="id" value={articulo.id} />}
      <input type="hidden" name="articulo" value={json} />

      <section className="space-y-4 rounded-2xl bg-white p-6">
        <label className="block">
          <span className="rotulo">Título</span>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            maxLength={MAX_TITULO}
            placeholder="Ej.: Qué llevar en la mochila para una salida al cerro"
            className="campo text-lg font-semibold"
          />
        </label>
        <label className="block">
          <span className="rotulo">Resumen</span>
          <textarea
            value={resumen}
            onChange={(e) => setResumen(e.target.value)}
            rows={2}
            maxLength={MAX_RESUMEN}
            placeholder="Una o dos frases que inviten a leer. Se ve en el listado y al compartir el enlace."
            className="campo"
          />
          <span className="mt-1 block text-right text-xs text-gris">
            {resumen.length} / {MAX_RESUMEN}
          </span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="rotulo">Fecha del artículo</span>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required className="campo" />
          </label>
          <div>
            <span className="rotulo">Estado</span>
            <div className="mt-1 flex gap-2">
              {[
                { valor: true, texto: "Publicado" },
                { valor: false, texto: "Borrador" },
              ].map((o) => (
                <button
                  key={o.texto}
                  type="button"
                  aria-pressed={publicado === o.valor}
                  onClick={() => setPublicado(o.valor)}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    publicado === o.valor ? "border-marca bg-marca text-white" : "border-linea hover:bg-crema"
                  }`}
                >
                  {o.texto}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gris">
              {publicado ? "Se ve en el sitio al guardar." : "Solo lo ves tú, aquí en el panel."}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold">Foto de portada</h2>
        {portada ? (
          <div className="grid gap-4 sm:grid-cols-[16rem_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portada.url} alt={portada.alt} className="aspect-[16/10] w-full rounded-xl bg-crema object-cover" />
            <div className="space-y-3">
              <label className="block">
                <span className="rotulo">Descripción de la foto</span>
                <input
                  value={portada.alt}
                  onChange={(e) => setPortada({ ...portada, alt: e.target.value })}
                  maxLength={200}
                  placeholder="Ej.: Niños caminando por el sendero"
                  className="campo"
                />
              </label>
              <div className="flex flex-wrap gap-2 text-sm">
                <label className="btn btn-secundario cursor-pointer px-4 py-2 text-marca">
                  {subiendo === "portada" ? "Subiendo…" : "Cambiar foto"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={subiendo !== null}
                    onChange={(e) => {
                      void elegirPortada(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setPortada(null)}
                  className="rounded-full px-4 py-2 font-medium text-acento hover:bg-acento/10"
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label
            className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-linea px-4 py-8 text-center transition hover:border-marca/50 hover:bg-crema/50 ${
              subiendo === "portada" ? "pointer-events-none opacity-70" : ""
            }`}
          >
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={subiendo !== null}
              onChange={(e) => {
                void elegirPortada(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <span className="font-semibold text-marca">{subiendo === "portada" ? "Subiendo…" : "Elegir foto de portada"}</span>
            <span className="text-sm text-gris">Opcional. Se ve arriba del artículo, en el listado y al compartirlo.</span>
          </label>
        )}
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Texto</h2>
          <div className="flex rounded-full bg-crema p-1 text-sm font-semibold">
            {[
              { v: false, t: "Escribir" },
              { v: true, t: "Vista previa" },
            ].map((o) => (
              <button
                key={o.t}
                type="button"
                aria-pressed={vista === o.v}
                onClick={() => setVista(o.v)}
                className={`rounded-full px-4 py-1.5 ${vista === o.v ? "bg-white text-marca shadow-sm" : "text-gris"}`}
              >
                {o.t}
              </button>
            ))}
          </div>
        </div>

        {vista ? (
          <div className="min-h-64 rounded-xl border border-linea p-5 sm:p-8">
            {cuerpo.trim() ? (
              <TextoArticulo cuerpo={cuerpo} />
            ) : (
              <p className="text-gris">Todavía no hay texto.</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1 rounded-xl border border-linea bg-crema/60 p-1.5 text-sm">
              {herramientas.map((h) => (
                <button
                  key={h.titulo}
                  type="button"
                  title={h.titulo}
                  onClick={h.hacer}
                  className={`rounded-lg px-3 py-1.5 hover:bg-white ${h.clase ?? "font-medium"}`}
                >
                  {h.etiqueta}
                </button>
              ))}
              <label
                title="Agregar una foto donde está el cursor"
                className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium hover:bg-white ${subiendo ? "pointer-events-none opacity-50" : ""}`}
              >
                {subiendo === "texto" ? "Subiendo foto…" : "📷 Foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={subiendo !== null}
                  onChange={(e) => {
                    void fotoEnTexto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <textarea
              ref={texto}
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
              rows={20}
              placeholder={"Escribe aquí el artículo.\n\nDeja una línea en blanco entre párrafos."}
              className="campo font-mono text-[0.95rem] leading-relaxed"
            />
            <details className="text-sm text-gris">
              <summary className="cursor-pointer font-medium text-marca">¿Cómo dar formato al texto?</summary>
              <ul className="mt-2 space-y-1 pl-1">
                <li>Deja una línea en blanco entre párrafos.</li>
                <li>
                  <code>## Subtítulo</code> al comienzo de una línea crea un subtítulo.
                </li>
                <li>
                  <code>**así**</code> queda en <b>negrita</b> y <code>*así*</code> en <i>cursiva</i>.
                </li>
                <li>
                  <code>- </code> al comienzo de cada línea arma una lista; <code>1. </code> una lista numerada.
                </li>
                <li>
                  <code>&gt; </code> al comienzo destaca una frase como cita.
                </li>
                <li>
                  En <code>![descripción](…)</code> puedes escribir entre los corchetes lo que muestra la foto: se ve
                  como pie de foto.
                </li>
              </ul>
            </details>
          </>
        )}
        <p className="text-xs text-gris">{cuerpo.trim() ? `${minutosLectura(cuerpo)} min de lectura` : ""}</p>
      </section>

      {errorFoto && (
        <p role="alert" className="rounded-xl bg-acento/10 px-4 py-2 text-sm font-medium text-acento">
          {errorFoto}
        </p>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-linea bg-[#fbf8f1]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <button disabled={guardando || subiendo !== null} className="btn btn-primario">
          {guardando ? "Guardando…" : articulo ? "Guardar cambios" : publicado ? "Publicar artículo" : "Guardar borrador"}
        </button>
        {estado?.error && (
          <span role="alert" className="text-sm font-medium text-acento">
            {estado.error}
          </span>
        )}
        {estado?.ok && !guardando && <span className="text-sm font-medium text-bosque">{estado.ok}</span>}
        {articulo && (
          <button
            type="button"
            disabled={guardando}
            onClick={() => {
              if (confirm("¿Borrar este artículo y sus fotos? No se puede deshacer.")) void eliminarArticulo(articulo.id);
            }}
            className="ml-auto rounded-full px-4 py-2 text-sm font-medium text-acento hover:bg-acento/10"
          >
            Borrar artículo
          </button>
        )}
      </div>
    </form>
  );
}
