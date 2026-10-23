// Actualiza el tablero cada 10 segundos; no implica ubicación GPS en tiempo real.
(() => {
  const cuerpo = document.getElementById('estado-buses');
  const alerta = document.getElementById('alerta-llegada');
  const vistos = new Map();
  let iniciado = false;
  let ocupada = false;
  const celda = (tr, valor) => { const td = document.createElement('td'); td.textContent = valor; tr.appendChild(td); return td; };
  async function actualizar() {
    if (ocupada) return;
    ocupada = true;
    try {
      const respuesta = await fetch('/api/operador/estado-buses', { cache: 'no-store' });
      if (!respuesta.ok) throw Error('No se pudo consultar el estado de los buses');
      const datos = await respuesta.json();
      cuerpo.replaceChildren();
      for (const bus of datos.buses) {
        const anterior = vistos.get(bus.id_bus);
        const marca = `${bus.ultimo_movimiento || ''}:${bus.ultima_fecha || ''}`;
        if (iniciado && anterior !== undefined && anterior !== marca && bus.estado_parada === 'EN_PARADA') {
          alerta.textContent = `🚌 ALERTA: El bus ${bus.placa} llegó a la parada. Línea: ${bus.linea}.`;
        }
        vistos.set(bus.id_bus, marca);
        const tr = document.createElement('tr');
        celda(tr, bus.placa); celda(tr, bus.linea);
        celda(tr, bus.estado_parada === 'EN_PARADA' ? '🟢 Llegó a la parada' : bus.estado_parada === 'SALIO' ? '🔵 Salió de la parada' : '⚪ Sin llegada confirmada');
        celda(tr, bus.ultima_fecha ? new Date(bus.ultima_fecha).toLocaleString('es-GT') : '—');
        const td = document.createElement('td');
        const boton = document.createElement('button');
        const llegada = bus.estado_parada !== 'EN_PARADA';
        boton.textContent = llegada ? 'Confirmar llegada' : 'Registrar salida';
        boton.addEventListener('click', async () => {
          boton.disabled = true;
          try {
            const r = await fetch('/api/operador/movimientos', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tipo:llegada?'LLEGADA':'SALIDA',id_bus:bus.id_bus,detalle:'Confirmado por Operador PC'}) });
            const d = await r.json(); if (!r.ok) throw Error(d.error || 'Error al guardar');
            alerta.textContent = llegada ? `🚌 ALERTA: El bus ${bus.placa} ha llegado a la parada.` : `ℹ️ El bus ${bus.placa} salió de la parada.`;
            await actualizar();
            if (typeof cargar === 'function') await cargar();
          } catch (e) { alerta.textContent = e.message; }
          finally { boton.disabled = false; }
        });
        td.appendChild(boton); tr.appendChild(td); cuerpo.appendChild(tr);
      }
      if (!datos.buses.length) { const tr=document.createElement('tr'); celda(tr,'No hay buses asignados a las líneas de esta estación'); cuerpo.appendChild(tr); }
      iniciado = true;
    } catch (e) { alerta.textContent = e.message; }
    finally { ocupada = false; }
  }
  actualizar(); setInterval(actualizar, 10000);
})();
