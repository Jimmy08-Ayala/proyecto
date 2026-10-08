import { describe, expect, it } from 'vitest'
import {
  CONFIG,
  crearEstado,
  crearGeneradorAzar,
  mostrarSenal,
  reintentar,
  textoMejorTiempo,
  tocar,
} from '../src/logica'

describe('Partidas de REACCIÓN', () => {
  it('inicia en rojo e incluye una demora aleatoria de dos a tres segundos', () => {
    const estado = crearEstado('inicio')

    expect(estado.fase).toBe('espera')
    expect(estado.color).toBe('rojo')
    expect(estado.mensaje).toBe('Esperá al verde...')
    expect(estado.demoraEsperaMs).toBeGreaterThanOrEqual(
      CONFIG.ESPERA_MINIMA_MS,
    )
    expect(estado.demoraEsperaMs).toBeLessThanOrEqual(
      CONFIG.ESPERA_MAXIMA_MS,
    )
    expect(estado.mejorTiempoMs).toBeNull()
    expect(textoMejorTiempo(estado)).toBe('—')
  })

  it('produce la misma secuencia aleatoria cuando se usa la misma semilla', () => {
    const primerGenerador = crearGeneradorAzar('misma semilla')
    const segundoGenerador = crearGeneradorAzar('misma semilla')

    expect([primerGenerador(), primerGenerador(), primerGenerador()]).toEqual([
      segundoGenerador(),
      segundoGenerador(),
      segundoGenerador(),
    ])
    expect(crearEstado('misma semilla')).toEqual(
      crearEstado('misma semilla'),
    )
  })

  it('rechaza mostrar la señal si la fase no es de espera o el instante no es válido', () => {
    const estado = crearEstado('senal invalida')

    expect(mostrarSenal(estado, Number.NaN)).toBe(false)
    expect(estado.color).toBe('rojo')
    expect(mostrarSenal(estado, 100)).toBe(true)
    expect(estado.fase).toBe('senal')
    expect(estado.color).toBe('verde')
    expect(estado.instanteSenalMs).toBe(100)
    expect(mostrarSenal(estado, 200)).toBe(false)
  })

  it('indica falso inicio en amarillo si se toca antes de la señal', () => {
    const estado = crearEstado('falso inicio')

    expect(tocar(estado, 50)).toBe(true)
    expect(estado.fase).toBe('final')
    expect(estado.color).toBe('amarillo')
    expect(estado.mensaje).toBe('¡Muy rápido! Esperá al cambio de color')
    expect(estado.resultado).toBe('falso inicio')
    expect(estado.tiempoReaccionMs).toBeNull()
    expect(estado.mejorTiempoMs).toBeNull()
  })

  it('calcula el tiempo de reacción y registra una nueva marca en azul', () => {
    const estado = crearEstado('nuevo record')

    expect(mostrarSenal(estado, 1000)).toBe(true)
    expect(tocar(estado, 1210)).toBe(true)
    expect(estado.fase).toBe('final')
    expect(estado.color).toBe('azul')
    expect(estado.tiempoReaccionMs).toBe(210)
    expect(estado.mensaje).toBe('210 ms')
    expect(estado.nuevoRecord).toBe(true)
    expect(estado.mejorTiempoMs).toBe(210)
    expect(estado.instruccion).toContain('¡Nuevo Récord!')
    expect(textoMejorTiempo(estado)).toBe('210 ms')
  })

  it('conserva el récord anterior si el nuevo tiempo no lo supera', () => {
    const estado = crearEstado('record anterior', 200)

    expect(mostrarSenal(estado, 1000)).toBe(true)
    expect(tocar(estado, 1210)).toBe(true)
    expect(estado.tiempoReaccionMs).toBe(210)
    expect(estado.nuevoRecord).toBe(false)
    expect(estado.mejorTiempoMs).toBe(200)
    expect(estado.instruccion).not.toContain('¡Nuevo Récord!')
  })

  it('no permite una reacción anterior a la señal ni instantes inválidos', () => {
    const estado = crearEstado('instante invalido')

    expect(mostrarSenal(estado, 1000)).toBe(true)
    expect(tocar(estado, 999)).toBe(false)
    expect(tocar(estado, Number.POSITIVE_INFINITY)).toBe(false)
    expect(estado.fase).toBe('senal')
    expect(estado.tiempoReaccionMs).toBeNull()
    expect(tocar(estado, 1000)).toBe(true)
    expect(estado.tiempoReaccionMs).toBe(0)
  })

  it('permite reintentar desde el final y vuelve al estado rojo sin borrar el récord', () => {
    const estado = crearEstado('reintentar')

    expect(reintentar(estado)).toBe(false)
    expect(mostrarSenal(estado, 500)).toBe(true)
    expect(tocar(estado, 650)).toBe(true)
    expect(reintentar(estado)).toBe(true)
    expect(estado.fase).toBe('espera')
    expect(estado.color).toBe('rojo')
    expect(estado.mensaje).toBe('Esperá al verde...')
    expect(estado.resultado).toBeNull()
    expect(estado.instanteSenalMs).toBeNull()
    expect(estado.tiempoReaccionMs).toBeNull()
    expect(estado.mejorTiempoMs).toBe(150)
    expect(estado.nuevoRecord).toBe(false)
  })

  it('permite reintentar tocando desde una pantalla final de falso inicio', () => {
    const estado = crearEstado('reintento falso inicio')

    expect(tocar(estado, 100)).toBe(true)
    expect(tocar(estado, 200)).toBe(true)
    expect(estado.fase).toBe('espera')
    expect(estado.color).toBe('rojo')
    expect(estado.resultado).toBeNull()
  })
})
