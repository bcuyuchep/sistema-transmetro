const $ = id => document.getElementById(id);
const txt = (tag, value) => { const e=document.createElement(tag);e.textContent=String(value ?? '—');return e; };
async function cargar() {
 try {
  const r=await fetch('/api/operador/resumen'); if(r.status===401||r.status===403){location.replace('/login');return;}
  const d=await r.json();if(!r.ok)throw Error(d.error||'Error de consulta');
  $('estado').textContent='Sesión de '+d.usuario;
  $('estacion').replaceChildren(txt('p',d.estacion.nombre+' (#'+d.estacion.id_estacion+')'),txt('p','Dirección: '+(d.estacion.direccion||'—')),txt('p','Aforo: '+d.estacion.aforo_actual+' / '+d.estacion.capacidad_max));
  $('lineas').replaceChildren(...(d.lineas.length?d.lineas.map(x=>txt('p',x.nombre)): [txt('p','Sin líneas asignadas')]));
  $('buses').replaceChildren(txt('p',d.buses.length+' buses vinculados a las líneas de esta estación'));
  $('bus').replaceChildren(new Option('Sin bus',''),...d.buses.map(x=>new Option(x.placa+' — '+x.linea,x.id_bus)));
  $('movimientos').replaceChildren(...d.movimientos.map(m=>{const tr=document.createElement('tr');[new Date(m.fecha).toLocaleString('es-GT'),m.tipo,m.id_bus,m.pasajeros,m.detalle].forEach(v=>tr.append(txt('td',v)));return tr;}));
 }catch(e){$('estado').textContent=e.message;}
}
$('form').addEventListener('submit',async e=>{e.preventDefault();$('mensaje').textContent='Guardando...';try{const r=await fetch('/api/operador/movimientos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo:$('tipo').value,id_bus:$('bus').value,pasajeros:$('pasajeros').value,detalle:$('detalle').value})});const d=await r.json();if(!r.ok)throw Error(d.error);$('mensaje').textContent=d.message;$('detalle').value='';$('pasajeros').value='';await cargar();}catch(err){$('mensaje').textContent=err.message;}});
$('salir').addEventListener('click',async()=>{await fetch('/api/logout',{method:'POST'});location.replace('/login');});cargar();