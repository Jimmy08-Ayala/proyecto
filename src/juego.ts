const CONFIG = {
  COLUMNAS: 5, // zonas por fila
  FILAS: 5, // filas del tablero
  FAMILIAS_MINIMAS: 1, // familias por zona
  FAMILIAS_MAXIMAS: 3, // familias por zona
  AGUA_INICIAL_MAXIMA: 3, // unidades de agua por zona
  ACCIONES_POR_TURNO: 3, // acciones por turno
  TURNOS_TOTALES: 8, // turnos por partida
  META_PORCENTAJE: 70, // porcentaje de familias que hay que salvar
  PORCENTAJE_COMPLETO: 100, // porcentaje que representa el total
  UMBRAL_INUNDACION: 6, // unidades de agua para inundar una zona
  LLUVIA_NORMAL: 1, // unidades de agua por turno en zonas normales
  LLUVIA_QUEBRADA: 2, // unidades de agua por turno en la quebrada
  DRENAJE_PROPIO: 3, // unidades de agua que se quitan a la zona drenada
  DRENAJE_VECINO: 1, // unidades de agua que se quitan a cada zona vecina
  ALCANCE_VECINO: 1, // casillas de distancia para considerar una zona vecina
} as const

export type Zona = {
  fila: number
  columna: number
  familias: number
  agua: number
  evacuada: boolean
  inundada: boolean
}

export type Estado = {
  zonas: Zona[]
  turno: number
  accionesRestantes: number
  familiasTotales: number
  familiasSalvadas: number
  familiasEnRiesgo: number
  familiasPerdidas: number
  porcentajeSalvado: number
  metaFamilias: number
  resultado: 'en curso' | 'ganada' | 'perdida'
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

export function crearEstado(semilla: string | number): Estado {
  const azar = crearGeneradorAzar(semilla)
  const zonas: Zona[] = []

  for (let fila = 1; fila <= CONFIG.FILAS; fila += 1) {
    for (let columna = 1; columna <= CONFIG.COLUMNAS; columna += 1) {
      zonas.push({
        fila,
        columna,
        familias:
          CONFIG.FAMILIAS_MINIMAS +
          Math.floor(
            azar() *
              (CONFIG.FAMILIAS_MAXIMAS - CONFIG.FAMILIAS_MINIMAS + 1),
          ),
        agua: Math.floor(azar() * (CONFIG.AGUA_INICIAL_MAXIMA + 1)),
        evacuada: false,
        inundada: false,
      })
    }
  }

  const familiasTotales = zonas.reduce(
    (total, zona) => total + zona.familias,
    0,
  )
  const estado: Estado = {
    zonas,
    turno: 1,
    accionesRestantes: CONFIG.ACCIONES_POR_TURNO,
    familiasTotales,
    familiasSalvadas: 0,
    familiasEnRiesgo: familiasTotales,
    familiasPerdidas: 0,
    porcentajeSalvado: 0,
    metaFamilias: Math.ceil(
      (familiasTotales * CONFIG.META_PORCENTAJE) /
        CONFIG.PORCENTAJE_COMPLETO,
    ),
    resultado: 'en curso',
  }

  return estado
}

export function avisar(estado: Estado, fila: number, columna: number): boolean {
  if (!puedeActuar(estado)) {
    return false
  }

  const zona = buscarZona(estado, fila, columna)
  if (!zona || zona.inundada || zona.evacuada) {
    return false
  }

  zona.evacuada = true
  completarAccion(estado)
  return true
}

export function drenar(
  estado: Estado,
  fila: number,
  columna: number,
): boolean {
  if (!puedeActuar(estado)) {
    return false
  }

  const zona = buscarZona(estado, fila, columna)
  if (!zona) {
    return false
  }

  for (const vecina of estado.zonas) {
    const diferenciaFila = Math.abs(vecina.fila - fila)
    const diferenciaColumna = Math.abs(vecina.columna - columna)

    if (diferenciaFila === 0 && diferenciaColumna === 0) {
      vecina.agua = Math.max(0, vecina.agua - CONFIG.DRENAJE_PROPIO)
    } else if (
      diferenciaFila <= CONFIG.ALCANCE_VECINO &&
      diferenciaColumna <= CONFIG.ALCANCE_VECINO
    ) {
      vecina.agua = Math.max(0, vecina.agua - CONFIG.DRENAJE_VECINO)
    }
  }

  completarAccion(estado)
  return true
}

function buscarZona(
  estado: Estado,
  fila: number,
  columna: number,
): Zona | undefined {
  return estado.zonas.find(
    (zona) => zona.fila === fila && zona.columna === columna,
  )
}

function puedeActuar(estado: Estado): boolean {
  return estado.resultado === 'en curso' && estado.accionesRestantes > 0
}

function completarAccion(estado: Estado): void {
  estado.accionesRestantes -= 1

  if (estado.accionesRestantes === 0) {
    hacerLlover(estado)
    actualizarConteos(estado)

    if (estado.turno === CONFIG.TURNOS_TOTALES) {
      estado.resultado =
        estado.familiasSalvadas >= estado.metaFamilias ? 'ganada' : 'perdida'
      return
    }

    estado.turno += 1
    estado.accionesRestantes = CONFIG.ACCIONES_POR_TURNO
  }

  actualizarConteos(estado)
  if (!puedeAlcanzarMeta(estado)) {
    estado.resultado = 'perdida'
  }
}

function hacerLlover(estado: Estado): void {
  for (const zona of estado.zonas) {
    zona.agua +=
      zona.fila === CONFIG.FILAS
        ? CONFIG.LLUVIA_QUEBRADA
        : CONFIG.LLUVIA_NORMAL
    if (zona.agua >= CONFIG.UMBRAL_INUNDACION) {
      zona.inundada = true
    }
  }
}

function actualizarConteos(estado: Estado): void {
  estado.familiasSalvadas = estado.zonas.reduce(
    (total, zona) => total + (zona.evacuada ? zona.familias : 0),
    0,
  )
  estado.familiasPerdidas = estado.zonas.reduce(
    (total, zona) =>
      total + (zona.inundada && !zona.evacuada ? zona.familias : 0),
    0,
  )
  estado.familiasEnRiesgo =
    estado.familiasTotales -
    estado.familiasSalvadas -
    estado.familiasPerdidas
  estado.porcentajeSalvado =
    (estado.familiasSalvadas / estado.familiasTotales) *
    CONFIG.PORCENTAJE_COMPLETO
}

function puedeAlcanzarMeta(estado: Estado): boolean {
  const accionesDisponibles =
    estado.accionesRestantes +
    (CONFIG.TURNOS_TOTALES - estado.turno) * CONFIG.ACCIONES_POR_TURNO
  const familiasPotencialmenteSalvables = estado.zonas
    .filter((zona) => !zona.evacuada && !zona.inundada)
    .sort((primera, segunda) => segunda.familias - primera.familias)
    .slice(0, accionesDisponibles)
    .reduce((total, zona) => total + zona.familias, 0)

  return (
    estado.familiasSalvadas + familiasPotencialmenteSalvables >=
    estado.metaFamilias
  )
}
