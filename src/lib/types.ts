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
  descripcion: string;
  queLlevar: string[];
  fotoUrl: string | null;
  fotoPath: string | null;
  estado: EstadoSalida;
  creadoEn: number;
  actualizadoEn: number;
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
  autorizacion: {
    aceptada: boolean;
    texto: string;
    fecha: number;
  };
  cantidad: number;
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
