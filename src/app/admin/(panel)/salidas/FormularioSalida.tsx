"use client";

import { useActionState, useState } from "react";
import { clp } from "@/lib/format";
import type { Salida } from "@/lib/types";
import { guardarSalida } from "../acciones";

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
          <input type="checkbox" checked={varios} onChange={(e) => setVarios(e.target.checked)} className="size-4 accent-acento" />
          Dura varios días (por ejemplo, una semana del Club de Verano)
        </label>
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="block">
            <span className="rotulo">{varios ? "Desde" : "Fecha"}</span>
            <input name="fecha" type="date" required defaultValue={s.fecha} className="campo" />
          </label>
          {varios ? (
            <label className="block">
              <span className="rotulo">Hasta</span>
              <input name="fechaFin" type="date" required defaultValue={s.fechaFin ?? ""} className="campo" />
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

      <section className="space-y-4 rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold">Edades, cupos y precio</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="block">
            <span className="rotulo">Edad desde</span>
            <input name="edadMin" type="number" min={1} max={18} required defaultValue={s.edadMin} className="campo" />
          </label>
          <label className="block">
            <span className="rotulo">Edad hasta</span>
            <input name="edadMax" type="number" min={1} max={18} required defaultValue={s.edadMax} className="campo" />
          </label>
          <label className="block">
            <span className="rotulo">Cupos</span>
            <input
              name="cupos"
              type="number"
              min={Math.max(1, s.cuposTomados ?? 0)}
              required
              defaultValue={s.cupos}
              className="campo"
            />
            {salida && salida.cuposTomados > 0 && (
              <span className="mt-1 block text-xs text-gris">{salida.cuposTomados} ya tomados</span>
            )}
          </label>
          <label className="block">
            <span className="rotulo">Precio por niño (CLP)</span>
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
