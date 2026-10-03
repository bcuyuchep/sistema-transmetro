-- =============================================================================
-- SISTEMA DE CONTROL DE TRANSMETRO Y MUNICIPALIDADES ALEDAÑAS
-- SCRIPT COMPLETO ORACLE XE - CUMPLIMIENTO TOTAL DE LOS 17 REQUERIMIENTOS
-- =============================================================================

BEGIN EXECUTE IMMEDIATE 'DROP TABLE Piloto CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Bus CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Parqueo CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Guardia CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Acceso CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Ruta_Linea CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Estacion CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Linea CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Municipalidad CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- Req 11: Municipalidades
CREATE TABLE Municipalidad (
    id_municipalidad INT PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL
);

-- Req 1, 4, 11, 13: Líneas de Transmetro
CREATE TABLE Linea (
    id_linea INT PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL,
    id_municipalidad INT NOT NULL,
    estado VARCHAR2(40) DEFAULT 'Operativa',
    CONSTRAINT fk_linea_muni FOREIGN KEY (id_municipalidad) REFERENCES Municipalidad(id_municipalidad)
);

-- Req 6: Parqueos
CREATE TABLE Parqueo (
    id_parqueo INT PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL,
    direccion VARCHAR2(200)
);

-- Req 1, 2, 6, 11, 14, 16: Estaciones (Con Parqueo opcional y Operador de PC)
CREATE TABLE Estacion (
    id_estacion INT PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL,
    direccion VARCHAR2(200),
    id_municipalidad INT NOT NULL,
    id_parqueo INT NULL,
    aforo_actual INT DEFAULT 45,
    capacidad_max INT DEFAULT 100,
    operador_nombre VARCHAR2(100) DEFAULT 'Operador Estación',
    CONSTRAINT fk_estacion_muni FOREIGN KEY (id_municipalidad) REFERENCES Municipalidad(id_municipalidad),
    CONSTRAINT fk_estacion_parqueo FOREIGN KEY (id_parqueo) REFERENCES Parqueo(id_parqueo)
);

-- Req 1, 2, 12, 13: Orden de visita y distancias entre estaciones por línea
CREATE TABLE Ruta_Linea (
    id_linea INT NOT NULL,
    id_estacion INT NOT NULL,
    orden_visita INT NOT NULL,
    distancia_siguiente_km NUMBER(5,2),
    PRIMARY KEY (id_linea, id_estacion),
    CONSTRAINT fk_ruta_linea FOREIGN KEY (id_linea) REFERENCES Linea(id_linea),
    CONSTRAINT fk_ruta_estacion FOREIGN KEY (id_estacion) REFERENCES Estacion(id_estacion)
);

-- Req 3, 8: Accesos por Estación
CREATE TABLE Acceso (
    id_acceso INT PRIMARY KEY,
    descripcion VARCHAR2(100),
    id_estacion INT NOT NULL,
    CONSTRAINT fk_acceso_estacion FOREIGN KEY (id_estacion) REFERENCES Estacion(id_estacion)
);

-- Req 10: Guardias de Seguridad (Mínimo 1 por acceso)
CREATE TABLE Guardia (
    id_guardia INT PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL,
    id_acceso INT NOT NULL,
    CONSTRAINT fk_guardia_acceso FOREIGN KEY (id_acceso) REFERENCES Acceso(id_acceso)
);

-- Req 4, 5, 6, 7, 14, 15: Flota de Buses con parqueo obligatorio
CREATE TABLE Bus (
    id_bus INT PRIMARY KEY,
    placa VARCHAR2(20) NOT NULL,
    capacidad_maxima INT NOT NULL,
    carga_pasajeros_pct INT DEFAULT 60,
    id_parqueo INT NOT NULL,
    id_linea INT NULL, 
    estado VARCHAR2(30) DEFAULT 'Operativo',
    CONSTRAINT fk_bus_parqueo FOREIGN KEY (id_parqueo) REFERENCES Parqueo(id_parqueo),
    CONSTRAINT fk_bus_linea FOREIGN KEY (id_linea) REFERENCES Linea(id_linea)
);

-- Req 9: Pilotos
CREATE TABLE Piloto (
    id_piloto INT PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL,
    historial_educativo VARCHAR2(255),
    residencia VARCHAR2(255),
    comunicacion VARCHAR2(100),
    id_bus INT NULL,
    CONSTRAINT fk_piloto_bus FOREIGN KEY (id_bus) REFERENCES Bus(id_bus)
);

-- Datos Base
INSERT INTO Municipalidad VALUES (1, 'Municipalidad de Guatemala');
INSERT INTO Municipalidad VALUES (2, 'Municipalidad de Mixco');
INSERT INTO Municipalidad VALUES (3, 'Municipalidad de Villa Nueva');

INSERT INTO Linea VALUES (0, 'Transbordo', 1, 'Operativa');
INSERT INTO Linea VALUES (1, 'Línea 1', 1, 'Operativa');
INSERT INTO Linea VALUES (2, 'Línea 2', 1, 'Operativa');
INSERT INTO Linea VALUES (5, 'Ruta 5', 1, 'Operativa');
INSERT INTO Linea VALUES (6, 'Línea 6', 1, 'Operativa');
INSERT INTO Linea VALUES (7, 'Línea 7', 1, 'Operativa');
INSERT INTO Linea VALUES (12, 'Línea 12', 3, 'Operativa');
INSERT INTO Linea VALUES (13, 'Línea 13', 1, 'Operativa');
INSERT INTO Linea VALUES (18, 'Línea 18', 1, 'Operativa');

INSERT INTO Parqueo VALUES (1, 'Parqueo Centra Sur', 'Zona 12 Villa Nueva');
INSERT INTO Parqueo VALUES (2, 'Parqueo FEGUA', 'Zona 1 Guatemala');

INSERT INTO Estacion VALUES (101, 'Mercado Central', '8ª avenida y 6ª calle, zona 1', 1, NULL, 40, 100, 'Op. Mercado');
INSERT INTO Estacion VALUES (102, 'Correos', '8ª avenida y 12 calle, zona 1', 1, NULL, 155, 100, 'Op. Correos');
INSERT INTO Estacion VALUES (1218, 'Centra Sur', '21 avenida final, zona 12 Villa Nueva', 3, 1, 160, 100, 'Op. CentraSur');

INSERT INTO Ruta_Linea VALUES (1, 101, 1, 0.85);
INSERT INTO Ruta_Linea VALUES (1, 102, 2, 0.60);
INSERT INTO Ruta_Linea VALUES (12, 1218, 1, 1.20);

INSERT INTO Acceso VALUES (501, 'Acceso Principal Norte', 101);
INSERT INTO Guardia VALUES (801, 'Juan Guardado', 501);

INSERT INTO Acceso VALUES (502, 'Acceso Rampa Peatonal', 1218);
INSERT INTO Guardia VALUES (802, 'Pedro Ramírez', 502);

INSERT INTO Bus VALUES (101, 'TR-1001', 160, 15, 1, 12, 'Operativo');
INSERT INTO Bus VALUES (102, 'TR-1002', 160, 80, 1, 12, 'Operativo');
INSERT INTO Bus VALUES (301, 'TR-3001', 120, 10, 2, NULL, 'Disponible');

INSERT INTO Piloto VALUES (901, 'Juan Pérez', 'Diversificado - Perito Contador', 'Zona 12, Villa Nueva', '5555-1234', 101);

COMMIT;