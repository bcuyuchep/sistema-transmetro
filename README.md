# Sistema de Control de Transmetro y Municipalidades Aledañas

## Descripción

El **Sistema de Control de Transmetro y Municipalidades Aledañas** es una aplicación web desarrollada para apoyar la administración y control de las operaciones relacionadas con las líneas, estaciones, buses, parqueos, municipalidades y personal asociado al servicio de transporte.

El sistema centraliza la información en una base de datos **PostgreSQL** y permite realizar diferentes operaciones desde una interfaz web, facilitando la consulta y actualización de los datos operativos.

La aplicación se encuentra desplegada en la nube mediante **Render** y el código fuente se administra utilizando **Git y GitHub**.

---

## Objetivo del proyecto

Desarrollar una aplicación web que permita gestionar de forma centralizada la información operativa de Transmetro y las municipalidades relacionadas, proporcionando herramientas para el registro, consulta, asignación, control y generación de reportes.

---

## Tecnologías utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API
- html2pdf.js

### Backend

- Node.js
- Express.js
- JavaScript
- API REST

### Base de datos

- PostgreSQL

### Herramientas y servicios

- Visual Studio Code
- Git
- GitHub
- Render
- npm
- dotenv
- pg

---

## Arquitectura general

El proyecto utiliza una arquitectura cliente-servidor.

```text
Usuario
   │
   ▼
Navegador Web
HTML + CSS + JavaScript
   │
   │ HTTP / HTTPS
   ▼
Node.js + Express
API REST
   │
   ▼
PostgreSQL
```

El navegador realiza solicitudes mediante la API REST desarrollada con Node.js y Express. El servidor procesa las solicitudes y se comunica con PostgreSQL para consultar, registrar o actualizar la información.

---

## Funcionalidades principales

### Gestión de estaciones

Permite:

- Registrar nuevas estaciones.
- Consultar estaciones existentes.
- Asociar una estación a una línea.
- Establecer el orden de visita.
- Registrar la distancia hacia la siguiente estación.
- Asignar parqueo.
- Registrar operador de PC.
- Filtrar estaciones por línea.

### Gestión de líneas

El sistema permite administrar las líneas de Transmetro y visualizar:

- Identificador de línea.
- Nombre.
- Municipalidad.
- Número de estaciones.
- Distancia total del recorrido.
- Estado operativo.
- Cantidad de buses asignados.

### Gestión de municipalidades

Permite:

- Registrar municipalidades.
- Consultar municipalidades.
- Buscar por ID o nombre.
- Eliminar registros cuando corresponda.

### Accesos y guardias

Permite administrar los accesos correspondientes a las estaciones.

Cada acceso puede almacenar:

- ID del acceso.
- Estación.
- Descripción.
- Guardia asignado.

También es posible consultar los accesos correspondientes a una línea.

### Gestión de buses

El módulo de buses permite:

- Registrar buses.
- Registrar ficha o placa.
- Definir capacidad máxima.
- Registrar carga de pasajeros.
- Asignar parqueo.
- Asignar una línea.
- Reasignar buses.
- Consultar el inventario completo.

### Regla operativa N-2N

El sistema calcula la cantidad de buses correspondiente a cada línea tomando como referencia el número de estaciones.

Se muestran:

- Número de estaciones (N).
- Mínimo requerido.
- Máximo permitido (2N).
- Buses actualmente asignados.
- Estado de cumplimiento.

Esto permite identificar situaciones de falta de flota o sobrefrecuencia.

### Gestión de pilotos

El sistema mantiene información de los pilotos:

- ID.
- Nombre completo.
- Historial educativo.
- Residencia.
- Información de contacto.
- Unidad asignada.

### Control de aforo

El módulo permite consultar el nivel de ocupación de las estaciones.

Se muestran:

- Estación.
- Línea.
- Aforo actual.
- Capacidad máxima.
- Porcentaje de ocupación.
- Estado de alerta.

El sistema identifica estaciones con alta afluencia y permite manejar situaciones que requieren unidades de refuerzo.

### Monitoreo GPS

El sistema presenta un monitor operativo con información relacionada con:

- Orden de estación.
- Estación.
- Línea.
- Próximo bus.
- Carga de la unidad.
- Tiempo estimado.
- Estado de espera.

### Reportes

El sistema cuenta con un módulo de **Reportes Operativos Oficiales**.

Los reportes permiten consultar información relacionada con:

- Líneas.
- Estaciones.
- Orden de recorrido.
- Distancias.
- Operadores.
- Municipalidades.
- Información de buses asignados.

