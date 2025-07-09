# Documentación del Esquema de la Base de Datos (Firestore)

Este documento detalla la estructura de las colecciones y los datos almacenados en la base de datos de Firestore para la aplicación "Admin .Site".

## Colección: `articles`

Esta colección almacena todos los artículos, blogs, recursos y otros tipos de contenido creados a través del panel de administración.

-   **Document ID**: Un ID único generado automáticamente por Firestore.

### Campos del Documento

| Campo              | Tipo de Dato        | Descripción                                                                                               |
| ------------------ | ------------------- | --------------------------------------------------------------------------------------------------------- |
| `title`            | `string`            | El título principal del artículo.                                                                         |
| `body`             | `string`            | El contenido completo del artículo, escrito en formato Markdown.                                          |
| `status`           | `string`            | El estado de publicación. Puede ser `"draft"` (borrador) o `"published"` (publicado).                       |
| `createdAt`        | `Timestamp`         | La fecha y hora de creación del artículo. Se genera automáticamente.                                      |
| `updatedAt`        | `Timestamp`         | La fecha y hora de la última actualización. Se actualiza automáticamente en cada guardado.                  |
| `slug`             | `string`            | La URL amigable generada a partir del título, con el formato `/{mes}-{dia}-{titulo-sanitizado}`.           |
| `authorId`         | `string`            | El UID (ID de usuario) del autor que creó o editó el artículo. Se guarda automáticamente.                 |
| `authorEmail`      | `string`            | El correo electrónico del autor. Se guarda automáticamente.                                               |
| `imageUrl`         | `string`            | URL de la imagen destacada subida a Firebase Storage.                                                     |
| `imageUrl1`        | `string`            | URL de la primera imagen adicional.                                                                       |
| `imageUrl2`        | `string`            | URL de la segunda imagen adicional.                                                                       |
| `fileUrl`          | `string`            | URL del archivo adjunto subido a Firebase Storage.                                                        |
| `fileName`         | `string`            | El nombre original del archivo adjunto.                                                                   |
| `articleType`      | `string`            | El tipo de contenido seleccionado: `"blog"`, `"resource"`, `"video"`, u `"other"`.                        |
| `otherArticleType` | `string`            | Si `articleType` es `"other"`, este campo almacena el tipo personalizado especificado por el usuario.     |
| `categories`       | `Array<string>`     | Una lista de categorías asociadas al artículo, solo si `articleType` es `"blog"`.                         |

## Colección: `profiles`

Esta colección almacena la información del perfil público de cada usuario/autor.

-   **Document ID**: El UID del usuario de Firebase Authentication. Esto asegura que cada usuario tenga un único documento de perfil.

### Campos del Documento

| Campo         | Tipo de Dato | Descripción                                                                              |
| ------------- | ------------ | ---------------------------------------------------------------------------------------- |
| `displayName` | `string`     | El nombre público que el usuario elige para mostrar.                                     |
| `bio`         | `string`     | Una breve biografía o descripción del autor.                                             |
| `website`     | `string`     | La URL del sitio web personal o profesional del autor.                                   |
| `email`       | `string`     | El correo electrónico del usuario. Se guarda automáticamente desde su cuenta de Firebase. |
| `authorId`    | `string`     | El UID del usuario. Se guarda de forma silenciosa para consistencia.                     |
| `photoURL`    | `string`     | URL de la foto de perfil subida a Firebase Storage.                                    |

## Colección: `users`

Esta colección almacena información esencial del usuario, principalmente para la gestión de roles.

-   **Document ID**: El UID del usuario de Firebase Authentication.

### Campos del Documento

| Campo   | Tipo de Dato | Descripción                                                                              |
| ------- | ------------ | ---------------------------------------------------------------------------------------- |
| `email` | `string`     | El correo electrónico del usuario. Se guarda automáticamente desde su cuenta de Firebase. |
| `role`  | `string`     | El rol del usuario dentro de la aplicación (ej. `"Admin"`, `"Redactor"`, `"Redactor Jr."`). |

## Colección: `invitations`

Esta colección almacena las invitaciones de un solo uso para registrar nuevos usuarios.

-   **Document ID**: Un token único generado automáticamente que se usa en el enlace de invitación.

### Campos del Documento

| Campo          | Tipo de Dato | Descripción                                                                       |
| -------------- | ------------ | --------------------------------------------------------------------------------- |
| `email`        | `string`     | El correo electrónico del usuario invitado.                                       |
| `role`         | `string`     | El rol que se asignará al usuario una vez que se registre.                        |
| `createdAt`    | `Timestamp`  | La fecha y hora en que se creó la invitación. Se genera automáticamente.        |
| `used`         | `boolean`    | Un indicador para marcar si la invitación ya ha sido utilizada. Empieza en `false`. |
| `creatorId`    | `string`     | El UID del administrador que generó la invitación.                                |
| `creatorEmail` | `string`     | El correo del administrador que generó la invitación.                             |

## Colección: `siteConfig`

Esta colección almacena la configuración global para el sitio. Se espera que contenga un único documento.

-   **Document ID**: `default-site`

### Campos del Documento

| Campo                  | Tipo de Dato | Descripción                                                                                   |
| ---------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `siteName`             | `string`     | El nombre del sitio que se muestra en el panel y en el título de la pestaña del navegador.     |
| `deployHookUrl`        | `string`     | La URL del webhook a la que se llamará para activar un nuevo despliegue al publicar contenido. |
| `siteUrl`              | `string`     | La URL pública principal de tu sitio (ej. https://mi-sitio.com).                                |
| `blogPath`             | `string`     | La ruta base para los artículos de blog (ej. `/blog`).                                        |
| `resourcesPath`        | `string`     | La ruta base para los recursos (ej. `/recursos`).                                             |
| `videosPath`           | `string`     | La ruta base para los videos (ej. `/videos`).                                                 |
| `otherPath`            | `string`     | La ruta base para otro tipo de contenido (ej. `/archivo`).                                    |
| `aiSiteDescription`    | `string`     | Descripción breve del sitio para el contexto de la IA.                                        |
| `aiTargetAudience`     | `string`     | El público objetivo del sitio para el contexto de la IA.                                      |
| `aiKeyProducts`        | `string`     | Productos, servicios o temas clave para el contexto de la IA.                                 |
| `aiForbiddenTopics`    | `string`     | Temas o palabras que la IA debe evitar.                                                       |

## Colección: `customContentTypes`

Esta colección almacena los tipos de contenido personalizados creados por los usuarios para que puedan ser reutilizados.

-   **Document ID**: Un ID único generado automáticamente por Firestore.

### Campos del Documento

| Campo       | Tipo de Dato | Descripción                                      |
| ----------- | ------------ | ------------------------------------------------ |
| `name`      | `string`     | El nombre del tipo de contenido personalizado.   |
| `createdAt` | `Timestamp`  | La fecha y hora de creación del tipo.            |

## Colección: `license`

Esta colección almacena un identificador único para la instalación, vinculado al primer administrador.

-   **Document ID**: Un ID único generado automáticamente por Firestore.

### Campos del Documento

| Campo | Tipo de Dato | Descripción                                                            |
| ----- | ------------ | ---------------------------------------------------------------------- |
| `uid` | `string`     | El UID del primer usuario administrador que configuró la aplicación.      |

## Colección: `publicConfig`

Esta colección almacena la configuración pública accesible sin autenticación.

-   **Document ID**: `main`

### Campos del Documento

| Campo         | Tipo de Dato | Descripción                                                            |
| ------------- | ------------ | ---------------------------------------------------------------------- |
| `loginLogoUrl`| `string`     | La URL del logo que se mostrará en la página de inicio de sesión.      |


## Reglas de Seguridad

Las reglas de seguridad para estas colecciones se encuentran en el archivo `firestore.rules` en la raíz del proyecto. Es crucial aplicar estas reglas en la consola de Firebase para proteger la base de datos contra accesos no autorizados.
