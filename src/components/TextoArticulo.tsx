import { Fragment } from "react";
import { bloquesArticulo, trozosLinea } from "@/lib/blog";

/** Una línea con negritas, cursivas, enlaces y saltos de línea. */
function Linea({ texto }: { texto: string }) {
  return texto.split("\n").map((parte, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {trozosLinea(parte).map((t, j) => {
        if (t.tipo === "negrita")
          return (
            <strong key={j} className="font-semibold text-tinta">
              {t.texto}
            </strong>
          );
        if (t.tipo === "cursiva") return <em key={j}>{t.texto}</em>;
        if (t.tipo === "enlace") {
          const externo = /^https?:/.test(t.url);
          return (
            <a
              key={j}
              href={t.url}
              {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="font-medium text-acento underline underline-offset-4 hover:text-acento-oscuro"
            >
              {t.texto}
            </a>
          );
        }
        return <Fragment key={j}>{t.texto}</Fragment>;
      })}
    </Fragment>
  ));
}

/** El cuerpo de un artículo del blog, tal como lo escribe Sally en el panel. */
export function TextoArticulo({ cuerpo }: { cuerpo: string }) {
  return (
    <div className="space-y-5 text-[1.07rem] leading-relaxed text-gris">
      {bloquesArticulo(cuerpo).map((b, i) => {
        switch (b.tipo) {
          case "h2":
            return (
              <h2 key={i} className="pt-4 text-2xl font-semibold text-marca">
                <Linea texto={b.texto} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-2 text-xl font-semibold text-marca">
                <Linea texto={b.texto} />
              </h3>
            );
          case "ul":
          case "ol": {
            const Lista = b.tipo;
            return (
              <Lista key={i} className={`space-y-2 pl-6 ${b.tipo === "ul" ? "list-disc" : "list-decimal"} marker:text-acento`}>
                {b.items.map((item, j) => (
                  <li key={j}>
                    <Linea texto={item} />
                  </li>
                ))}
              </Lista>
            );
          }
          case "cita":
            return (
              <blockquote key={i} className="border-l-4 border-acento/60 pl-5 text-lg text-tinta italic">
                <Linea texto={b.texto} />
              </blockquote>
            );
          case "foto":
            return (
              <figure key={i} className="py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.url} alt={b.alt} loading="lazy" className="w-full rounded-2xl bg-crema" />
                {b.alt && <figcaption className="mt-2 text-center text-sm text-gris">{b.alt}</figcaption>}
              </figure>
            );
          default:
            return (
              <p key={i}>
                <Linea texto={b.texto} />
              </p>
            );
        }
      })}
    </div>
  );
}
