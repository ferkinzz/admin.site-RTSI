# Admin .Site - La Base para tu Imperio de Contenido

[![Desarrollado por rtsi.site](https://img.shields.io/badge/Desarrollado%20por-rtsi.site-blue?style=for-the-badge&logo=rocket)](https://rtsi.site)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Visita el Producto](https://img.shields.io/badge/Ver%20Producto-y%20Planes-orange?style=for-the-badge&logo=buy-me-a-coffee)](https://rtsi.site/tools/admin-site)


Bienvenido a **Admin .Site**, un panel de administración moderno, robusto y escalable construido con Next.js y Firebase. Este proyecto sirve como el kit de inicio fundamental para un potente SaaS de gestión de contenidos, diseñado y desarrollado por [rtsi.site](https://rtsi.site).

Esto no es solo una plantilla; es una plataforma de lanzamiento. Proporciona todas las características esenciales que necesitas para gestionar contenido de manera eficiente, con un enfoque en la experiencia del desarrollador, el rendimiento y la seguridad.

## ✨ Características

-   **Autenticación**: Sistema de inicio de sesión seguro impulsado por Firebase Authentication, con un flujo de configuración único para el primer administrador.
-   **Base de Datos**: Gestión de datos en tiempo real con Firestore para artículos, perfiles de usuario y configuración de la aplicación.
-   **Subida de Archivos e Imágenes**: Sube imágenes y archivos directamente a Firebase Storage, con generación de enlaces en formato Markdown.
-   **Stack Tecnológico Moderno**: Construido con Next.js 15 (App Router), React y TypeScript para una aplicación robusta y de alto rendimiento.
-   **UI Atractiva**: Una interfaz de usuario limpia y responsiva creada con ShadCN UI y Tailwind CSS.
-   **Editor Markdown**: Un editor de contenido enriquecido con soporte para Markdown y una pestaña de vista previa en vivo.
-   **Despliegue Automatizado**: Preconfigurado para un despliegue sin interrupciones en Firebase App Hosting a través de GitHub.

## 🚀 Cómo Empezar

Sigue estos pasos para tener una copia local funcionando en tu propio proyecto de Firebase.



## ☁️ Despliegue

Este proyecto está preconfigurado para un despliegue fácil en **Firebase App Hosting**.

1.  **Sube a GitHub**: Asegúrate de que tu proyecto esté en un repositorio de GitHub.
2.  **Conecta con Firebase App Hosting**:
    -   En la Consola de Firebase, ve a **Build > App Hosting**.
    -   Haz clic en **"Empezar"** y sigue el asistente para conectar tu cuenta de GitHub y tu repositorio.
3.  **Configura las Variables del Backend**:
    -   Después de conectar tu repositorio, App Hosting creará un backend.
    -   Ve a la configuración del backend y añade todas las mismas variables `NEXT_PUBLIC_...` que definiste en tu archivo `.env`.
4.  **Despliega**:
    -   Tu archivo `apphosting.yaml` ya está configurado para compilar tu aplicación Next.js y desplegar tus reglas de seguridad (`firestore.rules` y `storage.rules`).
    -   Haz commit y push de tus cambios a la rama de GitHub conectada para activar un nuevo despliegue.

Firebase App Hosting compilará y desplegará automáticamente tu aplicación.

---

Desarrollado con ❤️ por [rtsi.site](https://rtsi.site).
