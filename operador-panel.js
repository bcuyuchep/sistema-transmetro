// Restricciones de presentación. La autorización real está en server.js.
(() => {
  const ocultarEdicion = () => {
    document.querySelectorAll('form').forEach(f => {
      if (f.id !== 'op-form') {
       f.style.display = 'none';
      }
    });
    document.querySelectorAll('button').forEach(b => {
      if (/eliminar|despachar bus|reasignar|actualizar estado|vincular/i.test(b.textContent || '')) b.style.display = 'none';
    });
  };
  document.addEventListener('DOMContentLoaded', () => {
    ocultarEdicion();
    const observer = new MutationObserver(ocultarEdicion);
    observer.observe(document.querySelector('.container') || document.body,{childList:true,subtree:true});
    const $ = id => document.getElementById(id);
    const celda = (tr,v) => {const td=document.createElement('td');td.textContent=String(v??'—');tr.append(td);};
    async function cargarEstaciones() {
    const selector = $('op-estacion-select');

    if (!selector) return;

    try {
        const respuesta = await fetch('/api/operador/estaciones', {
            credentials: 'same-origin',
            cache: 'no-store'
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error || 'Error al cargar estaciones');
        }

        selector.replaceChildren(
            new Option('-- Seleccione una estación --', ''),
            ...datos.map(estacion =>
                new Option(estacion.nombre, estacion.id_estacion)
            )
        );

    } catch (error) {
        console.error('Error:', error);
        $('op-estacion').textContent = error.message;
    }
}
    async function cargar() {
      const idEstacion = $('op-estacion-select').value;

if (!idEstacion) {
    $('op-estacion').textContent =
        'Seleccione una estación para consultar su información.';

    $('op-bus').replaceChildren(new Option('Sin bus', ''));
    $('op-movimientos').replaceChildren();

    return;
}

      try {
        const r = await fetch(
    `/api/operador/resumen?id_estacion=${encodeURIComponent(idEstacion)}`,
    {
        credentials: 'same-origin',
        cache: 'no-store'
    }
);

console.log('Estado de la consulta:', r.status);

const texto = await r.text();
console.log('Respuesta del servidor:', texto);

if (r.status === 401) {
    location.replace('/login');
    return;
}

let d;

try {
    d = JSON.parse(texto);
} catch (error) {
    throw new Error('El servidor no devolvió JSON válido: ' + texto.substring(0, 150));
}

if (!r.ok) {
    throw new Error(d.error || 'Error HTTP ' + r.status);
}
        $('op-estacion').textContent=`Estación: ${d.estacion.nombre} (#${d.estacion.id_estacion}) · Aforo: ${d.estacion.aforo_actual} / ${d.estacion.capacidad_max}`;
        $('op-bus').replaceChildren(new Option('Sin bus',''),...d.buses.map(b=>new Option(`${b.placa} — ${b.linea}`,b.id_bus)));
        const rows=d.movimientos.map(m=>{const tr=document.createElement('tr');[new Date(m.fecha).toLocaleString('es-GT'),m.tipo,m.id_bus,m.pasajeros,m.detalle].forEach(v=>celda(tr,v));return tr;});
        $('op-movimientos').replaceChildren(...rows);
      } catch(e) {$('op-estacion').textContent=e.message;}
    }
    $('op-form').addEventListener('submit',async e=>{
      e.preventDefault();$('op-mensaje').textContent='Guardando...';
      try {
        const r = await fetch('/api/operador/movimientos', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        id_estacion: $('op-estacion-select').value,
        tipo: $('op-tipo').value,
        id_bus: $('op-bus').value,
        pasajeros: $('op-pasajeros').value,
        detalle: $('op-detalle').value
    })
});
        const d=await r.json();if(!r.ok)throw Error(d.error||'Error al guardar');
        $('op-mensaje').textContent=d.message;$('op-pasajeros').value='';$('op-detalle').value='';await cargar();
      } catch(e){$('op-mensaje').textContent=e.message;}
    });
$('op-estacion-select').addEventListener('change', cargar);

(async () => {
    await cargarEstaciones();

    const selector = $('op-estacion-select');

    if (selector.options.length > 1) {
        selector.selectedIndex = 1;
    }

    await cargar();
})();

  });
})();