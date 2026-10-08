import { describe, expect, it } from 'vitest'
import {
  avisar,
  crearEstado,
  drenar,
  type Estado,
  type Zona,
} from '../src/juego'

function buscarZona(estado: Estado, fila: number, columna: number): Zona {
  const zona = estado.zonas.find(
    (elemento) => elemento.fila === fila && elemento.columna === columna,
  )

  if (!zona) {
    throw new Error(`No existe la zona ${fila}, ${columna}`)
  }

  return zona
}

function sumarFamilias(estado: Estado): number {
  return estado.zonas.reduce((total, zona) => total + zona.familias, 0)
}

describe('Partidas de Tormenta', () => {
  it('arma un tablero con veinticinco zonas organizadas en cinco filas', () => {
    const estado = crearEstado('tablero')

    expect(estado.zonas).toHaveLength(25)
    expect(new Set(estado.zonas.map((zona) => zona.fila)).size).toBe(5)
    expect(estado.zonas.every((zona) => zona.fila >= 1 && zona.fila <= 5)).toBe(
      true,
    )
    expect(
      estado.zonas.every(
        (zona) =>
          zona.familias >= 1 &&
          zona.familias <= 3 &&
          zona.agua >= 0 &&
          zona.agua <= 3,
      ),
    ).toBe(true)
  })

  it('genera el mismo tablero con la misma semilla y tableros distintos con semillas distintas', () => {
    expect(crearEstado('misma semilla')).toEqual(
      crearEstado('misma semilla'),
    )
    expect(crearEstado('semilla uno').zonas).not.toEqual(
      crearEstado('semilla dos').zonas,
    )
  })

  it('avisa una zona segura, la cuenta como salvada y rechaza zonas no válidas', () => {
    const estado = crearEstado('avisar')
    const zona = buscarZona(estado, 1, 1)
    zona.agua = 0
    const accionesIniciales = estado.accionesRestantes

    expect(avisar(estado, zona.fila, zona.columna)).toBe(true)
    expect(zona.evacuada).toBe(true)
    expect(estado.familiasSalvadas).toBe(zona.familias)
    expect(estado.accionesRestantes).toBe(accionesIniciales - 1)

    const accionesRestantes = estado.accionesRestantes
    expect(avisar(estado, zona.fila, zona.columna)).toBe(false)
    expect(avisar(estado, 0, 0)).toBe(false)
    expect(estado.accionesRestantes).toBe(accionesRestantes)

    const zonaInundada = buscarZona(estado, 1, 2)
    zonaInundada.inundada = true
    expect(avisar(estado, zonaInundada.fila, zonaInundada.columna)).toBe(false)
  })

  it('drena la zona elegida y sus vecinas diagonales sin bajar el agua de cero', () => {
    const estado = crearEstado('drenar')
    for (const zona of estado.zonas) {
      zona.agua = 0
    }

    const propia = buscarZona(estado, 3, 3)
    const diagonal = buscarZona(estado, 2, 2)
    const distante = buscarZona(estado, 1, 1)
    propia.agua = 2
    diagonal.agua = 1
    distante.agua = 3

    expect(drenar(estado, propia.fila, propia.columna)).toBe(true)
    expect(propia.agua).toBe(0)
    expect(diagonal.agua).toBe(0)
    expect(distante.agua).toBe(3)
    expect(drenar(estado, 0, 0)).toBe(false)
  })

  it('permite drenar una zona inundada, pero no la recupera', () => {
    const estado = crearEstado('drenaje inundado')
    const zona = buscarZona(estado, 2, 2)
    zona.inundada = true
    zona.agua = 4

    expect(drenar(estado, zona.fila, zona.columna)).toBe(true)
    expect(zona.agua).toBe(1)
    expect(zona.inundada).toBe(true)
  })

  it('no permite actuar cuando no quedan acciones disponibles', () => {
    const estado = crearEstado('sin acciones')
    const zona = buscarZona(estado, 1, 1)
    estado.accionesRestantes = 0
    const aguaInicial = zona.agua

    expect(avisar(estado, zona.fila, zona.columna)).toBe(false)
    expect(drenar(estado, zona.fila, zona.columna)).toBe(false)
    expect(zona.evacuada).toBe(false)
    expect(zona.agua).toBe(aguaInicial)
  })

  it('hace llover y reinicia las acciones al completar tres acciones', () => {
    const estado = crearEstado('fin de turno')
    const zonaNormal = buscarZona(estado, 1, 1)
    const zonaQuebrada = buscarZona(estado, 5, 1)
    zonaNormal.agua = 0
    zonaQuebrada.agua = 0

    expect(drenar(estado, 3, 3)).toBe(true)
    expect(drenar(estado, 3, 3)).toBe(true)
    expect(estado.accionesRestantes).toBe(1)
    expect(drenar(estado, 3, 3)).toBe(true)

    expect(estado.turno).toBe(2)
    expect(estado.accionesRestantes).toBe(3)
    expect(zonaNormal.agua).toBe(1)
    expect(zonaQuebrada.agua).toBe(2)
  })

  it('mantiene invariable el total de familias durante las acciones y la lluvia', () => {
    const estado = crearEstado('total de familias')
    const totalInicial = estado.familiasTotales

    for (
      let accion = 0;
      accion < 12 && estado.resultado === 'en curso';
      accion += 1
    ) {
      const zona = estado.zonas.find((candidata) => !candidata.evacuada)
      if (!zona) {
        break
      }

      if (!zona.inundada) {
        avisar(estado, zona.fila, zona.columna)
      } else {
        drenar(estado, zona.fila, zona.columna)
      }

      expect(estado.familiasTotales).toBe(totalInicial)
      expect(sumarFamilias(estado)).toBe(totalInicial)
    }
  })

  it('permite ganar una partida completa avisando primero a las zonas con más familias y mayor riesgo', () => {
    const estado = crearEstado('estrategia razonable')
    const totalInicial = estado.familiasTotales
    let acciones = 0

    while (estado.resultado === 'en curso' && acciones < 24) {
      const candidatas = estado.zonas
        .filter((zona) => !zona.evacuada && !zona.inundada)
        .sort((primera, segunda) => {
          const prioridadPrimera =
            primera.familias * 100 +
            (primera.fila === 5 ? 50 : primera.fila * 5) +
            primera.agua
          const prioridadSegunda =
            segunda.familias * 100 +
            (segunda.fila === 5 ? 50 : segunda.fila * 5) +
            segunda.agua
          return prioridadSegunda - prioridadPrimera
        })
      const objetivo = candidatas[0]

      if (!objetivo) {
        break
      }

      expect(avisar(estado, objetivo.fila, objetivo.columna)).toBe(true)
      acciones += 1
      expect(sumarFamilias(estado)).toBe(totalInicial)
    }

    expect(estado.resultado).toBe('ganada')
    expect(estado.turno).toBe(8)
    expect(estado.familiasSalvadas).toBeGreaterThanOrEqual(estado.metaFamilias)
  })

  it('termina en derrota si se gastan las acciones sin evacuar familias', () => {
    const estado = crearEstado('sin evacuaciones')
    const totalInicial = estado.familiasTotales
    let acciones = 0

    while (estado.resultado === 'en curso' && acciones < 24) {
      expect(drenar(estado, 3, 3)).toBe(true)
      acciones += 1
      expect(estado.familiasSalvadas).toBe(0)
      expect(sumarFamilias(estado)).toBe(totalInicial)
    }

    expect(estado.resultado).toBe('perdida')
    expect(estado.familiasSalvadas).toBe(0)
  })
})
