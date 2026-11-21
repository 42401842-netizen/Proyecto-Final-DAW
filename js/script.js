// Obtenemos el formulario, el campo de búsqueda y el elemento para mostrar errores.
const formulario = document.getElementById("formBusqueda");
const campoBusqueda = document.getElementById("cadenaBusqueda");
const errorBusqueda = document.getElementById("errorBusqueda");

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
    let myPromise = new Promise(function (resolve, reject) {

        // Creamos el objeto XMLHttpRequest.
        let request = new XMLHttpRequest();

        // Abrimos la conexión utilizando GET.
        request.open("GET", peticion);

        // Evitamos la pantalla de advertencia de ngrok.
        request.setRequestHeader("ngrok-skip-browser-warning", true);

        // Evento que se ejecuta cuando el servidor responde.
        request.onload = function () {

            // Verificamos que la respuesta sea exitosa.
            if (request.status >= 200 && request.status < 300) {

                try {

                    // Convertimos la respuesta a JSON
                    // y resolvemos la promesa.
                    resolve(JSON.parse(request.responseText));

                } catch (e) {

                    // La respuesta llegó, pero no era JSON válido.
                    reject(
                        new Error("La respuesta JSON no es válida")
                    );
                }

            } else {

                // El servidor respondió con un error HTTP.
                reject(
                    new Error("Error HTTP " + request.status)
                );
            }
        };

        // Se ejecuta si existe un problema de red.
        request.onerror = function () {
            reject(
                new Error("Error de red o conexión")
            );
        };

        // Enviamos la petición al servidor.
        request.send();

    });

    // Esperamos la resolución de la promesa.
    try {

        const data = await myPromise;

        // Por ahora mostramos la respuesta en consola.
        console.log(data);

    } catch (error) {

        // Mostramos un mensaje comprensible en la página.
        errorBusqueda.textContent =
            "No fue posible realizar la búsqueda.";

        console.log(error);
    }

}