export type EstadoSalida = "publicada" | "borrador" | "cerrada";

export interface Salida {
  id: string;
  titulo: string;
  /** YYYY-MM-DD (hora de Chile) */
  fecha: string;
  /** Último día, para actividades de varios días (ej. Club de Verano) */
  fechaFin?: string | null;
  /** HH:mm */
  horaInicio: string;
  horaFin: string;
  lugar: string;
  puntoEncuentro: string;
  edadMin: number;
  edadMax: number;
  /** Precio por niño en CLP */
  precio: number;
  cupos: number;
  cuposTomados: number;
  /**
   * Si tiene semanas, la familia elige semanas completas (Club de Verano) y cada una
   * tiene su precio y sus cupos. En ese caso `precio` es el menor precio, `cupos` y
   * `cuposTomados` suman los de todas las semanas, y `fecha`/`fechaFin` van de la
   * primera a la última semana.
   */
  semanas: Semana[];
  descripcion: string;
  queLlevar: string[];
  /** Fotos de la salida, en orden. La primera es la portada. */
  fotos: FotoSalida[];
  /** Copia de la portada (fotos[0]), para lecturas rápidas */
  fotoUrl: string | null;
  fotoPath: string | null;
  estado: EstadoSalida;
  creadoEn: number;
  actualizadoEn: number;
}

export interface Semana {
  /** Id estable: no cambia si se editan las fechas */
  id: string;
  /** YYYY-MM-DD */
  inicio: string;
  fin: string;
  /** Precio por niño de la semana completa, en CLP */
  precio: number;
  cupos: number;
  cuposTomados: number;
}

/** Copia de la semana al momento de inscribir (fechas y precio pagado). */
export type SemanaInscrita = Pick<Semana, "id" | "inicio" | "fin" | "precio">;

export interface FotoSalida {
  url: string;
  path: string;
  /** Descripción breve (texto alternativo y pie de foto) */
  alt: string;
}

export type EstadoInscripcion = "pendiente" | "pagada" | "rechazada" | "expirada" | "anulada";

export interface Nino {
  nombre: string;
  edad: number;
  salud: string;
}

export interface Inscripcion {
  id: string;
  salidaId: string;
  salidaTitulo: string;
  salidaFecha: string;
  apoderado: {
    nombre: string;
    rut: string;
    email: string;
    telefono: string;
  };
  emergencia: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
  ninos: Nino[];
  /** Semanas elegidas, en salidas por semanas. Todos los niños van a las mismas. */
  semanas?: SemanaInscrita[];
  autorizacion: {
    aceptada: boolean;
    texto: string;
    fecha: number;
  };
  cantidad: number;
  /** Por niño; en salidas por semanas, la suma de las semanas elegidas */
  precioUnitario: number;
  total: number;
  estado: EstadoInscripcion;
  /** true si el cupo está descontado de la salida */
  cupoReservado: boolean;
  /** true si se pagó después de que se liberó el cupo y ya no había espacio */
  sobrecupo: boolean;
  /** Datos del pago en Flow */
  flow: {
    token: string | null;
    flowOrder: number | null;
    url: string | null;
    /** 1 pendiente · 2 pagado · 3 rechazado · 4 anulado */
    status: number | null;
  };
  avisosEnviados: boolean;
  creadoEn: number;
  expiraEn: number;
  pagadoEn: number | null;
}

export interface AjustesSitio {
  whatsapp: string;
  email: string;
  instagram: string;
  textoAutorizacion: string;
}

export interface FotoGaleria {
  id: string;
  url: string;
  path: string;
  alt: string;
  orden: number;
  creadoEn: number;
}
