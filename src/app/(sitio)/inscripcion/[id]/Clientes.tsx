"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { reintentarPago, simularPago } from "../../salidas/[id]/inscripcion/acciones";

/** Mientras Flow confirma el pago, vuelve a consultar la página cada pocos segundos. */
export function Refrescar({ segundos = 4 }: { segundos?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), segundos * 1000);
    return () => clearInterval(t);
  }, [router, segundos]);
  return null;
}

export function BotonReintentar({ inscripcionId }: { inscripcionId: string }) {
  const router = useRouter();
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  async function reintentar() {
    setProcesando(true);
    setError("");
    const r = await reintentarPago(inscripcionId).catch(() => null);
    if (r?.ok && r.urlPago) {
      window.location.assign(r.urlPago);
      return;
    }
    if (r?.ok) {
      // Pago simulado en desarrollo
      await simularPago(inscripcionId);
      router.refresh();
    } else {
      setError(r?.error ?? "No pudimos conectar con el sistema de pago. Intenta de nuevo.");
    }
    setProcesando(false);
  }

  return (
    <>
      <button onClick={reintentar} disabled={procesando} className="btn btn-primario disabled:opacity-70">
        {procesando ? "Preparando el pago…" : "Intentar pagar de nuevo"}
      </button>
      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-acento">
          {error}
        </p>
      )}
    </>
  );
}

export function BotonImprimir() {
  return (
    <button onClick={() => window.print()} className="btn btn-secundario text-marca">
      Imprimir comprobante
    </button>
  );
}
