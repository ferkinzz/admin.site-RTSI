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

## Reglas de Seguridad

Las reglas de seguridad para estas colecciones se encuentran en el archivo `firestore.rules` en la raíz del proyecto. Es crucial aplicar estas reglas en la consola de Firebase para proteger la base de datos contra accesos no autorizados.
