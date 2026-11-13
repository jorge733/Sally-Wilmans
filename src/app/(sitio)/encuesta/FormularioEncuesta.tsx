"use client";

import { useState } from "react";
import { CON_AMIGOS, EDADES_ENCUESTA, PREGUNTAS_ENCUESTA, VINO_ANTES, type IdPregunta } from "@/lib/encuesta";
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

/** Una sola opción entre varias, con el mismo aspecto de ficha. Tocar la elegida la desmarca. */
function ElegirUna({
  rotulo,
  opciones,
  valor,
  cambiar,
}: {
  rotulo: string;
  opciones: string[];
  valor: string;
  cambiar: (v: string) => void;
}) {
  return (
    <div>
      <span className="rotulo">{rotulo}</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label={rotulo}>
        {opciones.map((o) => (
          <Ficha key={o} texto={o} marcada={valor === o} alternar={() => cambiar(valor === o ? "" : o)} />
        ))}
      </div>
    </div>
  );
}

const opcional = <span className="font-normal text-gris">(opcional)</span>;

export function FormularioEncuesta() {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState(0);
  const [vinoAntes, setVinoAntes] = useState("");
  const [conAmigos, setConAmigos] = useState("");
  const [elegidas, setElegidas] = useState(vacias);
  const [otros, setOtros] = useState<Partial<Record<IdPregunta, string>>>({});
  const [noMeGustaria, setNoMeGustaria] = useState("");
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [comentario, setComentario] = useState("");
  const [contactoApoderado, setContactoApoderado] = useState("");
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
      const r = await enviarEncuesta({
        nombre,
        edad,
        vinoAntes,
        conAmigos,
        elegidas,
        otros,
        noMeGustaria,
        nombreGrupo,
        comentario,
        contactoApoderado,
        web,
      });
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
            <span className="rotulo">Tu nombre {opcional}</span>
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
          <ElegirUna
            rotulo="¿Has venido antes al Club de la Montaña?"
            opciones={VINO_ANTES}
            valor={vinoAntes}
            cambiar={setVinoAntes}
          />
          <ElegirUna rotulo="¿Vendrías con amigos?" opciones={CON_AMIGOS} valor={conAmigos} cambiar={setConAmigos} />
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

      <fieldset className="space-y-5 rounded-2xl bg-white p-6">
        <legend className="float-left mb-4 w-full text-lg font-semibold">Para terminar</legend>
        <label className="clear-both block">
          <span className="rotulo">¿Qué no te gustaría que pasara en el grupo?</span>
          <textarea
            className="campo min-h-24"
            maxLength={1000}
            placeholder="Algo que te daría lata o vergüenza, o que no te gusta de otras actividades…"
            value={noMeGustaria}
            onChange={(e) => setNoMeGustaria(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="rotulo">¿Qué nombre le pondrías al grupo?</span>
          <input
            className="campo"
            maxLength={80}
            placeholder="Tu idea de nombre"
            value={nombreGrupo}
            onChange={(e) => setNombreGrupo(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="rotulo">¿Algo más que quieras contarnos?</span>
          <textarea
            className="campo min-h-24"
            maxLength={2000}
            placeholder="Ideas, lugares a los que te gustaría ir, lo que se te ocurra…"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="rotulo">Correo o teléfono de tu mamá, papá o apoderado {opcional}</span>
          <input
            className="campo"
            maxLength={120}
            placeholder="Para avisarles cuando parta el grupo"
            value={contactoApoderado}
            onChange={(e) => setContactoApoderado(e.target.value)}
          />
        </label>
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
