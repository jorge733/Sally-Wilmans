"use client";

export function BotonImprimir() {
  return (
    <button onClick={() => window.print()} className="btn bg-marca px-4 py-2 text-sm text-white hover:bg-marca/90">
      Imprimir lista
    </button>
  );
}
