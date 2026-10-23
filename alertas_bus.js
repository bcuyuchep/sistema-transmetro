// Rutas de seguimiento de llegadas; registrar una llegada confirma presencia por el operador.
module.exports = function instalarAlertasBus(app, pool, requiereOperador) {
  app.get('/api/operador/estado-buses', requiereOperador, async (req, res) => {
    try {
      const resultado = await pool.query(`
        SELECT b.id_bus, b.placa, l.nombre AS linea,
               m.tipo AS ultimo_movimiento, m.fecha AS ultima_fecha,
               CASE WHEN m.tipo='LLEGADA' THEN 'EN_PARADA'
                    WHEN m.tipo='SALIDA' THEN 'SALIO'
                    ELSE 'SIN_CONFIRMAR' END AS estado_parada
        FROM Bus b
        JOIN Linea l ON l.id_linea=b.id_linea
        JOIN Ruta_Linea r ON r.id_linea=l.id_linea
        LEFT JOIN LATERAL (
          SELECT mo.tipo, mo.fecha, mo.id_movimiento
          FROM Movimiento_Operador mo
          WHERE mo.id_estacion=$1 AND mo.id_bus=b.id_bus
            AND mo.tipo IN ('LLEGADA','SALIDA')
          ORDER BY mo.fecha DESC, mo.id_movimiento DESC LIMIT 1
        ) m ON TRUE
        WHERE r.id_estacion=$1 ORDER BY l.nombre, b.placa`, [req.session.estacionId]);
      res.json({ buses: resultado.rows, actualizado: new Date().toISOString() });
    } catch (e) {
      console.error('Estado buses:', e);
      res.status(500).json({ error: 'No se pudo consultar el estado de los buses.' });
    }
  });
};
