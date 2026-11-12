"use client";

import { useState } from "react";
import {
  DIAS_PREFERIDOS,
  EDADES_ENCUESTA,
  FRECUENCIAS,
  PREGUNTAS_ENCUESTA,
  type IdPregunta,
} from "@/lib/encuesta";
import { enviarEncuesta } from "./acciones";

const vacias = () =>
  Object.fromEntries(PREGUNTAS_ENCUESTA.map((p) => [p.id, [] as string[]])) as Record<IdPregunta, string[]>;

/** Botón que se marca y desmarca, como una ficha. */
function Ficha({ texto, marcada, alternar }: { texto: string; marcada: boolean; alternar: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={marcada}
      onClick={alternar}
      className={`rounded-full border px-4 py-2 text-left text-sm font-medium transition ${
        marcada
          ? "border-marca bg-marca text-white"
          : "border-linea bg-white text-tinta hover:border-marca/50 hover:bg-crema"
      }`}
    >
      {marcada && <span aria-hidden>✓ </span>}
      {texto}
    </button>
  );
}

export function FormularioEncuesta() {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState(0);
  const [elegidas, setElegidas] = useState(vacias);
  const [otros, setOtros] = useState<Partial<Record<IdPregunta, string>>>({});
  const [frecuencia, setFrecuencia] = useState("");
  const [dias, setDias] = useState<string[]>([]);
  const [comentario, setComentario] = useState("");
  const [web, setWeb] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  const alternar = (lista: string[], x: string) => (lista.includes(x) ? lista.filter((y) => y !== x) : [...lista, x]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!edad) {
      setError("Cuéntanos tu edad.");
      document.getElementById("edad")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError("");
    setEnviando(true);
    try {
      const r = await enviarEncuesta({ nombre, edad, elegidas, otros, frecuencia, dias, comentario, web });
      if (!r.ok) {
        setError(r.error);
        setEnviando(false);
        return;
      }
      setListo(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("No pudimos enviar tus respuestas. Revisa tu conexión e intenta de nuevo.");
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-8 text-center">
        <div className="mano text-4xl text-acento">¡Gracias!</div>
        <h2 className="mt-2 text-2xl font-semibold text-marca">Recibimos tus respuestas</h2>
        <p className="mx-auto mt-3 max-w-md text-gris">
          Con lo que nos contaste vamos a armar las próximas actividades del grupo. ¡Nos vemos en la montaña!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-8 space-y-6">
      <fieldset id="edad" className="scroll-mt-24 rounded-2xl bg-white p-6">
        <legend className="float-left mb-4 w-full text-lg font-semibold">Sobre ti</legend>
        <div className="clear-both grid gap-5 sm:grid-cols-2">
          <label>
            <span className="rotulo">
              Tu nombre <span className="font-normal text-gris">(opcional)</span>
            </span>
            <input
              className="campo"
              maxLength={80}
              autoComplete="given-name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>
          <div>
            <span className="rotulo">¿Cuántos años tienes?</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Edad">
              {EDADES_ENCUESTA.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={edad === n}
                  onClick={() => {
                    setEdad(n);
                    setError("");
                  }}
                  className={`size-12 rounded-full border text-base font-semibold transition ${
                    edad === n ? "border-marca bg-marca text-white" : "border-linea bg-white hover:bg-crema"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      {PREGUNTAS_ENCUESTA.map((p) => (
        <fieldset key={p.id} className="rounded-2xl bg-white p-6">
          <legend className="float-left w-full text-lg font-semibold">{p.titulo}</legend>
          <p className="clear-both mb-4 text-sm text-gris">{p.ayuda}</p>
          <div className="flex flex-wrap gap-2">
            {p.opciones.map((o) => (
              <Ficha
                key={o}
                texto={o}
                marcada={elegidas[p.id].includes(o)}
                alternar={() => setElegidas((prev) => ({ ...prev, [p.id]: alternar(prev[p.id], o) }))}
              />
            ))}
          </div>
          {p.otro && (
            <label className="mt-4 block">
              <span className="rotulo">¿Otra idea?</span>
              <input
                className="campo"
                maxLength={200}
                placeholder="Escríbela aquí"
                value={otros[p.id] ?? ""}
                onChange={(e) => setOtros((prev) => ({ ...prev, [p.id]: e.target.value }))}
              />
            </label>
          )}
        </fieldset>
      ))}

      <fieldset className="rounded-2xl bg-white p-6">
        <legend className="float-left mb-4 w-full text-lg font-semibold">¿Cada cuánto te gustaría juntarte?</legend>
        <div className="clear-both flex flex-wrap gap-2" role="radiogroup" aria-label="Frecuencia">
          {FRECUENCIAS.map((f) => (
            <Ficha key={f} texto={f} marcada={frecuencia === f} alternar={() => setFrecuencia(frecuencia === f ? "" : f)} />
          ))}
        </div>
        <p className="mt-6 mb-3 font-semibold">¿Qué días te acomodan?</p>
        <div className="flex flex-wrap gap-2">
          {DIAS_PREFERIDOS.map((x) => (
            <Ficha key={x} texto={x} marcada={dias.includes(x)} alternar={() => setDias((prev) => alternar(prev, x))} />
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-2xl bg-white p-6">
        <legend className="float-left mb-4 w-full text-lg font-semibold">¿Algo más que quieras contarnos?</legend>
        <textarea
          className="campo clear-both min-h-28"
          maxLength={2000}
          placeholder="Ideas, lugares a los que te gustaría ir, lo que no te gustaría que pasara…"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
      </fieldset>

      {/* Campo trampa para robots: oculto para las personas y los lectores de pantalla. */}
      <input
        type="text"
        name="web"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-px w-px opacity-0"
        value={web}
        onChange={(e) => setWeb(e.target.value)}
      />

      {error && (
        <p role="alert" className="rounded-xl bg-acento/10 px-4 py-3 text-sm font-medium text-acento">
          {error}
        </p>
      )}
      <button type="submit" disabled={enviando} className="btn btn-primario w-full sm:w-auto">
        {enviando ? "Enviando…" : "Enviar mis respuestas"}
      </button>
      <p className="text-xs text-gris">Tus respuestas solo las ve el equipo del club.</p>
    </form>
  );
}
