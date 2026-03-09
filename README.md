# Express API — Mongoose + TypeScript In Depth

API REST construida con **Node.js**, **Express**, **TypeScript** y **Mongoose** que gestiona dos entidades principales: `Organizacion` y `Usuario`.

---

## Tecnologías

| Paquete | Versión | Uso |
|---|---|---|
| express | ^4.17.3 | Framework HTTP |
| mongoose | ^6.13.9 | ODM para MongoDB |
| joi | ^17.6.0 | Validación de esquemas en peticiones |
| dotenv | ^16.0.0 | Variables de entorno |
| cors | ^2.8.6 | Política de acceso cruzado |
| chalk | ^4.1.2 | Logging con color en consola |
| typescript | ^4.5.5 | Tipado estático (devDependency) |

---

## Estructura del proyecto

```
src/
├── server.ts              # Punto de entrada: conexión a Mongo e inicio del servidor
├── swagger.ts              # Configuración del swagger
├── config/
│   └── config.ts          # Configuración de variables de entorno (Mongo + puerto)
├── library/
│   └── Logging.ts         # Utilidad de logging con colores (INFO / WARN / ERROR)
├── middleware/
│   └── Joi.ts             # Validación de payloads con Joi + schemas de cada entidad
├── models/
│   ├── Organizacion.ts    # Esquema/Modelo Mongoose de Organizacion
│   └── Usuario.ts         # Esquema/Modelo Mongoose de Usuario
├── controllers/
│   ├── Organizacion.ts    # Lógica CRUD de Organizacion
│   └── Usuario.ts         # Lógica CRUD de Usuario
└── routes/
    ├── Organizacion.ts    # Definición de rutas de Organizacion
    └── Usuario.ts         # Definición de rutas de Usuario
```

---

## Descripción de cada archivo

### `src/server.ts`
Punto de entrada de la aplicación. Se encarga de:
1. Conectar a MongoDB mediante Mongoose.
2. Si la conexión es exitosa, inicia el servidor HTTP.
3. Registra middlewares globales: logging de peticiones/respuestas, CORS, body parsers.
4. Monta las rutas bajo los prefijos `/organizaciones` y `/usuarios`.
5. Expone un healthcheck en `GET /ping`.
6. Gestiona respuestas 404 para rutas no encontradas.

---

### `src/config/config.ts`
Lee las variables de entorno mediante `dotenv` y exporta el objeto `config` con dos secciones:
- `mongo.url` — URI de conexión a MongoDB.
- `server.port` — Puerto del servidor HTTP (por defecto `1337`).

---

### `src/library/Logging.ts`
Clase estática `Logging` con tres métodos de salida en consola, cada uno con un color diferente gracias a `chalk`:
| Método | Color | Uso |
|---|---|---|
| `Logging.info()` | Azul | Información general |
| `Logging.warning()` | Amarillo | Advertencias |
| `Logging.error()` | Rojo | Errores |

---

### `src/middleware/Joi.ts`
Contiene dos exportaciones:

- **`ValidateJoi(schema)`** — Middleware de orden superior que recibe un esquema Joi, valida el `req.body` y, si falla, devuelve `422 Unprocessable Entity`.
- **`Schemas`** — Objeto con los esquemas de validación de cada entidad:
  - `Schemas.organizacion.create` / `.update` → valida `{ name: string }`.
  - `Schemas.usuario.create` / `.update` → valida `{ name: string, email: string, password: string (min 6), organizacion: ObjectId (24 hex) }`.

---

### `src/models/Organizacion.ts`
Define el modelo Mongoose `Organizacion` con la siguiente estructura:

| Campo | Tipo | Requerido |
|---|---|---|
| `_id` | ObjectId | Sí (auto) |
| `name` | String | Sí |

Interfaces TypeScript exportadas: `IOrganizacion`, `IOrganizacionModel`.

---

### `src/models/Usuario.ts`
Define el modelo Mongoose `Usuario` con la siguiente estructura:

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `_id` | ObjectId | Sí (auto) | |
| `name` | String | Sí | |
| `email` | String | Sí | Único |
| `password` | String | Sí | |
| `organizacion` | ObjectId | Sí | Referencia a `Organizacion` |
| `createdAt` | Date | Auto | Generado por `timestamps: true` |
| `updatedAt` | Date | Auto | Generado por `timestamps: true` |

Interfaces TypeScript exportadas: `IUsuario`, `IUsuarioModel`.

---

### `src/services/Organizacion.ts` y `src/services/Usuario.ts`
Contienen la **lógica de negocio** y las llamadas directas a Mongoose. Es la capa encargada de interactuar con la persistencia de datos.


---

### `src/controllers/Organizacion.ts` y `src/controllers/Usuario.ts`
Gestionan el protocolo HTTP. Reciben los datos del `Request`, llaman a la capa de **Service** correspondiente y devuelven la respuesta en el `Response` con el código de estado adecuado. No conocen los detalles de implementación de la base de datos.

---

### `src/routes/Organizacion.ts` y `src/routes/Usuario.ts`
Registran los endpoints de cada recurso con sus middlewares de validación Joi correspondientes y delegan la lógica al controlador.

---

## Configuración de MongoDB

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
MONGO_URI="mongodb://localhost:27017/sem1"
SERVER_PORT="1337"
```

La variable crítica es `MONGO_URI`. La base de datos usada por defecto es **`sem1`**.

---

## Endpoints de la API

El servidor corre en `http://localhost:1337` por defecto. La documentación interactiva está disponible en `/api`.

### General

| Método | URL | Descripción |
|---|---|---|
| `GET` | `/ping` | Healthcheck — devuelve `{ "hello": "world" }` |

---

### Organizaciones — `/organizaciones`

| Método | URL | Body (JSON) | Validación | Descripción | Respuesta éxito |
|---|---|---|---|---|---|
| `POST` | `/` | `{ "name": "string" }` | Joi required | Crea una nueva organización | `201` |
| `GET` | `/` | — | — | Lista todas las organizaciones | `200` |
| `GET` | `/:organizacionId` | — | — | Obtiene una organización por ID | `200` |
| `PUT` | `/:organizacionId` | `{ "name": "string" }` | Joi required | Actualiza el nombre de una organización | `201` |
| `DELETE` | `/:organizacionId` | — | — | Elimina una organización por ID | `201` |

---

### Usuarios — `/usuarios`

| Método | URL | Body (JSON) | Validación | Descripción | Respuesta éxito |
|---|---|---|---|---|---|
| `POST` | `/` | `{ "name": string, "email": string, "password": password, "organizacion": "ObjectId" }` | Joi required | Crea un nuevo usuario | `201` |
| `GET` | `/` | — | — | Lista todos los usuarios | `200` |
| `GET` | `/:usuarioId` | — | — | Obtiene un usuario por ID (con populate de organización) | `200` |
| `PUT` | `/:usuarioId` | `{ "name": string, ... }` | Joi required | Actualiza los datos de un usuario | `201` |
| `DELETE` | `/:usuarioId` | — | — | Elimina un usuario por ID | `201` |

---

## 🎓 Ejercicio de Seminario

En la carpeta `ejercicio-seminario/` encontrarás material didáctico sobre cómo implementar relaciones entre modelos en Mongoose (Manual vs Virtuals). 

---

## Uso de Inteligencia Artificial

En el desarrollo de este proyecto, se ha utilizado inteligencia artificial (IA) en las siguientes secciones del código, como se indica en los comentarios correspondientes:

- **src/services/Organizacion.ts** (línea 34): Autocompletado con IA para la función `getOrganizacionWithUsers`.
- **src/services/Usuario.ts** (línea 12): Ayuda de IA utilizada para añadir la lógica de actualización de la organización al crear un nuevo usuario.
- **src/services/Usuario.ts** (línea 25): Ayuda de IA utilizada para actualizar las relaciones al cambiar de organización.
- **src/routes/Organizacion.ts** (línea 105): Espacio hecho con IA para la documentación OpenAPI.

---

## Instalación y ejecución

```bash
# Instalar dependencias 
npm install

# Iniciar el servidor
npm start
```

Para compilar manualmente:
```bash
npx tsc
```
