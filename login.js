
document.addEventListener('DOMContentLoaded', () => {

    const formulario = document.getElementById('form-login');
    const mensaje = document.getElementById('mensaje-error');
    const boton = document.getElementById('boton-login');

    // Verificar si ya inició sesión
    async function verificarSesion() {
        try {
            const respuesta = await fetch('/api/session', {
                credentials: 'same-origin'
            });

const datos = await respuesta.json();

if (respuesta.ok && datos.autenticado === true) {
    window.location.replace('/');
}

          
        } catch (error) {
            console.error('No se pudo verificar la sesión');
        }
    }

    verificarSesion();

    // Iniciar sesión
    formulario.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usuario = document.getElementById('usuario').value.trim();
        const password = document.getElementById('password').value;

        mensaje.textContent = '';
        boton.disabled = true;
        boton.textContent = 'Verificando...';

        try {
            const respuesta = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    usuario: usuario,
                    password: password
                })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                window.location.replace('/');
            } else {
                mensaje.textContent =
                    datos.error || 'Usuario o contraseña incorrectos';
            }

        } catch (error) {
            mensaje.textContent =
                'No se pudo conectar con el servidor';
        } finally {
            boton.disabled = false;
            boton.textContent = 'Iniciar sesión →';
        }
    });
});
const titulo = document.getElementById("titulo-colorido");

if (titulo) {
    const texto = titulo.textContent;
    titulo.textContent = "";

    let contador = 0;

    for (const letra of texto) {
        const span = document.createElement("span");
        span.textContent = letra;

        if (letra !== " ") {
            span.style.color = contador % 2 === 0 ? "#FFFFFF" : "#4ADE80";
            contador++;
        }

        titulo.appendChild(span);
    }
} 