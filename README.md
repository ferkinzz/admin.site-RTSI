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
-   **PWA (Progressive Web App)**: La aplicación se puede instalar en dispositivos de escritorio y móviles para un acceso rápido.
-   **Modelo de Seguridad y Licenciamiento**: Diseñado para proyectos de código fuente abierto con características premium. [Ver modelo de seguridad](./docs/security_model.md).

## 🚀 Cómo Empezar

Sigue estos pasos para tener una copia local funcionando en tu propio proyecto de Firebase.

### Prerrequisitos

-   [Node.js](https://nodejs.org/en/) (v20 o posterior)
-   Una cuenta de Google para crear un [Proyecto de Firebase](https://firebase.google.com/)

### 1. Clona el Repositorio

Primero, clona este repositorio en tu máquina local:

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 2. Instala las Dependencias

Instala las dependencias del proyecto usando npm:

```bash
npm install
```

### 3. Configura tu Proyecto de Firebase

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/) y haz clic en **"Añadir proyecto"**.
2.  Sigue las instrucciones en pantalla para crear tu proyecto.
3.  En tu nuevo proyecto, navega a la sección **Build** en la barra lateral izquierda.
4.  Habilita **Authentication**:
    -   Ve a la página de **Authentication**.
    -   Haz clic en **"Empezar"**.
    -   En "Método de inicio de sesión", selecciona **Correo electrónico/Contraseña** y habilítalo.
5.  Habilita **Firestore Database**:
    -   Ve a la página de **Firestore Database**.
    -   Haz clic en **"Crear base de datos"**.
    -   Inicia en **modo de producción**.
    -   Elige una ubicación para tu base de datos.
6.  Habilita **Storage**:
    -   Ve a la página de **Storage**.
    -   Haz clic en **"Empezar"**.
    -   Sigue las indicaciones, usando las reglas de seguridad predeterminadas por ahora (desplegaremos las nuestras más tarde).

### 4. Configura las Variables de Entorno

1.  En la raíz de tu proyecto, crea un nuevo archivo llamado `.env`.
2.  Encuentra la configuración de tu aplicación web de Firebase:
    -   En tu proyecto de Firebase, ve a **Configuración del proyecto** (el icono del engranaje).
    -   En la pestaña "General", desplázate hacia abajo hasta "Tus aplicaciones".
    -   Haz clic en el icono **Web** (`</>`) para crear una nueva aplicación web.
    -   Dale un apodo y registra la aplicación.
    -   Firebase te proporcionará un objeto `firebaseConfig`. Usa estos valores para rellenar tu archivo `.env`.

Tu archivo `.env` debería verse así:

```
# Configuración de la Aplicación Web de Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...

# La URL pública de tu sitio en producción (opcional para desarrollo local)
NEXT_PUBLIC_SITE_URL=https://tu-sitio-en-produccion.com

# Clave API de Google AI (Gemini) para funciones de IA (opcional)
# Obtenla en Google AI Studio: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=...
```

### 5. Ejecuta el Servidor de Desarrollo

Ahora, puedes iniciar el servidor de desarrollo local:

```bash
npm run dev
```

Abre [http://localhost:9002](http://localhost:9002) en tu navegador.

La primera vez que ejecutes la aplicación, se te pedirá que crees la **primera cuenta de administrador**. Una vez creada esta cuenta, la aplicación cambiará a la pantalla de inicio de sesión estándar para todas las visitas posteriores.

## ☁️ Despliegue

Este proyecto está preconfigurado para un despliegue fácil en **Firebase App Hosting**.

1.  **Sube a GitHub**: Asegúrate de que tu proyecto esté en un repositorio de GitHub.
2.  **Conecta con Firebase App Hosting**:
    -   En la Consola de Firebase, ve a **Build > App Hosting**.
    -   Haz clic en **"Empezar"** y sigue el asistente para conectar tu cuenta de GitHub y tu repositorio.
3.  **Configura las Variables del Backend**:
    -   Después de conectar tu repositorio, App Hosting creará un backend.
    -   Ve a la configuración del backend y añade todas las mismas variables `NEXT_PUBLIC_...` que definiste en tu archivo `.env`.
    -   **Importante**: También debes añadir `GEMINI_API_KEY` como una variable de backend, marcándola como un "Secreto".
4.  **Despliega**:
    -   Tu archivo `apphosting.yaml` ya está configurado para compilar tu aplicación Next.js y desplegar tus reglas de seguridad (`firestore.rules` y `storage.rules`).
    -   Haz commit y push de tus cambios a la rama de GitHub conectada para activar un nuevo despliegue.

Firebase App Hosting compilará y desplegará automáticamente tu aplicación.

---

Desarrollado con ❤️ por [rtsi.site](https://rtsi.site).
