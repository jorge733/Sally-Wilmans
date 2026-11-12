"use client";

import { useActionState, useState } from "react";
import { clp } from "@/lib/format";
import type { Salida } from "@/lib/types";
import { guardarSalida } from "../acciones";
import { EditorSemanas, type FilaSemana } from "./EditorSemanas";

const VACIA: Partial<Salida> = {
  edadMin: 5,
  edadMax: 12,
  horaInicio: "08:45",
  horaFin: "13:00",
  cupos: 20,
  estado: "publicada",
  queLlevar: [],
};

export function FormularioSalida({ salida }: { salida?: Salida }) {
  const s = salida ?? VACIA;
  const [estado, accion, guardando] = useActionState(guardarSalida, null);
  const [varios, setVarios] = useState(Boolean(s.fechaFin));
  const [precio, setPrecio] = useState(String(s.precio ?? ""));
  const [cupos, setCupos] = useState(String(s.cupos ?? ""));
  const [desde, setDesde] = useState(s.fecha ?? "");
  const [hasta, setHasta] = useState(s.fechaFin ?? "");
  const [porSem, setPorSem] = useState(Boolean(s.semanas?.length));
  const [precioDia, setPrecioDia] = useState(s.precioDia ? String(s.precioDia) : "");
  const [semanas, setSemanas] = useState<FilaSemana[]>(
    (s.semanas ?? []).map((w) => ({ ...w, precio: String(w.precio), cupos: String(w.cupos) })),
  );
  const conSemanas = varios && porSem;
  const jsonSemanas = conSemanas
    ? JSON.stringify(
        semanas.map(({ id, inicio, fin, precio, cupos }) => ({ id, inicio, fin, precio: Number(precio), cupos: Number(cupos) })),
      )
    : "";

  return (
    <form action={accion} className="space-y-6">
      {salida && <input type="hidden" name="id" value={salida.id} />}

      <section className="space-y-4 rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold">La salida</h2>
        <label className="block">
          <span className="rotulo">Nombre</span>
          <input
            name="titulo"
            required
            defaultValue={s.titulo}
            placeholder="Ej.: Primavera en Quebrada de Macul"
            className="campo"
          />
        </label>
        <label className="block">
          <span className="rotulo">Descripción</span>
          <textarea
            name="descripcion"
            defaultValue={s.descripcion}
            rows={4}
            placeholder="Qué van a hacer en la salida"
            className="campo"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="rotulo">Lugar</span>
            <input name="lugar" required defaultValue={s.lugar} placeholder="Parque Aguas de Ramón, La Reina" className="campo" />
          </label>
          <label className="block">
            <span className="rotulo">Punto de encuentro</span>
            <input name="puntoEncuentro" defaultValue={s.puntoEncuentro} className="campo" />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold">Fecha y horario</h2>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={varios}
            disabled={Boolean(salida?.semanas.some((w) => w.cuposTomados > 0))}
            onChange={(e) => setVarios(e.target.checked)}
            className="size-4 accent-acento"
          />
          Dura varios días (por ejemplo, una semana del Club de Verano)
        </label>
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="block">
            <span className="rotulo">{varios ? "Desde" : "Fecha"}</span>
            <input name="fecha" type="date" required value={desde} onChange={(e) => setDesde(e.target.value)} className="campo" />
          </label>
          {varios ? (
            <label className="block">
              <span className="rotulo">Hasta</span>
              <input
                name="fechaFin"
                type="date"
                required
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="campo"
              />
            </label>
          ) : (
            <input type="hidden" name="fechaFin" value="" />
          )}
          <label className="block">
            <span className="rotulo">Hora inicio</span>
            <input name="horaInicio" type="time" required defaultValue={s.horaInicio} className="campo" />
          </label>
          <label className="block">
            <span className="rotulo">Hora término</span>
            <input name="horaFin" type="time" required defaultValue={s.horaFin} className="campo" />
          </label>
        </div>
      </section>

      {varios && (
        <section className="space-y-4 rounded-2xl bg-white p-6">
          <h2 className="text-lg font-semibold">Inscripción por semanas</h2>
          <label className="flex items-start gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="porSemanas"
              value="1"
              checked={porSem}
              disabled={Boolean(salida?.semanas.some((w) => w.cuposTomados > 0))}
              onChange={(e) => setPorSem(e.target.checked)}
              className="mt-0.5 size-4 accent-acento"
            />
            <span>
              Las familias eligen qué semanas toman
              <span className="block font-normal text-gris">
                Cada semana tiene su propio precio y cupos (por día). Las fechas, el precio «desde» y los cupos totales
                de la salida salen de las semanas.
              </span>
            </span>
          </label>
          {conSemanas && (
            <label className="block max-w-xs">
              <span className="rotulo">Precio por día suelto (CLP, opcional)</span>
              <input
                name="precioDia"
                type="number"
                min={0}
                step={500}
                value={precioDia}
                onChange={(e) => setPrecioDia(e.target.value)}
                className="campo"
              />
              <span className="mt-1 block text-xs text-gris">
                {precioDia && Number(precioDia) > 0
                  ? `${clp(Number(precioDia))} por día. Las familias pueden elegir días sueltos o semanas completas; nunca pagan más que el precio de la semana.`
                  : "Déjalo vacío si solo se inscriben semanas completas."}
              </span>
            </label>
          )}
          {conSemanas && (
            <EditorSemanas
              filas={semanas}
              cambiar={setSemanas}
              desde={desde}
              hasta={hasta}
              precioBase={precio}
              cuposBase={cupos}
            />
          )}
        </section>
      )}
      <input type="hidden" name="semanas" value={jsonSemanas} />

      <section className="space-y-4 rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold">{conSemanas && semanas.length ? "Edades" : "Edades, cupos y precio"}</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="block">
            <span className="rotulo">Edad desde</span>
            <input name="edadMin" type="number" min={1} max={18} required defaultValue={s.edadMin} className="campo" />
          </label>
          <label className="block">
            <span className="rotulo">Edad hasta</span>
            <input name="edadMax" type="number" min={1} max={18} required defaultValue={s.edadMax} className="campo" />
          </label>
          {conSemanas && semanas.length ? (
            <>
              {/* El servidor los recalcula desde las semanas */}
              <input type="hidden" name="cupos" value="1" />
              <input type="hidden" name="precio" value="0" />
            </>
          ) : (
          <>
          <label className="block">
            <span className="rotulo">{conSemanas ? "Cupos por semana" : "Cupos"}</span>
            <input
              name="cupos"
              type="number"
              min={Math.max(1, s.cuposTomados ?? 0)}
              required
              value={cupos}
              onChange={(e) => setCupos(e.target.value)}
              className="campo"
            />
            {salida && salida.cuposTomados > 0 && (
              <span className="mt-1 block text-xs text-gris">{salida.cuposTomados} ya tomados</span>
            )}
          </label>
          <label className="block">
            <span className="rotulo">{conSemanas ? "Precio por semana (CLP)" : "Precio por niño (CLP)"}</span>
            <input
              name="precio"
              type="number"
              min={0}
              step={500}
              required
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="campo"
            />
            {precio && <span className="mt-1 block text-xs text-gris">{clp(Number(precio))}</span>}
          </label>
          </>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold">Qué llevar</h2>
        <p className="text-sm text-gris">Una cosa por línea. Se muestra en el sitio y en el comprobante que recibe el apoderado.</p>
        <textarea
          name="queLlevar"
          rows={7}
          defaultValue={s.queLlevar?.join("\n")}
          placeholder={"Mochila pequeña\nBotella con agua\nColación saludable"}
          className="campo font-mono text-sm"
        />
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold">Estado</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["publicada", "Publicada", "Se ve en el sitio y recibe inscripciones."],
            ["borrador", "Borrador", "No se ve en el sitio."],
            ["cerrada", "Cerrada", "Se ve en el sitio, pero no recibe inscripciones."],
          ].map(([valor, titulo, texto]) => (
            <label
              key={valor}
              className="flex cursor-pointer gap-3 rounded-xl border border-linea p-4 has-[:checked]:border-marca has-[:checked]:bg-crema"
            >
              <input type="radio" name="estado" value={valor} defaultChecked={s.estado === valor} className="mt-1 accent-marca" />
              <span>
                <span className="block font-semibold">{titulo}</span>
                <span className="text-sm text-gris">{texto}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-4 border-t border-linea bg-crema/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border-0 sm:bg-transparent sm:px-0">
        {estado?.error && (
          <p role="alert" className="mr-auto rounded-xl bg-acento/10 px-4 py-2 text-sm font-medium text-acento">
            {estado.error}
          </p>
        )}
        {estado?.ok && <p className="mr-auto rounded-xl bg-bosque/15 px-4 py-2 text-sm font-medium text-bosque">{estado.ok}</p>}
        <button type="submit" disabled={guardando} className="btn btn-primario">
          {guardando ? "Guardando…" : salida ? "Guardar cambios" : "Crear salida"}
        </button>
      </div>
    </form>
  );
}
