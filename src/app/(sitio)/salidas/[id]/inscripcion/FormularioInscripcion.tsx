"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconoFlecha } from "@/components/Iconos";
import { clp, edades, fechaSalida, nombreNino, rutValido } from "@/lib/format";
import { diasSemana, libresDia, precioEleccion, textoSemanaInscrita } from "@/lib/salida-utils";
import { GRUPOS_SANGUINEOS, type Salida } from "@/lib/types";
import { iniciarInscripcion, simularPago, type DatosFicha } from "./acciones";

type NinoFicha = DatosFicha["ninos"][number];
import { SelectorSemanas } from "./SelectorSemanas";

/** "pago" solo se usa con el pago simulado de desarrollo; en el sitio real se va directo a Flow. */
type Paso = "ficha" | "pago";

const ninoVacio = (): NinoFicha => ({
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  rut: "",
  edad: 0,
  meses: 0,
  alergias: "",
  grupoSanguineo: "",
  salud: "",
});

export function FormularioInscripcion({
  salida,
  maxNinos: maxNinosSalida,
  diasAbiertos,
  textoAutorizacion,
}: {
  salida: Salida;
  maxNinos: number;
  /** Días (YYYY-MM-DD) que todavía reciben inscripciones (salidas por semanas) */
  diasAbiertos: string[];
  textoAutorizacion: string;
}) {
  const [paso, setPaso] = useState<Paso>("ficha");
  const [ninos, setNinos] = useState<NinoFicha[]>([ninoVacio()]);
  const [apoderado, setApoderado] = useState({ nombre: "", rut: "", email: "", telefono: "" });
  const [emergencia, setEmergencia] = useState({ nombre: "", telefono: "", relacion: "" });
  const [retiro, setRetiro] = useState({ nombre: "", telefono: "" });
  const [centroMedico, setCentroMedico] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [autoriza, setAutoriza] = useState(false);
  const [aceptaDevoluciones, setAceptaDevoluciones] = useState(false);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [inscripcionId, setInscripcionId] = useState("");
  const [elegidos, setElegidos] = useState<string[]>([]);
  const router = useRouter();

  const conSemanas = salida.semanas.length > 0;
  const conDias = conSemanas && Boolean(salida.precioDia);
  // Lo elegido en cada semana, en el orden del calendario.
  const eleccion = salida.semanas
    .map((w) => ({ w, dias: diasSemana(w).filter((f) => elegidos.includes(f)) }))
    .filter((x) => x.dias.length > 0);
  const precioNino = conSemanas
    ? eleccion.reduce((t, { w, dias }) => t + precioEleccion(w, dias.length, salida.precioDia), 0)
    : salida.precio;
  const total = precioNino * ninos.length;
  // No se pueden agregar más niños de los que caben en el día más lleno de los elegidos.
  const maxNinos = eleccion.length
    ? Math.min(maxNinosSalida, ...eleccion.flatMap(({ w, dias }) => dias.map((f) => libresDia(w, f))))
    : maxNinosSalida;
  const semanasCompletas = eleccion.filter(({ w, dias }) => dias.length === diasSemana(w).length).length;
  const diasSueltos = eleccion.reduce((t, { w, dias }) => t + (dias.length === diasSemana(w).length ? 0 : dias.length), 0);
  const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
  const detallePrecio = conSemanas
    ? eleccion.length === 0
      ? conDias
        ? "Elige al menos un día"
        : "Elige al menos una semana"
      : `${plural(ninos.length, "niño", "niños")} × ${[
          semanasCompletas ? plural(semanasCompletas, "semana", "semanas") : "",
          diasSueltos ? plural(diasSueltos, "día", "días") : "",
        ]
          .filter(Boolean)
          .join(" y ")}`
    : `${ninos.length} × ${clp(salida.precio)}`;
  const textoEleccion = eleccion
    .map(({ w, dias }) => textoSemanaInscrita({ ...w, dias }))
    .join(" · ");

  function cambiarNino(i: number, campo: keyof NinoFicha, valor: string) {
    setNinos((prev) =>
      prev.map((n, j) =>
        j === i ? { ...n, [campo]: campo === "edad" || campo === "meses" ? Number(valor) : valor } : n,
      ),
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (conSemanas && eleccion.length === 0) {
      setError(conDias ? "Elige al menos un día del club." : "Elige al menos una semana del club.");
      document.getElementById("semanas")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const rutMalo = ninos.find((n) => !rutValido(n.rut ?? ""));
    if (rutMalo) {
      setError(`Revisa el RUT de ${nombreNino(rutMalo) || "uno de los niños"}.`);
      return;
    }
    const fueraDeRango = ninos.find((n) => n.edad < salida.edadMin || n.edad > salida.edadMax);
    if (fueraDeRango) {
      setError(
        `${nombreNino(fueraDeRango) || "Uno de los niños"} no está en el rango de edad de esta salida (${edades(salida.edadMin, salida.edadMax)}).`,
      );
      return;
    }
    setError("");
    setProcesando(true);
    try {
      const r = await iniciarInscripcion({
        salidaId: salida.id,
        dias: elegidos,
        ninos,
        apoderado,
        emergencia,
        retiro,
        centroMedico,
        comentarios,
        autoriza,
        aceptaDevoluciones,
      });
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
                  {conSemanas && (
                    <span className="block text-gris">{textoEleccion}</span>
                  )}
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

      {conSemanas && (
        <fieldset id="semanas" className="scroll-mt-24 rounded-2xl bg-white p-6">
          <legend className="float-left mb-1 w-full text-lg font-semibold">
            {conDias ? "¿Qué días vienen?" : "¿Qué semanas vienen?"}
          </legend>
          <p className="clear-both mb-5 text-sm text-gris">
            {conDias ? (
              <>
                Toca cada día que quieras tomar, o «Semana completa». Cada día cuesta {clp(salida.precioDia!)} por niño
                y la semana completa sale más conveniente.
              </>
            ) : (
              "Toca cada semana que quieras tomar. Se inscriben completas y el precio es por niño."
            )}
            {ninos.length > 1 && (conDias ? " Todos los niños van los mismos días." : " Todos los niños van a las mismas semanas.")}
          </p>
          <SelectorSemanas
            semanas={salida.semanas}
            precioDia={conDias ? salida.precioDia : null}
            abiertos={diasAbiertos}
            elegidos={elegidos}
            cambiar={(dias) => {
              setElegidos(dias);
              setError("");
            }}
            ninos={ninos.length}
          />
        </fieldset>
      )}

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
            <div className="grid gap-4 sm:grid-cols-3">
              <label>
                <span className="rotulo">Nombres</span>
                <input
                  required
                  className="campo"
                  value={n.nombre}
                  onChange={(e) => cambiarNino(i, "nombre", e.target.value)}
                />
              </label>
              <label>
                <span className="rotulo">Primer apellido</span>
                <input
                  required
                  className="campo"
                  value={n.apellidoPaterno}
                  onChange={(e) => cambiarNino(i, "apellidoPaterno", e.target.value)}
                />
              </label>
              <label>
                <span className="rotulo">Segundo apellido</span>
                <input
                  required
                  className="campo"
                  value={n.apellidoMaterno}
                  onChange={(e) => cambiarNino(i, "apellidoMaterno", e.target.value)}
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_110px_130px]">
              <label>
                <span className="rotulo">RUT</span>
                <input
                  required
                  className="campo"
                  placeholder="12345678-9"
                  value={n.rut}
                  onChange={(e) => cambiarNino(i, "rut", e.target.value)}
                />
              </label>
              <label>
                <span className="rotulo">Edad (años)</span>
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
              <label>
                <span className="rotulo">y meses</span>
                <select
                  className="campo"
                  value={n.meses ?? 0}
                  onChange={(e) => cambiarNino(i, "meses", e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, m) => (
                    <option key={m} value={m}>
                      {m} {m === 1 ? "mes" : "meses"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <label>
                <span className="rotulo">¿Alguna alergia?</span>
                <input
                  required
                  className="campo"
                  placeholder="Ej.: picadura de abeja, maní. Si no tiene, «ninguna»."
                  value={n.alergias}
                  onChange={(e) => cambiarNino(i, "alergias", e.target.value)}
                />
              </label>
              <label>
                <span className="rotulo">Grupo sanguíneo</span>
                <select
                  className="campo"
                  value={n.grupoSanguineo ?? ""}
                  onChange={(e) => cambiarNino(i, "grupoSanguineo", e.target.value)}
                >
                  <option value="">No lo sé</option>
                  {GRUPOS_SANGUINEOS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="rotulo">¿Alguna enfermedad, diagnóstico o condición que debamos saber?</span>
              <textarea
                className="campo min-h-20"
                placeholder="Ej.: asma (usa inhalador), se marea en el auto. Si no, escribe «ninguna»."
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
        <legend className="float-left mb-4 w-full text-lg font-semibold">Retiro y emergencias</legend>
        <div className="clear-both space-y-6">
          <div>
            <h3 className="text-sm font-semibold">
              ¿Quién retira {ninos.length === 1 ? "al niño o niña" : "a los niños"}?
            </h3>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="rotulo">Nombre</span>
                <input
                  required
                  className="campo"
                  value={retiro.nombre}
                  onChange={(e) => setRetiro({ ...retiro, nombre: e.target.value })}
                />
              </label>
              <label>
                <span className="rotulo">Teléfono</span>
                <input
                  required
                  type="tel"
                  className="campo"
                  placeholder="+56 9 1234 5678"
                  value={retiro.telefono}
                  onChange={(e) => setRetiro({ ...retiro, telefono: e.target.value })}
                />
              </label>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Contacto en caso de emergencia</h3>
            <p className="text-sm text-gris">Una persona distinta al apoderado, por si no logramos ubicarte.</p>
            <div className="mt-2 grid gap-4 sm:grid-cols-3">
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
          </div>
          <label className="block">
            <span className="rotulo">En caso de accidente, ¿a qué centro médico los llevamos?</span>
            <input
              required
              className="campo"
              placeholder="Ej.: Clínica Alemana de Vitacura"
              value={centroMedico}
              onChange={(e) => setCentroMedico(e.target.value)}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl bg-white p-6">
        <legend className="float-left mb-1 w-full text-lg font-semibold">¿Algo más que quieras contarnos?</legend>
        <p className="clear-both mb-3 text-sm text-gris">Opcional. Cómo es, qué le gusta, si es su primera vez en el club…</p>
        <textarea
          className="campo min-h-24"
          maxLength={2000}
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
        />
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
        <label className="mt-3 flex items-start gap-3">
          <input
            type="checkbox"
            required
            checked={aceptaDevoluciones}
            onChange={(e) => setAceptaDevoluciones(e.target.checked)}
            className="mt-1 size-5 accent-acento"
          />
          <span className="text-sm font-medium">
            Leí y acepto la{" "}
            <a href="/devoluciones" target="_blank" rel="noopener" className="text-marca underline underline-offset-2">
              política de cambios y devoluciones
            </a>
            .
          </span>
        </label>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-xl bg-acento/10 px-4 py-3 text-sm font-medium text-acento">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-4 border-t border-linea bg-white/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border-0 sm:px-6">
        <div>
          <div className="text-xs text-gris">{detallePrecio}</div>
          <div className="text-2xl font-bold">{clp(total)}</div>
        </div>
        <button type="submit" disabled={procesando} className="btn btn-primario disabled:opacity-70">
          {procesando ? "Preparando el pago…" : <>Ir a pagar <IconoFlecha /></>}
        </button>
      </div>
    </form>
  );
}
