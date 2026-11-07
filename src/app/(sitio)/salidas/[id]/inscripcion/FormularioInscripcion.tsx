"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconoFlecha } from "@/components/Iconos";
import { clp, edades, fechaSalida } from "@/lib/format";
import type { Nino, Salida } from "@/lib/types";
import { iniciarInscripcion, simularPago } from "./acciones";

/** "pago" solo se usa con el pago simulado de desarrollo; en el sitio real se va directo a Flow. */
type Paso = "ficha" | "pago";

const ninoVacio = (): Nino => ({ nombre: "", edad: 0, salud: "" });

export function FormularioInscripcion({
  salida,
  maxNinos,
  textoAutorizacion,
}: {
  salida: Salida;
  maxNinos: number;
  textoAutorizacion: string;
}) {
  const [paso, setPaso] = useState<Paso>("ficha");
  const [ninos, setNinos] = useState<Nino[]>([ninoVacio()]);
  const [apoderado, setApoderado] = useState({ nombre: "", rut: "", email: "", telefono: "" });
  const [emergencia, setEmergencia] = useState({ nombre: "", telefono: "", relacion: "" });
  const [autoriza, setAutoriza] = useState(false);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [inscripcionId, setInscripcionId] = useState("");
  const router = useRouter();

  const total = salida.precio * ninos.length;

  function cambiarNino(i: number, campo: keyof Nino, valor: string) {
    setNinos((prev) =>
      prev.map((n, j) => (j === i ? { ...n, [campo]: campo === "edad" ? Number(valor) : valor } : n)),
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const fueraDeRango = ninos.find((n) => n.edad < salida.edadMin || n.edad > salida.edadMax);
    if (fueraDeRango) {
      setError(
        `${fueraDeRango.nombre || "Uno de los niños"} no está en el rango de edad de esta salida (${edades(salida.edadMin, salida.edadMax)}).`,
      );
      return;
    }
    setError("");
    setProcesando(true);
    try {
      const r = await iniciarInscripcion({ salidaId: salida.id, ninos, apoderado, emergencia, autoriza });
      if (!r.ok) {
        setError(r.error);
        setProcesando(false);
        return;
      }
      if (r.urlPago) {
        // Se queda en "procesando" mientras el navegador abre Flow.
        window.location.assign(r.urlPago);
        return;
      }
      setInscripcionId(r.inscripcionId);
      setPaso("pago");
      setProcesando(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("No pudimos enviar la inscripción. Revisa tu conexión e intenta de nuevo.");
      setProcesando(false);
    }
  }

  async function pagarSimulado() {
    setProcesando(true);
    const r = await simularPago(inscripcionId).catch(() => ({ ok: false }));
    if (r.ok) router.push(`/inscripcion/${inscripcionId}`);
    else {
      setError("No se pudo simular el pago.");
      setProcesando(false);
    }
  }

  const resumen = (
    <div className="rounded-2xl bg-marca p-5 text-white">
      <div className="text-xs font-semibold tracking-wider text-marca-claro uppercase">Salida</div>
      <div className="mt-1 font-serif text-xl font-semibold">{salida.titulo}</div>
      <div className="mt-1 text-sm text-marca-claro first-letter:uppercase">
        {fechaSalida(salida)} · {salida.horaInicio} a {salida.horaFin} h
      </div>
    </div>
  );

  if (paso === "pago") {
    return (
      <div className="mt-6 space-y-6">
        {resumen}
        <div className="overflow-hidden rounded-2xl border border-linea bg-white">
          <div className="flex items-center justify-between bg-marca px-6 py-4 text-white">
            <span className="font-semibold">Flow</span>
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold">Simulación</span>
          </div>
          <div className="space-y-5 p-6">
            <p className="text-sm text-gris">
              El pago está simulado (PAGO_SIMULADO=1). En el sitio real, aquí se abre Flow. El cupo ya quedó
              guardado por 30 minutos.
            </p>
            <div className="divide-y divide-linea rounded-xl border border-linea">
              <div className="flex justify-between p-4 text-sm">
                <span>
                  {salida.titulo} × {ninos.length}
                </span>
                <span>{clp(total)}</span>
              </div>
              <div className="flex justify-between p-4 font-bold">
                <span>Total</span>
                <span>{clp(total)}</span>
              </div>
            </div>
            <button
              onClick={pagarSimulado}
              disabled={procesando}
              className="btn btn-primario w-full disabled:opacity-70"
            >
              {procesando ? "Procesando pago…" : `Pagar ${clp(total)}`}
            </button>
            {error && (
              <p role="alert" className="rounded-xl bg-acento/10 px-4 py-3 text-sm font-medium text-acento">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-6 space-y-6">
      {resumen}
      <h1 className="text-3xl font-semibold text-marca">Ficha de inscripción</h1>

      <fieldset className="space-y-4 rounded-2xl bg-white p-6">
        <legend className="float-left mb-2 w-full text-lg font-semibold">
          {ninos.length === 1 ? "Datos del niño o niña" : "Datos de los niños"}
        </legend>
        {ninos.map((n, i) => (
          <div key={i} className="clear-both space-y-4 rounded-xl border border-linea p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-acento">Niño {i + 1}</span>
              {ninos.length > 1 && (
                <button
                  type="button"
                  onClick={() => setNinos((p) => p.filter((_, j) => j !== i))}
                  className="text-sm text-gris hover:text-acento"
                >
                  Quitar
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <label>
                <span className="rotulo">Nombre completo</span>
                <input
                  required
                  className="campo"
                  value={n.nombre}
                  onChange={(e) => cambiarNino(i, "nombre", e.target.value)}
                />
              </label>
              <label>
                <span className="rotulo">Edad</span>
                <input
                  required
                  type="number"
                  min={1}
                  max={18}
                  className="campo"
                  value={n.edad || ""}
                  onChange={(e) => cambiarNino(i, "edad", e.target.value)}
                />
              </label>
            </div>
            <label className="block">
              <span className="rotulo">Alergias, enfermedades o cuidados de salud</span>
              <textarea
                className="campo min-h-20"
                placeholder="Ej.: alérgico a las abejas, usa inhalador. Si no tiene, escribe «ninguna»."
                required
                value={n.salud}
                onChange={(e) => cambiarNino(i, "salud", e.target.value)}
              />
            </label>
          </div>
        ))}
        {ninos.length < maxNinos && (
          <button
            type="button"
            onClick={() => setNinos((p) => [...p, ninoVacio()])}
            className="text-sm font-semibold text-bosque hover:underline"
          >
            + Agregar otro niño
          </button>
        )}
        <p className="text-xs text-gris">Edades de esta salida: {edades(salida.edadMin, salida.edadMax)}.</p>
      </fieldset>

      <fieldset className="rounded-2xl bg-white p-6">
        <legend className="float-left mb-4 w-full text-lg font-semibold">Datos del apoderado</legend>
        <div className="clear-both grid gap-4 sm:grid-cols-2">
          <label>
            <span className="rotulo">Nombre completo</span>
            <input
              required
              className="campo"
              autoComplete="name"
              value={apoderado.nombre}
              onChange={(e) => setApoderado({ ...apoderado, nombre: e.target.value })}
            />
          </label>
          <label>
            <span className="rotulo">RUT</span>
            <input
              required
              className="campo"
              placeholder="12.345.678-9"
              value={apoderado.rut}
              onChange={(e) => setApoderado({ ...apoderado, rut: e.target.value })}
            />
          </label>
          <label>
            <span className="rotulo">Correo</span>
            <input
              required
              type="email"
              className="campo"
              autoComplete="email"
              value={apoderado.email}
              onChange={(e) => setApoderado({ ...apoderado, email: e.target.value })}
            />
          </label>
          <label>
            <span className="rotulo">Teléfono</span>
            <input
              required
              type="tel"
              className="campo"
              autoComplete="tel"
              placeholder="+56 9 1234 5678"
              value={apoderado.telefono}
              onChange={(e) => setApoderado({ ...apoderado, telefono: e.target.value })}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl bg-white p-6">
        <legend className="float-left mb-1 w-full text-lg font-semibold">Contacto de emergencia</legend>
        <p className="clear-both mb-4 text-sm text-gris">Una persona distinta al apoderado, por si no logramos ubicarte.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className="rotulo">Nombre</span>
            <input
              required
              className="campo"
              value={emergencia.nombre}
              onChange={(e) => setEmergencia({ ...emergencia, nombre: e.target.value })}
            />
          </label>
          <label>
            <span className="rotulo">Teléfono</span>
            <input
              required
              type="tel"
              className="campo"
              value={emergencia.telefono}
              onChange={(e) => setEmergencia({ ...emergencia, telefono: e.target.value })}
            />
          </label>
          <label>
            <span className="rotulo">Relación</span>
            <input
              required
              className="campo"
              placeholder="Abuela, tío…"
              value={emergencia.relacion}
              onChange={(e) => setEmergencia({ ...emergencia, relacion: e.target.value })}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl bg-white p-6">
        <legend className="float-left mb-3 w-full text-lg font-semibold">Autorización del apoderado</legend>
        <p className="clear-both max-h-40 overflow-y-auto rounded-xl bg-crema p-4 text-sm leading-relaxed text-gris">
          {textoAutorizacion}
        </p>
        <label className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            required
            checked={autoriza}
            onChange={(e) => setAutoriza(e.target.checked)}
            className="mt-1 size-5 accent-acento"
          />
          <span className="text-sm font-medium">Leí y acepto la autorización.</span>
        </label>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-xl bg-acento/10 px-4 py-3 text-sm font-medium text-acento">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-4 border-t border-linea bg-white/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border-0 sm:px-6">
        <div>
          <div className="text-xs text-gris">
            {ninos.length} × {clp(salida.precio)}
          </div>
          <div className="text-2xl font-bold">{clp(total)}</div>
        </div>
        <button type="submit" disabled={procesando} className="btn btn-primario disabled:opacity-70">
          {procesando ? "Preparando el pago…" : <>Ir a pagar <IconoFlecha /></>}
        </button>
      </div>
    </form>
  );
}
