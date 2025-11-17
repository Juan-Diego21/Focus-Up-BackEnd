# Focus Up Database Schema - Reports System

## Table Relationships and Field Mappings

This document outlines the exact database schema relationships and field mappings for the Focus Up application's reports system.

### Core Tables

#### 1. `usuario`

Primary user table containing user information.

#### 2. `bibliotecametodosestudio`

Study methods library table.

#### 3. `musica`

Music tracks table.

#### 4. `metodos_realizados`

Records of study methods performed by users.

#### 5. `sesiones_concentracion_realizadas`

Records of concentration sessions performed by users.

### Foreign Key Relationships

#### `metodos_realizados` Relationships:

- `id_usuario` → `usuario.id_usuario`
- `id_metodo` → `bibliotecametodosestudio.id_metodo`

#### `sesiones_concentracion_realizadas` Relationships:

- `id_metodo_realizado` → `metodos_realizados.id_metodo_realizado`
- `id_cancion` → `musica.id_cancion`

**Note**: Sessions belong to users indirectly through the `metodo_realizado` relationship. A session is associated with a study method that belongs to a user.

### Table Schemas

#### `metodos_realizados`

```sql
CREATE TABLE metodos_realizados (
  id_metodo_realizado SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
  id_metodo INTEGER NOT NULL REFERENCES bibliotecametodosestudio(id_metodo),
  progreso INTEGER DEFAULT 0 CHECK (progreso IN (0, 50, 100)),
  estado VARCHAR(20) DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completado', 'cancelado')),
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `sesiones_concentracion_realizadas`

```sql
CREATE TABLE sesiones_concentracion_realizadas (
  id_sesion_realizada SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
  id_metodo_realizado INTEGER REFERENCES metodos_realizados(id_metodo_realizado),
  id_cancion INTEGER REFERENCES musica(id_cancion),
  duracion INTEGER,
  fecha_programada TIMESTAMP,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completada', 'cancelada')),
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Response Structures

#### GET `/api/v1/reports` Response

```json
{
  "success": true,
  "data": {
    "metodos": [
      {
        "id": 1,
        "metodo": {
          "id": 1,
          "nombre": "Método Pomodoro",
          "descripcion": "Técnica de estudio por intervalos"
        },
        "progreso": 50,
        "estado": "en_progreso",
        "fechaInicio": "2023-12-01T10:00:00Z",
        "fechaFin": null,
        "fechaCreacion": "2023-12-01T09:00:00Z"
      }
    ],
    "sesiones": [
      {
        "id": 1,
        "musica": {
          "id": 1,
          "nombre": "Focus Music",
          "artista": "Ambient Sounds",
          "genero": "Ambient"
        },
        "duracion": 1800,
        "fechaProgramada": "2023-12-01T10:00:00Z",
        "estado": "completada",
        "fechaInicio": "2023-12-01T10:00:00Z",
        "fechaFin": "2023-12-01T10:30:00Z",
        "fechaCreacion": "2023-12-01T09:00:00Z"
      }
    ]
  }
}
```

### Business Rules

1. **Multiple Active Methods**: Users can have multiple methods in `en_progreso` state simultaneously. Each method session is independent and identified by its unique `id_metodo_realizado`.
2. **Progress States**: Methods support 0% (started), 50% (halfway), 100% (completed) for Pomodoro; 20%, 40%, 60%, 80%, 100% for Mind Maps.
3. **Automatic Completion**: Methods automatically complete when progress reaches 100%.
4. **Session States**: Sessions transition from `pendiente` → `en_proceso` → `completada`.
5. **Resume Capability**: Incomplete methods and sessions can be resumed using their specific session IDs.
6. **Data Integrity**: All foreign key relationships must be maintained.

### JOIN Queries Used

#### Methods with Study Method Details:

```sql
SELECT mr.*, bme.nombre_metodo, bme.descripcion
FROM metodos_realizados mr
JOIN bibliotecametodosestudio bme ON mr.id_metodo = bme.id_metodo
WHERE mr.id_usuario = ?
ORDER BY mr.fecha_creacion DESC
```

#### Sessions with Music Details:

```sql
SELECT scr.*, m.nombre_cancion, m.artista_cancion, m.genero_cancion
FROM sesiones_concentracion_realizadas scr
LEFT JOIN musica m ON scr.id_cancion = m.id_cancion
WHERE scr.id_usuario = ?
ORDER BY scr.fecha_creacion DESC
```

### Testing

Run the reports API tests:

```bash
npm run test:reports
```

This will test all endpoints and verify that:

- No "column does not exist" errors occur
- Proper JSON responses are returned
- Authentication works correctly
- Data relationships are maintained
