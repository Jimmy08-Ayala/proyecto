export const CONFIG = {
  ESPERA_MINIMA_MS: 2000, // milisegundos de espera antes de la señal
  ESPERA_MAXIMA_MS: 3000, // milisegundos de espera antes de la señal
} as const

export type ColorJuego = 'rojo' | 'verde' | 'azul' | 'amarillo'
export type FaseJuego = 'espera' | 'senal' | 'final'
export type ResultadoJuego = 'reaccion' | 'falso inicio' | null

export type EstadoJuego = {
  fase: FaseJuego
  color: ColorJuego
  mensaje: string
  instruccion: string
  demoraEsperaMs: number
  instanteSenalMs: number | null
  tiempoReaccionMs: number | null
  mejorTiempoMs: number | null
  nuevoRecord: boolean
  resultado: ResultadoJuego
  generadorAzar: () => number
}

export function crearGeneradorAzar(semilla: string | number): () => number {
  const texto = String(semilla)
  let hash = 2166136261

  for (let indice = 0; indice < texto.length; indice += 1) {
    hash ^= texto.charCodeAt(indice)
    hash = Math.imul(hash, 16777619)
  }

  let estado = hash >>> 0

  return () => {
    estado += 0x6d2b79f5
    let valor = estado
    valor = Math.imul(valor ^ (valor >>> 15), valor | 1)
    valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61)
    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296
  }
}

export function crearEstado(
  semilla: string | number,
  mejorTiempoMs: number | null = null,
): EstadoJuego {
  const generadorAzar = crearGeneradorAzar(semilla)
  const mejorTiempoValido =
    mejorTiempoMs !== null &&
    Number.isFinite(mejorTiempoMs) &&
    mejorTiempoMs >= 0
      ? mejorTiempoMs
      : null

  return {
    fase: 'espera',
    color: 'rojo',
    mensaje: 'Esperá al verde...',
    instruccion: 'Prepárate, no toques todavía.',
    demoraEsperaMs: obtenerDemoraEspera(generadorAzar),
    instanteSenalMs: null,
    tiempoReaccionMs: null,
    mejorTiempoMs: mejorTiempoValido,
    nuevoRecord: false,
    resultado: null,
    generadorAzar,
  }
}

export function mostrarSenal(
  estado: EstadoJuego,
  instanteMs: number,
): boolean {
  if (estado.fase !== 'espera' || !Number.isFinite(instanteMs)) {
    return false
  }

  estado.fase = 'senal'
  estado.color = 'verde'
  estado.mensaje = '¡Ya! Toca ahora'
  estado.instruccion = 'Toca la pantalla o presiona Espacio.'
  estado.instanteSenalMs = instanteMs
  return true
}

export function tocar(estado: EstadoJuego, instanteMs: number): boolean {
  if (!Number.isFinite(instanteMs)) {
    return false
  }

  if (estado.fase === 'final') {
    return reintentar(estado)
  }

  if (estado.fase === 'espera') {
    estado.fase = 'final'
    estado.color = 'amarillo'
    estado.mensaje = '¡Muy rápido! Esperá al cambio de color'
    estado.instruccion = 'Tocá para reintentar.'
    estado.instanteSenalMs = null
    estado.tiempoReaccionMs = null
    estado.nuevoRecord = false
    estado.resultado = 'falso inicio'
    return true
  }

  if (estado.instanteSenalMs === null || instanteMs < estado.instanteSenalMs) {
    return false
  }

  const tiempoReaccionMs = Math.round(instanteMs - estado.instanteSenalMs)
  estado.fase = 'final'
  estado.color = 'azul'
  estado.mensaje = `${tiempoReaccionMs} ms`
  estado.tiempoReaccionMs = tiempoReaccionMs
  estado.nuevoRecord =
    estado.mejorTiempoMs === null || tiempoReaccionMs < estado.mejorTiempoMs
  if (estado.nuevoRecord) {
    estado.mejorTiempoMs = tiempoReaccionMs
    estado.instruccion = '¡Nuevo Récord! Tocá para reintentar.'
  } else {
    estado.instruccion = 'Tocá para reintentar.'
  }
  estado.resultado = 'reaccion'
  return true
}

export function reintentar(estado: EstadoJuego): boolean {
  if (estado.fase !== 'final') {
    return false
  }

  estado.fase = 'espera'
  estado.color = 'rojo'
  estado.mensaje = 'Esperá al verde...'
  estado.instruccion = 'Prepárate, no toques todavía.'
  estado.demoraEsperaMs = obtenerDemoraEspera(estado.generadorAzar)
  estado.instanteSenalMs = null
  estado.tiempoReaccionMs = null
  estado.nuevoRecord = false
  estado.resultado = null
  return true
}

export function textoMejorTiempo(estado: EstadoJuego): string {
  return estado.mejorTiempoMs === null
    ? '—'
    : `${estado.mejorTiempoMs} ms`
}

function obtenerDemoraEspera(generadorAzar: () => number): number {
  const rango =
    CONFIG.ESPERA_MAXIMA_MS - CONFIG.ESPERA_MINIMA_MS + 1
  return CONFIG.ESPERA_MINIMA_MS + Math.floor(generadorAzar() * rango)
}
