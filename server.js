require('dotenv').config();

const express = require('express');
const oracledb = require('oracledb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};

function normalizarFilas(rows) {
    if (!rows || !Array.isArray(rows)) return [];
    return rows.map(row => {
        let nuevoObjeto = {};
        for (let key in row) {
            nuevoObjeto[key.toLowerCase()] = row[key];
        }
        return nuevoObjeto;
    });
}

const lista120Estaciones = [
    [1, 'Capuchinas', '10ª avenida y 10ª calle, zona 1', 0, 1],
    [2, 'Cerro del Carmen', '1ª calle y 13 avenida, entre zonas 1 y 2', 0, 1],
    [3, 'San Sebastián', '3ª calle y 6ª avenida, zona 1', 0, 1],
    [4, 'Colón', '11 avenida y 8ª calle, zona 1', 0, 1],
    [5, 'Atlántida', '11 avenida (Bulevar Álvaro Arzú), zona 18', 0, 1],
    [6, 'FEGUA', '18 calle entre 9ª y 10ª avenida, zona 1', 0, 1],
    [7, 'Francos y Monroy', '11 avenida y 15 calle, zona 1', 0, 1],
    [101, 'Mercado Central', '8ª avenida y 6ª calle, zona 1', 1, 1],
    [102, 'Correos', '8ª avenida y 12 calle, zona 1', 1, 1],
    [103, 'Beatas de Belén', '8ª avenida y 15 calle, zona 1', 1, 1],
    [104, 'Paseo de las Letras', '8ª avenida y 19 calle, zona 1', 1, 1],
    [105, 'Centro Cívico', '21 calle y 6ª avenida A, zona 1', 1, 1],
    [106, 'Sur 2', '5ª avenida y 18 calle, zona 1', 1, 1],
    [107, 'Gómez Carrillo', '5ª avenida y 14 calle, zona 1', 1, 1],
    [108, 'San Agustín', '5ª avenida y 11 calle, zona 1', 1, 1],
    [109, 'Parque Centenario', '5ª avenida y 8ª calle, zona 1', 1, 1],
    [201, 'San José de la Montaña', 'Avenida Simeón Cañas y 6ª calle, zona 2', 2, 1],
    [202, 'Hipódromo del Norte', 'Avenida Simeón Cañas y 11 calle, zona 2', 2, 1],
    [203, 'Simeón Cañas', 'Avenida Simeón Cañas y 7ª calle, zona 2', 2, 1],
    [204, 'Jocotenango', '6ª avenida entre 3ª y 4ª calle, zona 2', 2, 1],
    [601, 'Parroquia', '15 avenida y 3ª calle, zona 6', 6, 1],
    [602, 'IGSS Zona 6', '16 avenida y 6ª calle, zona 6', 6, 1],
    [603, 'Centro Zona 6', '16 avenida y 10ª calle, zona 6', 6, 1],
    [604, 'Academia', '16 avenida y 15 calle, zona 6', 6, 1],
    [605, 'Cipresales', 'Avenida La Pedrera y 18 calle, zona 6', 6, 1],
    [606, 'Proyectos 4-4', 'Avenida La Pedrera y 20 calle, zona 6', 6, 1],
    [607, 'Proyectos', 'Avenida La Pedrera y 25 calle, zona 6', 6, 1],
    [608, 'Quintanal', '15 avenida y 13 calle, zona 6', 6, 1],
    [609, 'Corpus Christi', '15 avenida y 10ª calle, zona 6', 6, 1],
    [610, 'José Martí', '14 avenida y 7ª calle, zona 6', 6, 1],
    [611, 'Santa Teresa', '10ª avenida y 4ª calle, zona 1', 6, 1],
    [701, 'USAC Periférico', 'Anillo Periférico y 11 avenida, zona 12', 7, 1],
    [702, 'Granai (Dir: La Merced)', 'Anillo Periférico y 12 avenida, zona 11', 7, 1],
    [703, 'Granai (Dir: USAC Periférico)', 'Anillo Periférico y 9ª avenida A, zona 11', 7, 1],
    [704, 'Rodolfo Robles (Dir: La Merced)', 'Anillo Periférico 20 calle, zona 11', 7, 1],
    [705, 'Rodolfo Robles (Dir: USAC Periférico)', 'Anillo Periférico Diagonal 21 y calle Mariscal, zona 11', 7, 1],
    [706, 'CEJUSA (Dir: La Merced)', 'Anillo Periférico y 18 calle, zona 11', 7, 1],
    [707, 'CEJUSA (Dir: USAC Periférico)', 'Anillo Periférico y 17 calle, zona 11', 7, 1],
    [708, 'San Jorge (Dir: La Merced)', 'Anillo Periférico y 21 avenida, zona 11', 7, 1],
    [709, 'San Jorge (Dir: USAC Periférico)', 'Anillo Periférico y 22 avenida, zona 11', 7, 1],
    [710, 'Roosevelt (Dir: La Merced)', 'Anillo Periférico y Calzada Roosevelt, zona 11', 7, 1],
    [711, 'Roosevelt (Dir: USAC Periférico)', 'Anillo Periférico y Calzada Roosevelt, zona 11', 7, 1],
    [712, 'San Juan (Dir: La Merced)', 'Anillo Periférico entre 4ª y 6ª calles, zona 7', 7, 1],
    [713, 'San Juan (Dir: USAC Periférico)', 'Anillo Periférico y 6ª calle, zona 7', 7, 1],
    [714, 'Ciudad de Plata II (Dir: La Merced)', 'Anillo Periférico y 14 calle, zona 7', 7, 1],
    [715, 'Ciudad de Plata II (Dir: USAC Periférico)', 'Anillo Periférico y 13 calle B, zona 7', 7, 1],
    [716, 'Villa Linda (Dir: La Merced)', 'Anillo Periférico y 16 calle, zona 7', 7, 1],
    [717, 'Villa Linda (Dir: USAC Periférico)', 'Anillo Periférico y 16 calle, zona 7', 7, 1],
    [718, '4 de Febrero (Dir: La Merced)', 'Anillo Periférico y 6ª calle, zona 7', 7, 1],
    [719, '4 de Febrero (Dir: USAC Periférico)', 'Anillo Periférico y 22 calle, zona 7', 7, 1],
    [720, 'Bethania (Dir: La Merced)', 'Anillo Periférico y 25 calle, zona 7', 7, 1],
    [721, 'Bethania (Dir: USAC Periférico)', 'Anillo Periférico y 13 avenida, zona 7', 7, 1],
    [722, 'Incienso (Dir: La Merced)', 'Anillo Periférico y Puente El Incienso, zona 7', 7, 1],
    [723, 'Incienso (Dir: USAC Periférico)', 'Anillo Periférico y Puente El Incienso, zona 7', 7, 1],
    [724, 'San Juan de Dios', '9ª calle y 2ª avenida, zona 1', 7, 1],
    [725, 'Pasaje Aycinena', '9ª calle y 7ª avenida, zona 1', 7, 1],
    [726, 'La Merced', '11 avenida y 4ª calle, zona 1', 7, 1],
    [727, 'Cruz Roja', '4ª calle y 8ª avenida, zona 1', 7, 1],
    [728, 'Archivo General', '4ª avenida y 7ª calle, zona 1', 7, 1],
    [729, 'Santuario de Guadalupe', '8ª calle y 1ª avenida, zona 1', 7, 1],
    [1201, 'Plaza Municipal', '6ª avenida y 21 calle, zona 1', 12, 1],
    [1202, 'Plaza Barrios', '9ª avenida y 18 calle, zona 1', 12, 1],
    [1203, 'Plaza El Amate', '18 calle y 4ª avenida, zona 1', 12, 1],
    [1204, 'Don Bosco', '1ª avenida y 26 calle, zona 1', 12, 1],
    [1205, 'Bolívar (Dir: Plaza Barrios)', 'Avenida Bolívar y 32 calle, zona 8', 12, 1],
    [1206, 'Bolívar (Dir: Centra Sur)', 'Avenida Bolívar y 31 calle, zona 3', 12, 1],
    [1207, 'Santa Cecilia', 'Avenida Bolívar y 40 calle, zona 8', 12, 1],
    [1208, 'Trébol', 'Calzada Aguilar Batres y avenida Bolívar, zona 12', 12, 1],
    [1209, 'Mariscal (Dir: Centra Sur)', 'Calzada Aguilar Batres y 13 calle, zona 12', 12, 1],
    [1210, 'Mariscal (Dir: Plaza Barrios)', 'Calzada Aguilar Batres y 15 calle, zona 12', 12, 1],
    [1211, 'Reformita (Dir: Centra Sur)', 'Calzada Aguilar Batres y 20 calle, zona 12', 12, 1],
    [1212, 'Reformita (Dir: Plaza Barrios)', 'Calzada Aguilar Batres y 21 calle, zona 12', 12, 1],
    [1213, 'El Carmen', 'Calzada Aguilar Batres y 29 calle, zona 12', 12, 1],
    [1214, 'Las Charcas (Dir: Centra Sur)', 'Calzada Aguilar Batres y 32 calle, zona 12', 12, 1],
    [1215, 'Las Charcas (Dir: Plaza Barrios)', 'Calzada Aguilar Batres y 34 calle, zona 12', 12, 1],
    [1216, 'Javier', 'Calzada Aguilar Batres y 38 calle, zona 12 Villa Nueva', 12, 3],
    [1217, 'Monte María', 'Calzada Aguilar Batres y 46 calle, zona 12 Villa Nueva', 12, 3],
    [1218, 'Centra Sur', '21 avenida final, zona 12 Villa Nueva', 12, 3],
    [1301, 'El Calvario', '6ª avenida y 20 calle, zona 1', 13, 1],
    [1302, '4 Grados Sur', '6ª avenida y 24 calle, zona 4', 13, 1],
    [1303, 'Exposición', '6ª avenida y ruta 6, zona 4', 13, 1],
    [1304, 'Terminal', '6ª avenida y 2ª calle, zona 9', 13, 1],
    [1305, 'Industria', '6ª avenida y 6ª calle, zona 9', 13, 1],
    [1306, 'Tívoli', '6ª avenida y 10ª calle, zona 9', 13, 1],
    [1307, 'Montúfar', '6ª avenida y 13 calle, zona 9', 13, 1],
    [1308, 'Acueducto', 'Avenida Hincapié y 4ª calle, zona 13', 13, 1],
    [1309, 'Fuerza Aérea', 'Avenida Hincapié y 11 calle, zona 13', 13, 1],
    [1310, 'Hangares', '15 avenida y 18 calle, zona 13', 13, 1],
    [1311, 'Plaza Argentina', '15 avenida y 11 calle, zona 13', 13, 1],
    [1312, 'Los Arcos', '15 avenida y 4ª calle, zona 13', 13, 1],
    [1313, 'Plaza España', '7ª avenida y 13 calle, zona 9', 13, 1],
    [1314, 'IGSS Zona 9', '7ª avenida y 10ª calle, zona 9', 13, 1],
    [1315, 'Seis 26', '7ª avenida y 5ª calle, zona 9', 13, 1],
    [1316, 'Torre del Reformador', '7ª avenida y 1ª calle, zona 9', 13, 1],
    [1317, 'Plaza de la República', '7ª avenida y ruta 4, zona 4', 13, 1],
    [1318, 'Cantón Exposición', '7ª avenida Ruta 2 y Vía 3, zona 4', 13, 1],
    [1319, 'Banco de Guatemala', '7ª avenida y 22 calle, zona 1', 13, 1],
    [1320, 'Tipografía', '18 calle y 7ª avenida, zona 1', 13, 1],
    [1321, 'Plaza Berlín', 'Plaza Berlín y Avenida Las Américas, zona 13', 13, 1],
    [1322, 'Juan Pablo II', 'Avenida Las Américas y 21 calle, zona 14', 13, 1],
    [1801, 'San Martín (Dir: Plaza Barrios/FEGUA)', '20 avenida y 1ª calle, zona 1', 18, 1],
    [1802, 'San Martín (Dir: Atlántida)', '1ª calle y 18 avenida, zona 1', 18, 1],
    [1803, 'Victorias', 'Avenida Las Victorias y 3ª calle, zona 6', 18, 1],
    [1804, 'Portales', 'KM. 4.5 Carretera al Atlántico 3-20', 18, 1],
    [1805, 'San Rafael', '12 calle y 4ª avenida Colonia San Rafael, zona 18', 18, 1],
    [1806, 'Paraíso', '12 calle y 25 avenida, zona 18', 18, 1],
    [501, 'Parque Colón', '12 avenida 9ª calle, zona 1', 5, 1],
    [502, 'Cipreses (Dir: Parque Colón)', 'Bulevar La Asunción y Arco 3, zona 5', 5, 1],
    [503, 'Cipreses (Dir: P. Penitenciaría)', 'Bulevar La Asunción y 11 calle, zona 5', 5, 1],
    [504, 'Jardines de La Asunción (Dir: Parque Colón)', 'Bulevar La Asunción y Arco 5-6, zona 5', 5, 1],
    [505, 'Jardines de La Asunción (Dir: P. Penitenciaría)', 'Bulevar La Asunción y 12 Calle B, zona 5', 5, 1],
    [506, 'Arrivillaga', 'Bulevar La Asunción y 20 calle, zona 5', 5, 1],
    [507, 'Parque Navidad', '23 calle y 28 avenida, zona 5', 5, 1],
    [508, 'La Palmita', '27 calle y 20 avenida, zona 5', 5, 1],
    [509, 'Palacio De Los Deportes (Dir: Parque Colón)', '10ª avenida y 24 calle, zona 5', 5, 1],
    [510, 'Palacio De Los Deportes (Dir: P. Penitenciaría)', '24 calle y 9ª avenida, zona 5', 5, 1],
    [511, 'Puente de La Penitenciaría', 'Vía 1 y 7ª avenida, zona 4', 5, 1],
    [512, 'Mercado La Palmita', '26 calle y 17 avenida A, zona 5', 5, 1],
    [513, 'Vivibien', 'Diagonal 14 y 23 calle, zona 5', 5, 1],
    [514, 'Matamoros', '7ª calle y 16 avenida, zona 1', 5, 1]
];

async function autoInicializarBD() {
    let connection;
    try {
        console.log("\n⏳ Inicializando base de datos completa con los 17 requerimientos...");
        connection = await oracledb.getConnection(dbConfig);

        const tablas = ['Piloto', 'Bus', 'Parqueo', 'Guardia', 'Acceso', 'Ruta_Linea', 'Estacion', 'Linea', 'Municipalidad'];
        for (const t of tablas) {
            try { await connection.execute(`DROP TABLE ${t} CASCADE CONSTRAINTS`); } catch(e){}
        }

        await connection.execute(`CREATE TABLE Municipalidad (id_municipalidad INT PRIMARY KEY, nombre VARCHAR2(100) NOT NULL)`);
        await connection.execute(`CREATE TABLE Linea (id_linea INT PRIMARY KEY, nombre VARCHAR2(100) NOT NULL, id_municipalidad INT NOT NULL, estado VARCHAR2(40) DEFAULT 'Operativa', CONSTRAINT fk_linea_muni FOREIGN KEY (id_municipalidad) REFERENCES Municipalidad(id_municipalidad))`);
        await connection.execute(`CREATE TABLE Parqueo (id_parqueo INT PRIMARY KEY, nombre VARCHAR2(100) NOT NULL, direccion VARCHAR2(200))`);
        await connection.execute(`CREATE TABLE Estacion (id_estacion INT PRIMARY KEY, nombre VARCHAR2(100) NOT NULL, direccion VARCHAR2(200), id_municipalidad INT NOT NULL, id_parqueo INT NULL, aforo_actual INT DEFAULT 45, capacidad_max INT DEFAULT 100, operador_nombre VARCHAR2(100) DEFAULT 'Operador Estación', CONSTRAINT fk_estacion_muni FOREIGN KEY (id_municipalidad) REFERENCES Municipalidad(id_municipalidad), CONSTRAINT fk_estacion_parqueo FOREIGN KEY (id_parqueo) REFERENCES Parqueo(id_parqueo))`);
        await connection.execute(`CREATE TABLE Ruta_Linea (id_linea INT NOT NULL, id_estacion INT NOT NULL, orden_visita INT NOT NULL, distancia_siguiente_km NUMBER(5,2), PRIMARY KEY (id_linea, id_estacion), CONSTRAINT fk_ruta_linea FOREIGN KEY (id_linea) REFERENCES Linea(id_linea), CONSTRAINT fk_ruta_estacion FOREIGN KEY (id_estacion) REFERENCES Estacion(id_estacion))`);
        await connection.execute(`CREATE TABLE Acceso (id_acceso INT PRIMARY KEY, descripcion VARCHAR2(100), id_estacion INT NOT NULL, CONSTRAINT fk_acceso_estacion FOREIGN KEY (id_estacion) REFERENCES Estacion(id_estacion))`);
        await connection.execute(`CREATE TABLE Guardia (id_guardia INT PRIMARY KEY, nombre VARCHAR2(100) NOT NULL, id_acceso INT NOT NULL, CONSTRAINT fk_guardia_acceso FOREIGN KEY (id_acceso) REFERENCES Acceso(id_acceso))`);
        await connection.execute(`CREATE TABLE Bus (id_bus INT PRIMARY KEY, placa VARCHAR2(20) NOT NULL, capacidad_maxima INT NOT NULL, carga_pasajeros_pct INT DEFAULT 60, id_parqueo INT NOT NULL, id_linea INT NULL, estado VARCHAR2(30) DEFAULT 'Operativo', CONSTRAINT fk_bus_parqueo FOREIGN KEY (id_parqueo) REFERENCES Parqueo(id_parqueo), CONSTRAINT fk_bus_linea FOREIGN KEY (id_linea) REFERENCES Linea(id_linea))`);
        await connection.execute(`CREATE TABLE Piloto (id_piloto INT PRIMARY KEY, nombre VARCHAR2(100) NOT NULL, historial_educativo VARCHAR2(255), residencia VARCHAR2(255), comunicacion VARCHAR2(100), id_bus INT NULL, CONSTRAINT fk_piloto_bus FOREIGN KEY (id_bus) REFERENCES Bus(id_bus))`);

        await connection.execute(`INSERT INTO Municipalidad VALUES (1, 'Municipalidad de Guatemala')`);
        await connection.execute(`INSERT INTO Municipalidad VALUES (2, 'Municipalidad de Mixco')`);
        await connection.execute(`INSERT INTO Municipalidad VALUES (3, 'Municipalidad de Villa Nueva')`);

        const lineas = [[0, 'Transbordo', 1, 'Operativa'], [1, 'Línea 1', 1, 'Operativa'], [2, 'Línea 2', 1, 'Operativa'], [6, 'Línea 6', 1, 'Operativa'], [7, 'Línea 7', 1, 'Operativa'], [12, 'Línea 12', 3, 'Operativa'], [13, 'Línea 13', 1, 'Operativa'], [18, 'Línea 18', 1, 'Operativa'], [5, 'Ruta 5', 1, 'Operativa']];
        for (const l of lineas) { await connection.execute(`INSERT INTO Linea VALUES (:1, :2, :3, :4)`, l); }

        await connection.execute(`INSERT INTO Parqueo VALUES (1, 'Parqueo Centra Sur', 'Zona 12 Villa Nueva')`);
        await connection.execute(`INSERT INTO Parqueo VALUES (2, 'Parqueo FEGUA', 'Zona 1 Guatemala')`);

        let ordenPorLinea = {};
        for (const est of lista120Estaciones) {
            const [id_est, nom, dir, id_lin, id_mun] = est;
            const aforo = Math.floor(Math.random() * 110) + 20; 
            const opNom = `Op. ${nom.substring(0, 10)}`;
            const parqId = (id_est === 1218) ? 1 : null;

            await connection.execute(`INSERT INTO Estacion (id_estacion, nombre, direccion, id_municipalidad, id_parqueo, aforo_actual, capacidad_max, operador_nombre) VALUES (:1, :2, :3, :4, :5, :6, 100, :7)`, [id_est, nom, dir, id_mun, parqId, aforo, opNom]);
            ordenPorLinea[id_lin] = (ordenPorLinea[id_lin] || 0) + 1;
            const dist = parseFloat((Math.random() * 1.2 + 0.4).toFixed(2));
            await connection.execute(`INSERT INTO Ruta_Linea VALUES (:1, :2, :3, :4)`, [id_lin, id_est, ordenPorLinea[id_lin], dist]);
        }

        // Demo accesos y guardias iniciales
        const accesosDemo = [
            [501, 'Acceso Principal Norte', 101, 801, 'Juan Guardado'],
            [502, 'Acceso Correos Central', 102, 802, 'Mario Rivera'],
            [503, 'Acceso Terminal Centra Sur', 1218, 803, 'Carlos Ramírez'],
            [504, 'Acceso USAC Periférico', 701, 804, 'Pedro Mazariegos'],
            [505, 'Acceso Parroquia Zona 6', 601, 805, 'Luis Fernández']
        ];
        for (const a of accesosDemo) {
            await connection.execute(`INSERT INTO Acceso VALUES (:1, :2, :3)`, [a[0], a[1], a[2]]);
            await connection.execute(`INSERT INTO Guardia VALUES (:1, :2, :3)`, [a[3], a[4], a[0]]);
        }

        const busesDemo = [[101, 'TR-1001', 160, 15, 1, 12, 'Operativo'], [102, 'TR-1002', 160, 80, 1, 12, 'Operativo'], [301, 'TR-3001', 120, 10, 2, null, 'Disponible']];
        for (const b of busesDemo) { await connection.execute(`INSERT INTO Bus VALUES (:1, :2, :3, :4, :5, :6, :7)`, b); }

        const pilotosDemo = [[901, 'Juan Pérez', 'Diversificado - Perito Contador', 'Zona 12, Villa Nueva', '5555-1234', 101]];
        for (const p of pilotosDemo) { await connection.execute(`INSERT INTO Piloto VALUES (:1, :2, :3, :4, :5, :6)`, p); }

        await connection.commit();
        console.log("✅ Servidor e inicialización relacional cargados con éxito.");

    } catch (err) {
        console.error("🔴 Error BD:", err.message);
    } finally {
        if (connection) { try { await connection.close(); } catch (e) {} }
    }
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/lineas', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`SELECT l.id_linea AS id_linea, l.nombre AS nombre, NVL(l.estado, 'Operativa') AS estado, m.nombre AS municipalidad, (SELECT COUNT(*) FROM Ruta_Linea rl WHERE rl.id_linea = l.id_linea) AS total_estaciones, (SELECT NVL(SUM(distancia_siguiente_km), 0) FROM Ruta_Linea rl WHERE rl.id_linea = l.id_linea) AS distancia_total_km, (SELECT COUNT(*) FROM Bus b WHERE b.id_linea = l.id_linea) AS buses_asignados FROM Linea l JOIN Municipalidad m ON l.id_municipalidad = m.id_municipalidad ORDER BY l.id_linea ASC`);
        res.json(normalizarFilas(result.rows));
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.post('/api/lineas/:id/estado', async (req, res) => {
    let connection;
    try {
        const { id } = req.params; const { estado } = req.body;
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(`UPDATE Linea SET estado = :estado WHERE id_linea = :id`, { estado, id: parseInt(id) }, { autoCommit: true });
        res.json({ message: `Estado actualizado a: ${estado}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.get('/api/estaciones', async (req, res) => {
    let connection;
    try {
        const { id_linea, buscar } = req.query;
        connection = await oracledb.getConnection(dbConfig);
        let query = `SELECT e.id_estacion AS id_estacion, e.nombre AS nombre, NVL(e.direccion, 'Sin dirección') AS direccion, NVL(l.nombre, 'Sin Línea') AS linea, NVL(rl.id_linea, 0) AS id_linea, NVL(rl.orden_visita, 1) AS orden_visita, NVL(rl.distancia_siguiente_km, 0.8) AS distancia_siguiente_km, m.nombre AS municipalidad, NVL(p.nombre, 'Sin Parqueo') AS parqueo, NVL(e.aforo_actual, 30) AS aforo_actual, NVL(e.capacidad_max, 100) AS capacidad_max, NVL(e.operador_nombre, 'Operador Asignado') AS operador_nombre FROM Estacion e JOIN Municipalidad m ON e.id_municipalidad = m.id_municipalidad LEFT JOIN Parqueo p ON e.id_parqueo = p.id_parqueo LEFT JOIN Ruta_Linea rl ON e.id_estacion = rl.id_estacion LEFT JOIN Linea l ON rl.id_linea = l.id_linea WHERE 1=1`;
        let params = [];
        if (id_linea && id_linea !== 'todas') { query += ` AND rl.id_linea = :${params.length + 1}`; params.push(parseInt(id_linea)); }
        if (buscar && buscar.trim() !== '') { query += ` AND UPPER(e.nombre) LIKE UPPER(:${params.length + 1})`; params.push(`%${buscar.trim()}%`); }
        query += ` ORDER BY rl.orden_visita ASC, e.id_estacion ASC`;
        const result = await connection.execute(query, params);
        res.json(normalizarFilas(result.rows));
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

// Req 2: Asociar estación existente a línea adicional
app.post('/api/estaciones/asociar-linea', async (req, res) => {
    let connection;
    try {
        const { id_estacion, id_linea } = req.body;
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(`INSERT INTO Ruta_Linea (id_linea, id_estacion, orden_visita, distancia_siguiente_km) VALUES (:1, :2, (SELECT NVL(MAX(orden_visita),0)+1 FROM Ruta_Linea WHERE id_linea = :1), 0.75)`, [parseInt(id_linea), parseInt(id_estacion)], { autoCommit: true });
        res.json({ message: `Estación #${id_estacion} vinculada exitosamente a la Línea ${id_linea}.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

// Req 14: Despachar bus de refuerzo
app.post('/api/estaciones/:id/despachar-refuerzo', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await oracledb.getConnection(dbConfig);
        const resEst = await connection.execute(`SELECT rl.id_linea FROM Ruta_Linea rl WHERE rl.id_estacion = :1`, [parseInt(id)]);
        const idLinea = resEst.rows.length > 0 ? (resEst.rows[0].id_linea || resEst.rows[0].ID_LINEA) : 1;
        
        const resBus = await connection.execute(`SELECT id_bus FROM Bus WHERE (estado = 'Disponible' OR id_linea IS NULL) AND ROWNUM = 1`);
        if (resBus.rows.length > 0) {
            const idBus = resBus.rows[0].id_bus || resBus.rows[0].ID_BUS;
            await connection.execute(`UPDATE Bus SET id_linea = :1, estado = 'Operativo' WHERE id_bus = :2`, [parseInt(idLinea), parseInt(idBus)]);
        }

        await connection.execute(`UPDATE Estacion SET aforo_actual = 40 WHERE id_estacion = :1`, [parseInt(id)]);
        await connection.commit();
        res.json({ message: `🚀 Bus de refuerzo despachado a la estación #${id}. Aforo normalizado.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.post('/api/estaciones', async (req, res) => {
    let connection;
    try {
        const { id_estacion, nombre, direccion, id_linea, id_municipalidad, id_parqueo, operador_nombre } = req.body;
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(`INSERT INTO Estacion (id_estacion, nombre, direccion, id_municipalidad, id_parqueo, aforo_actual, capacidad_max, operador_nombre) VALUES (:1, :2, :3, :4, :5, 30, 100, :6)`, [parseInt(id_estacion), nombre, direccion, parseInt(id_municipalidad || 1), id_parqueo ? parseInt(id_parqueo) : null, operador_nombre || 'Operador PC']);
        if (id_linea) {
            await connection.execute(`INSERT INTO Ruta_Linea (id_linea, id_estacion, orden_visita, distancia_siguiente_km) VALUES (:1, :2, (SELECT NVL(MAX(orden_visita),0)+1 FROM Ruta_Linea WHERE id_linea = :1), 0.75)`, [parseInt(id_linea), parseInt(id_estacion)]);
        }
        await connection.commit();
        res.json({ message: 'Estación u Operador guardados con éxito.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

// Req 5: Validación Backend (Regla N a 2N)
app.post('/api/buses', async (req, res) => {
    let connection;
    try {
        const { id_bus, placa, capacidad_maxima, carga_pasajeros_pct, id_parqueo, id_linea, estado } = req.body;
        if (!id_parqueo) return res.status(400).json({ error: 'Un bus no puede quedar sin parqueo (Req. 7).' });
        
        connection = await oracledb.getConnection(dbConfig);

        if (id_linea) {
            const resN = await connection.execute(`SELECT COUNT(*) AS n FROM Ruta_Linea WHERE id_linea = :1`, [parseInt(id_linea)]);
            const N = resN.rows[0].n ?? resN.rows[0].N ?? 0;
            const resB = await connection.execute(`SELECT COUNT(*) AS b FROM Bus WHERE id_linea = :1 AND id_bus != :2`, [parseInt(id_linea), parseInt(id_bus)]);
            const B = resB.rows[0].b ?? resB.rows[0].B ?? 0;

            if (N > 0 && (B + 1) > (2 * N)) {
                return res.status(400).json({ error: `⚠️ Violación de Regla 2N: La Línea ${id_linea} sólo admite un máximo de ${2*N} buses ($2N$).` });
            }
        }

        await connection.execute(`INSERT INTO Bus VALUES (:1, :2, :3, :4, :5, :6, :7)`, [parseInt(id_bus), placa, parseInt(capacidad_maxima), parseInt(carga_pasajeros_pct || 50), parseInt(id_parqueo), id_linea ? parseInt(id_linea) : null, estado || 'Operativo'], { autoCommit: true });
        res.json({ message: 'Bus guardado correctamente.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.put('/api/buses/:id/reasignar', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { id_parqueo, id_linea, estado } = req.body;
        if (!id_parqueo) return res.status(400).json({ error: 'El bus NO puede quedar sin parqueo asignado (Req. 7).' });

        connection = await oracledb.getConnection(dbConfig);

        if (id_linea) {
            const resN = await connection.execute(`SELECT COUNT(*) AS n FROM Ruta_Linea WHERE id_linea = :1`, [parseInt(id_linea)]);
            const N = resN.rows[0].n ?? resN.rows[0].N ?? 0;
            const resB = await connection.execute(`SELECT COUNT(*) AS b FROM Bus WHERE id_linea = :1 AND id_bus != :2`, [parseInt(id_linea), parseInt(id)]);
            const B = resB.rows[0].b ?? resB.rows[0].B ?? 0;

            if (N > 0 && (B + 1) > (2 * N)) {
                return res.status(400).json({ error: `⚠️ No se puede reasignar: Máximo ${2*N} buses permitidos para esta línea ($2N$).` });
            }
        }

        await connection.execute(`UPDATE Bus SET id_parqueo = :1, id_linea = :2, estado = :3 WHERE id_bus = :4`, [parseInt(id_parqueo), id_linea ? parseInt(id_linea) : null, estado || 'Operativo', parseInt(id)], { autoCommit: true });
        res.json({ message: `Bus #${id} reasignado correctamente.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.get('/api/buses', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`SELECT b.id_bus AS id_bus, b.placa AS placa, b.capacidad_maxima AS capacidad_maxima, NVL(b.carga_pasajeros_pct, 50) AS carga_pasajeros_pct, p.id_parqueo AS id_parqueo, p.nombre AS parqueo, NVL(l.nombre, 'Disponible / Sin Línea') AS linea, NVL(b.id_linea, 0) AS id_linea, NVL(b.estado, 'Operativo') AS estado FROM Bus b JOIN Parqueo p ON b.id_parqueo = p.id_parqueo LEFT JOIN Linea l ON b.id_linea = l.id_linea ORDER BY b.id_bus ASC`);
        res.json(normalizarFilas(result.rows));
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.get('/api/parqueos', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`SELECT id_parqueo AS id_parqueo, nombre AS nombre, NVL(direccion, 'Guatemala') AS direccion FROM Parqueo ORDER BY id_parqueo ASC`);
        res.json(normalizarFilas(result.rows));
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.get('/api/municipalidades', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`SELECT id_municipalidad AS id_municipalidad, nombre AS nombre FROM Municipalidad ORDER BY id_municipalidad ASC`);
        res.json(normalizarFilas(result.rows));
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.post('/api/municipalidades', async (req, res) => {
    let connection;
    try {
        const { id_municipalidad, nombre } = req.body;
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(`INSERT INTO Municipalidad VALUES (:1, :2)`, [parseInt(id_municipalidad), nombre], { autoCommit: true });
        res.json({ message: 'Municipalidad guardada exitosamente.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.get('/api/pilotos', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`SELECT p.id_piloto AS id_piloto, p.nombre AS nombre, NVL(p.historial_educativo, 'N/A') AS historial_educativo, NVL(p.residencia, 'N/A') AS residencia, NVL(p.comunicacion, 'N/A') AS comunicacion, NVL(b.placa, 'Sin Bus Asignado') AS bus_asignado FROM Piloto p LEFT JOIN Bus b ON p.id_bus = b.id_bus ORDER BY p.id_piloto ASC`);
        res.json(normalizarFilas(result.rows));
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.post('/api/pilotos', async (req, res) => {
    let connection;
    try {
        const { id_piloto, nombre, historial_educativo, residencia, comunicacion, id_bus } = req.body;
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(`INSERT INTO Piloto VALUES (:1, :2, :3, :4, :5, :6)`, [parseInt(id_piloto), nombre, historial_educativo, residencia, comunicacion, id_bus ? parseInt(id_bus) : null], { autoCommit: true });
        res.json({ message: 'Piloto registrado correctamente.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.get('/api/lineas/:id/accesos', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`SELECT a.id_acceso AS id_acceso, a.descripcion AS descripcion, e.nombre AS estacion, NVL(g.nombre, 'Sin Guardia') AS guardia FROM Acceso a JOIN Estacion e ON a.id_estacion = e.id_estacion JOIN Ruta_Linea rl ON e.id_estacion = rl.id_estacion LEFT JOIN Guardia g ON a.id_acceso = g.id_acceso WHERE rl.id_linea = :1 ORDER BY e.nombre ASC`, [parseInt(id)]);
        res.json(normalizarFilas(result.rows));
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.post('/api/accesos', async (req, res) => {
    let connection;
    try {
        const { id_acceso, descripcion, id_estacion, nombre_guardia } = req.body;
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(`INSERT INTO Acceso VALUES (:1, :2, :3)`, [parseInt(id_acceso), descripcion, parseInt(id_estacion)]);
        if (nombre_guardia) {
            const id_guardia = Math.floor(Math.random() * 9000) + 1000;
            await connection.execute(`INSERT INTO Guardia VALUES (:1, :2, :3)`, [id_guardia, nombre_guardia, parseInt(id_acceso)]);
        }
        await connection.commit();
        res.json({ message: 'Acceso y Guardia por acceso asignados.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.delete('/api/estaciones/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(`DELETE FROM Ruta_Linea WHERE id_estacion = :1`, [parseInt(id)]);
        await connection.execute(`DELETE FROM Estacion WHERE id_estacion = :1`, [parseInt(id)]);
        await connection.commit();
        res.json({ message: 'Estación eliminada correctamente.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
    finally { if (connection) await connection.close(); }
});

app.listen(PORT, async () => {
    console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
    await autoInicializarBD();
});