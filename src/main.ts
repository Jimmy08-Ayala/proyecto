import './estilo.css'
import {
  crearEstado,
  mostrarSenal,
  textoMejorTiempo,
  tocar,
} from './logica'

const aplicacion = document.querySelector<HTMLDivElement>('#app')

if (!aplicacion) {
  throw new Error('No se encontró el contenedor de la aplicación.')
}

const CLAVE_MEJOR_TIEMPO = 'reaccion-mejor-tiempo'
const valorGuardado = localStorage.getItem(CLAVE_MEJOR_TIEMPO)
const tiempoGuardado = valorGuardado === null ? null : Number(valorGuardado)
const estado = crearEstado(Date.now(), tiempoGuardado)
let temporizador: ReturnType<typeof setTimeout> | null = null

function dibujar(): void {
  aplicacion.innerHTML = `
    <main class="juego">
      <header class="encabezado">
        <h1>REACCIÓN</h1>
        <p class="record" aria-label="Mejor tiempo">
          Mejor tiempo
          <strong>${textoMejorTiempo(estado)}</strong>
        </p>
      </header>

      <section class="area-juego" aria-live="polite" aria-atomic="true">
        <button
          class="panel-juego ${estado.color}"
          type="button"
          data-accion="tocar"
          aria-label="${estado.mensaje}. ${estado.instruccion}"
        >
          <span class="mensaje">${estado.mensaje}</span>
          <span class="instruccion">${estado.instruccion}</span>
        </button>
      </section>
    </main>
  `
}

function cancelarEspera(): void {
  if (temporizador !== null) {
    clearTimeout(temporizador)
    temporizador = null
  }
}

function programarSenal(): void {
  cancelarEspera()
  temporizador = setTimeout(() => {
    temporizador = null
    if (mostrarSenal(estado, performance.now())) {
      dibujar()
    }
  }, estado.demoraEsperaMs)
}

function procesarToque(): void {
  cancelarEspera()
  const mejorTiempoAnterior = estado.mejorTiempoMs

  if (!tocar(estado, performance.now())) {
    return
  }

  if (
    estado.mejorTiempoMs !== null &&
    estado.mejorTiempoMs !== mejorTiempoAnterior
  ) {
    localStorage.setItem(CLAVE_MEJOR_TIEMPO, String(estado.mejorTiempoMs))
  }

  dibujar()
  if (estado.fase === 'espera') {
    programarSenal()
  }
}

aplicacion.addEventListener('click', (evento: MouseEvent) => {
  const destino = evento.target
  if (
    destino instanceof Element &&
    destino.closest('button[data-accion="tocar"]')
  ) {
    procesarToque()
  }
})

document.addEventListener('keydown', (evento: KeyboardEvent) => {
  if ((evento.code === 'Space' || evento.key === ' ') && !evento.repeat) {
    evento.preventDefault()
    procesarToque()
  }
})

dibujar()
programarSenal()
