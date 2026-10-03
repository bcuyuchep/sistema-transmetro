-- 1. Insertar Municipalidades
INSERT INTO Municipalidad (id_municipalidad, nombre) VALUES (1, 'Guatemala');
INSERT INTO Municipalidad (id_municipalidad, nombre) VALUES (2, 'Mixco');

-- 2. Insertar una Linea
INSERT INTO Linea (id_linea, nombre, id_municipalidad) VALUES (1, 'Linea 12', 1);

-- 3. Insertar Estaciones
INSERT INTO Estacion (id_estacion, nombre, id_municipalidad) VALUES (1, 'Centra Sur', 1);
INSERT INTO Estacion (id_estacion, nombre, id_municipalidad) VALUES (2, 'El Trebol', 1);
INSERT INTO Estacion (id_estacion, nombre, id_municipalidad) VALUES (3, 'Plaza Barrios', 1);

-- 4. Insertar la Ruta (El orden en que pasa el bus y la distancia)
INSERT INTO Ruta_Linea (id_linea, id_estacion, orden_visita, distancia_siguiente_km) VALUES (1, 1, 1, 5.2);
INSERT INTO Ruta_Linea (id_linea, id_estacion, orden_visita, distancia_siguiente_km) VALUES (1, 2, 2, 3.1);
INSERT INTO Ruta_Linea (id_linea, id_estacion, orden_visita, distancia_siguiente_km) VALUES (1, 3, 3, 0);

-- 5. Insertar un Parqueo
INSERT INTO Parqueo (id_parqueo, nombre, direccion) VALUES (1, 'Parqueo Sur', 'Zona 12');

-- 6. Insertar Buses
INSERT INTO Bus (id_bus, placa, capacidad_maxima, id_parqueo, id_linea) VALUES (1, 'U012ABC', 100, 1, 1);
INSERT INTO Bus (id_bus, placa, capacidad_maxima, id_parqueo, id_linea) VALUES (2, 'U987XYZ', 120, 1, 1);

-- 7. Guardar los cambios definitivamente
COMMIT;
 