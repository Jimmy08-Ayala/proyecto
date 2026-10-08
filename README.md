REACCIÓN - Juego de Reflejos

Un juego web interactivo enfocado en medir el tiempo de reacción ante un estímulo visual e incentivar la superación personal mediante el registro de marcas personales.

Ficha Técnica del Proyecto

Nombre del Proyecto: Reflejos de Acero (REACCIÓN)

En una frase: Juego rápido donde debes tocar la pantalla en el milisegundo exacto en que cambia de color para medir tu tiempo de reacción.

Para quién es: Para usuarios en eventos o entornos recreativos (como una feria escolar) que buscan competir con amigos y superar marcas personales.

Qué logra: Mide con precisión milimétrica la velocidad de reacción e incentiva el desarrollo de reflejos.

Los tres verbos:

Esperar

Tocar

Reintentar

Termina bien si: El usuario toca la pantalla justo después del cambio de color, mostrando el tiempo en milisegundos y actualizando el récord personal si corresponde.

Termina mal si: El usuario presiona la pantalla antes de que cambie de color (falso arranque), mostrando una advertencia e interrumpiendo el intento.

Qué se ve en pantalla:

Panel principal que abarca la mayor parte de la interfaz y cambia de color según el estado.

Indicador del mejor tiempo (récord) en la parte superior.

Texto explicativo central (instrucciones, tiempo obtenido en ms o aviso de fallo).

Controles:

Teclado: Barra espaciadora (Espacio).

Celular/Táctil: Pulsación con el dedo (Tap) en el panel central.

Colores y significado:

Rojo: Espera/Alerta (fase preparatoria).

Verde: Acción (¡Toca ahora!).

Azul: Pantalla de resultados y nuevo récord.

Amarillo: Advertencia (falso arranque / error).

 Prompts de Desarrollo (P1 - P5)

El desarrollo de este proyecto se estructuró a través de una metodología por bloques usando los siguientes prompts:

P1 | ARRANQUE · Las reglas

Objetivo: Crear el núcleo de lógica pura en TypeScript (src/logica.ts) sin acceso al DOM ni llamadas externas.

Crea la lógica. Es el único prompt largo: todo lo demás son cuatro líneas.
Creá el archivo src/logica.ts con las reglas de REACCION según la ficha.

REGLAS TÉCNICAS, obligatorias:
- TypeScript. Exportá los tipos y el objeto CONFIG con todos los números juntos arriba, cada uno con un comentario que diga su unidad.
- Este archivo NO puede tocar la pantalla: nada de document, window, alert ni console.log. Solo datos y funciones sobre el estado.
- Cada función que cambia el estado devuelve true si la acción fue válida y false si no se pudo hacer.
- Si hace falta azar, usá un generador con semilla y exportalo, para que la misma semilla dé siempre el mismo resultado.
- Código y comentarios en español.

REGLAS DE TRABAJO:
- Hacé exactamente lo que dice la ficha. Nada más.
- Si algo es ambiguo o imposible, paralo y preguntame antes de inventar.
- Al terminar, listame qué dejaste fuera y qué decidiste vos donde la ficha no decía nada.


P2 | PRUEBAS · Que la máquina revise

Objetivo: Validar la estabilidad y casos de uso en test/logica.test.ts con Vitest.

Mínimo cinco pruebas. La número 5 es la que encuentra los errores de diseño.
Escribí pruebas con Vitest para src/logica.ts, en test/logica.test.ts.

Como mínimo cinco, y tienen que cubrir:
1. Que el estado inicial se arme bien.
2. Cada acción del usuario: qué hace cuando es válida y qué devuelve cuando no.
3. Que no se pueda hacer una acción prohibida por las reglas.
4. La condición de «termina bien» y la de «termina mal» de mi ficha.
5. UNA PRUEBA QUE RECORRA UN USO COMPLETO de principio a fin y compruebe que SE PUEDE LLEGAR AL FINAL BUENO.

Los nombres de las pruebas en español y en forma de frase.
No modifiques src/logica.ts. Al terminar corré npm test y pegame el resultado.


P3 | PANTALLA · Que se vea

Objetivo: Renderizar el estado visual en src/main.ts y aplicar estilos con src/estilo.css.

La pantalla no decide nada: solo muestra lo que dice la lógica.
Creá src/main.ts y src/estilo.css para mostrar REACCIÓN en pantalla.

REGLAS:
- main.ts NO decide nada: llama a las funciones de logica.ts y dibuja el resultado. Si tenés que escribir una regla acá, está en el lugar equivocado.
- Tres estados visibles: el inicio, el uso normal y el final.
- Contraste alto y texto nunca menor a 16 píxeles.
- Los colores según mi ficha. Sin imágenes ni librerías externas.
- Importá el CSS desde main.ts con: import './estilo.css'

Ajustá index.html para que tenga un div con id="app" y cargue src/main.ts como módulo. Al terminar confirmame que no hay errores en la consola.


P4 | MÓVIL · Que funcione con el dedo

Objetivo: Asegurar la adaptabilidad y accesibilidad móvil.

Hacé que esto funcione bien en un celular:

1. Todo lo que se toca tiene que medir al menos 44 píxeles de alto y de ancho.
2. Nada se sale de la pantalla a lo ancho: cero desplazamiento horizontal.
3. El texto nunca baja de 16 píxeles.
4. Funciona con el dedo (toque) y también con teclado, las dos cosas.
5. Agregá la etiqueta viewport en index.html si falta.

No cambies las reglas ni la dificultad. Decime qué ajustaste.


P5 | REVISIÓN · Los seis problemas típicos

Objetivo: Auditar la estructura y detectar posibles malas prácticas.

Revisá todo el proyecto buscando estos seis problemas, y decime cuáles tiene y en qué línea está cada uno:

1. Lógica metida dentro de main.ts.
2. Números sueltos fuera del objeto CONFIG.
3. Un final bueno al que no se pueda llegar: hacé el cálculo con los números reales.
4. Estado que no se reinicia bien al empezar de nuevo.
5. Variables o funciones que quedaron sin uso.
6. Alguna regla de mi ficha que las pruebas no cubran.

Solo el informe, numerado. TODAVÍA NO ARREGLES NADA.


Tecnologías Utilizadas

TypeScript

Vite

Vitest (Testing)

HTML5 / CSS3 (Vanilla UI)
