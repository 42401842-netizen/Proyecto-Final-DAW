// Obtenemos el formulario, el campo de búsqueda y el elemento para mostrar errores.
const formulario = document.getElementById("formBusqueda");
const campoBusqueda = document.getElementById("cadenaBusqueda");
const errorBusqueda = document.getElementById("errorBusqueda");

// Obtenemos la sección y el espacio donde se mostrarán los resultados.
const respuestas = document.getElementById("seccion-respuestas");
const resultados = document.getElementById("resultados");

// Al cargar la página ocultamos la sección de resultados.
respuestas.style.display = "none";

// Variable donde construiremos el HTML de las obras encontradas.
let salida = "";

// Registramos la función buscarObras cuando se envíe el formulario.
formulario.addEventListener("submit", buscarObras);

// Función asíncrona encargada de realizar la búsqueda.
async function buscarObras(evento) {

    // Evitamos que el formulario recargue la página.
    evento.preventDefault();

    // Limpiamos algún mensaje de error anterior.
    errorBusqueda.textContent = "";

    // Verificamos que el usuario haya escrito algo.
    if (!campoBusqueda.value.trim()) {
        errorBusqueda.textContent = "Proporciona un valor de búsqueda";
        campoBusqueda.focus();
        return;
    }

    // Obtenemos el radio seleccionado.
    const radioSeleccionado = formulario.querySelector(
        'input[name="criterio"]:checked'
    );

    // Leemos el valor del radio:
    // q, tipo, anio o m.
    const criterio = radioSeleccionado.value;

    // Obtenemos el texto escrito y codificamos espacios,
    // acentos y caracteres especiales para enviarlos correctamente.
    const valorBusqueda = encodeURIComponent(
        campoBusqueda.value.trim()
    );

    // URL proporcionada por el profesor.
    const urlBase =
        "https://nearness-cyclist-debtor.ngrok-free.dev/pf/obras/index.php";

    // Construimos la petición según el criterio seleccionado.
    const peticion =
        urlBase + "?" + criterio + "=" + valorBusqueda;

    // Creamos una promesa que realizará la solicitud al servidor.
    let promesaObras = new Promise(function (resolve, reject) {

        // Creamos el objeto XMLHttpRequest.
        let solicitudObras = new XMLHttpRequest();

        // Abrimos la conexión utilizando GET.
        solicitudObras.open("GET", peticion);

        // Evitamos la pantalla de advertencia de ngrok.
        solicitudObras.setRequestHeader("ngrok-skip-browser-warning", true);

        // Evento que se ejecuta cuando el servidor responde.
        solicitudObras.onload = function () {

            // Verificamos que la respuesta sea exitosa.
            if (solicitudObras.status >= 200 && solicitudObras.status < 300) {

                try {

                    // Convertimos la respuesta a JSON
                    // y resolvemos la promesa.
                    resolve(JSON.parse(solicitudObras.responseText));

                } catch (e) {

                    // La respuesta llegó, pero no era JSON válido.
                    reject(
                        new Error("La respuesta JSON no es válida")
                    );
                }

            } else {

                // El servidor respondió con un error HTTP.
                reject(
                    new Error("Error HTTP " + solicitudObras.status)
                );
            }
        };

        // Se ejecuta si existe un problema de red.
        solicitudObras.onerror = function () {
            reject(
                new Error("Error de red o conexión")
            );
        };

        // Enviamos la petición al servidor.
        solicitudObras.send();

    });

    // Esperamos la resolución de la promesa.
    try {

        // Esperamos la respuesta del servidor.
        const obras = await promesaObras;

        console.log(obras);

        // Mostramos la sección de resultados.
        respuestas.style.display = "block";

        // Limpiamos resultados anteriores.
        salida = "";

        // Verificamos que la API haya regresado un arreglo.
        if (Array.isArray(obras)) {

            // Si el arreglo está vacío, no hubo coincidencias.
            if (obras.length == 0) {

                // Mostramos un mensaje cuando la búsqueda no tiene coincidencias.
                resultados.innerHTML = `
                    <div class="obra-resultado">
                        <p>No se encontraron obras que coincidan con la búsqueda.</p>
                    </div>
                `;

                return;
            }

            // Recorremos cada obra encontrada.
            obras.forEach(obra => {

                const urlImagen =
                    "https://nearness-cyclist-debtor.ngrok-free.dev/pf/obras" + obra.imagen;

                salida += `
                <div class="obra-resultado">

                    <div class="row">

                        <div class="col-12 col-md-6">

                            <img src="${urlImagen}"
                            class="img-fluid w-100"
                            alt="${obra.titulo}">

                        </div>

                        <div class="col-12 col-md-6">

                            <h3>${obra.titulo}</h3>

                            <p>${obra.descripcion}</p>

                            <p>
                                <strong>Artista:</strong>
                                ${obra.artista}
                            </p>

                            <p>
                                <strong>Año:</strong>
                                ${obra.anio}
                            </p>

                            <p>
                                <strong>Tipo:</strong>
                                ${obra.tipo}
                            </p>

                            <p>
                                <strong>Movimiento:</strong>
                                ${obra.movimiento}
                            </p>

                        </div>

                    </div>

                </div>
            `;

            });

        }

        // Mostramos el HTML generado.
        resultados.innerHTML = salida;

    } catch (error) {

        // Mostramos la sección aunque haya ocurrido un error.
        respuestas.style.display = "block";

        // Mostramos un mensaje amigable si falla la comunicación
        // o si la respuesta recibida no es válida.
        resultados.innerHTML = `
            <div class="obra-resultado">
                <p>No fue posible realizar la búsqueda. Intenta nuevamente.</p>
            </div>
        `;

        console.log(error);
    }

}