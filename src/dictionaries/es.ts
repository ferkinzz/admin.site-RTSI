
import type { Dictionary } from '@/types';

const databaseSchemaMarkdownEs = `
## Colección: \`articles\`

Esta colección almacena todos los artículos, blogs, recursos y otros tipos de contenido creados a través del panel de administración.

-   **Document ID**: Un ID único generado automáticamente por Firestore.

### Campos del Documento

| Campo              | Tipo de Dato        | Descripción                                                                                               |
| ------------------ | ------------------- | --------------------------------------------------------------------------------------------------------- |
| \`title\`            | \`string\`            | El título principal del artículo.                                                                         |
| \`body\`             | \`string\`            | El contenido completo del artículo, escrito en formato Markdown.                                          |
| \`status\`           | \`string\`            | El estado de publicación. Puede ser \`"draft"\` (borrador) o \`"published"\` (publicado).                       |
| \`createdAt\`        | \`Timestamp\`         | La fecha y hora de creación del artículo. Se genera automáticamente.                                      |
| \`updatedAt\`        | \`Timestamp\`         | La fecha y hora de la última actualización. Se actualiza automáticamente en cada guardado.                  |
| \`slug\`             | \`string\`            | La URL amigable generada a partir del título, con el formato \`/{mes}-{dia}-{titulo-sanitizado}\`.           |
| \`authorId\`         | \`string\`            | El UID (ID de usuario) del autor que creó o editó el artículo. Se guarda automáticamente.                 |
| \`authorEmail\`      | \`string\`            | El correo electrónico del autor. Se guarda automáticamente.                                               |
| \`imageUrl\`         | \`string\`            | URL de la imagen destacada subida a Firebase Storage.                                                     |
| \`imageUrl1\`        | \`string\`            | URL de la primera imagen adicional.                                                                       |
| \`imageUrl2\`        | \`string\`            | URL de la segunda imagen adicional.                                                                       |
| \`fileUrl\`          | \`string\`            | URL del archivo adjunto subido a Firebase Storage.                                                        |
| \`fileName\`         | \`string\`            | El nombre original del archivo adjunto.                                                                   |
| \`articleType\`      | \`string\`            | El tipo de contenido seleccionado: \`"blog"\`, \`"resource"\`, \`"video"\`, u \`"other"\`.                        |
| \`otherArticleType\` | \`string\`            | Si \`articleType\` es \`"other"\`, este campo almacena el tipo personalizado especificado por el usuario.     |
| \`categories\`       | \`Array<string>\`     | Una lista de categorías asociadas al artículo, solo si \`articleType\` es \`"blog"\`.                         |

## Colección: \`profiles\`

Esta colección almacena la información del perfil público de cada usuario/autor.

-   **Document ID**: El UID del usuario de Firebase Authentication. Esto asegura que cada usuario tenga un único documento de perfil.

### Campos del Documento

| Campo         | Tipo de Dato | Descripción                                                                              |
| ------------- | ------------ | ---------------------------------------------------------------------------------------- |
| \`displayName\` | \`string\`     | El nombre público que el usuario elige para mostrar.                                     |
| \`bio\`         | \`string\`     | Una breve biografía o descripción del autor.                                             |
| \`website\`     | \`string\`     | La URL del sitio web personal o profesional del autor.                                   |
| \`email\`       | \`string\`     | El correo electrónico del usuario. Se guarda automáticamente desde su cuenta de Firebase. |
| \`authorId\`    | \`string\`     | El UID del usuario. Se guarda de forma silenciosa para consistencia.                     |
| \`photoURL\`    | \`string\`     | URL de la foto de perfil subida a Firebase Storage.                                    |

## Colección: \`users\`

Esta colección almacena información esencial del usuario, principalmente para la gestión de roles.

-   **Document ID**: El UID del usuario de Firebase Authentication.

### Campos del Documento

| Campo   | Tipo de Dato | Descripción                                                                              |
| ------- | ------------ | ---------------------------------------------------------------------------------------- |
| \`email\` | \`string\`     | El correo electrónico del usuario. Se guarda automáticamente desde su cuenta de Firebase. |
| \`role\`  | \`string\`     | El rol del usuario dentro de la aplicación (ej. \`"Admin"\`, \`"Redactor"\`, \`"Redactor Jr."\`). |

## Colección: \`invitations\`

Esta colección almacena las invitaciones de un solo uso para registrar nuevos usuarios.

-   **Document ID**: Un token único generado automáticamente que se usa en el enlace de invitación.

### Campos del Documento

| Campo          | Tipo de Dato | Descripción                                                                       |
| -------------- | ------------ | --------------------------------------------------------------------------------- |
| \`email\`        | \`string\`     | El correo electrónico del usuario invitado.                                       |
| \`role\`         | \`string\`     | El rol que se asignará al usuario una vez que se registre.                        |
| \`createdAt\`    | \`Timestamp\`  | La fecha y hora en que se creó la invitación. Se genera automáticamente.        |
| \`used\`         | \`boolean\`    | Un indicador para marcar si la invitación ya ha sido utilizada. Empieza en \`false\`. |
| \`creatorId\`    | \`string\`     | El UID del administrador que generó la invitación.                                |
| \`creatorEmail\` | \`string\`     | El correo del administrador que generó la invitación.                             |

## Colección: \`siteConfig\`

Esta colección almacena la configuración global para el sitio. Se espera que contenga un único documento.

-   **Document ID**: \`default-site\`

### Campos del Documento

| Campo                  | Tipo de Dato | Descripción                                                                                   |
| ---------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| \`siteName\`             | \`string\`     | El nombre del sitio que se muestra en el panel y en el título de la pestaña del navegador.     |
| \`deployHookUrl\`        | \`string\`     | La URL del webhook a la que se llamará para activar un nuevo despliegue al publicar contenido. |
| \`siteUrl\`              | \`string\`     | La URL pública principal de tu sitio (ej. https://mi-sitio.com).                                |
| \`blogPath\`             | \`string\`     | La ruta base para los artículos de blog (ej. \`/blog\`).                                        |
| \`resourcesPath\`        | \`string\`     | La ruta base para los recursos (ej. \`/recursos\`).                                             |
| \`videosPath\`           | \`string\`     | La ruta base para los videos (ej. \`/videos\`).                                                 |
| \`otherPath\`            | \`string\`     | La ruta base para otro tipo de contenido (ej. \`/archivo\`).                                    |
| \`aiSiteDescription\`    | \`string\`     | Descripción breve del sitio para el contexto de la IA.                                        |
| \`aiTargetAudience\`     | \`string\`     | El público objetivo del sitio para el contexto de la IA.                                      |
| \`aiKeyProducts\`        | \`string\`     | Productos, servicios o temas clave para el contexto de la IA.                                 |
| \`aiForbiddenTopics\`    | \`string\`     | Temas o palabras que la IA debe evitar.                                                       |

## Colección: \`license\`

Esta colección almacena un identificador único para la instalación, vinculado al primer administrador.

-   **Document ID**: Un ID único generado automáticamente por Firestore.

### Campos del Documento

| Campo | Tipo de Dato | Descripción                                                            |
| ----- | ------------ | ---------------------------------------------------------------------- |
| \`uid\` | \`string\`     | El UID del primer usuario administrador que configuró la aplicación.      |

## Colección: \`publicConfig\`

Esta colección almacena la configuración pública accesible sin autenticación.

-   **Document ID**: \`main\`

### Campos del Documento

| Campo         | Tipo de Dato | Descripción                                                            |
| ------------- | ------------ | ---------------------------------------------------------------------- |
| \`loginLogoUrl\`| \`string\`     | La URL del logo que se mostrará en la página de inicio de sesión.      |


## Reglas de Seguridad

Las reglas de seguridad para estas colecciones se encuentran en el archivo \`firestore.rules\` en la raíz del proyecto. Es crucial aplicar estas reglas en la consola de Firebase para proteger la base de datos contra accesos no autorizados.
`;

export const dictionary: Dictionary = {
  login: {
    title: 'Iniciar Sesión',
    emailLabel: 'Correo Electrónico',
    passwordLabel: 'Contraseña',
    submitButton: 'Iniciar Sesión',
    error: 'Error de inicio de sesión. Por favor, compruebe sus credenciales.',
    forgotPassword: '¿Olvidaste tu contraseña?',
    resetPasswordTitle: 'Restablecer Contraseña',
    resetPasswordDescription: 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.',
    sendResetLink: 'Enviar Enlace de Restablecimiento',
    resetEmailSent: '¡Correo de restablecimiento enviado!',
    resetEmailSentDescription: 'Revisa tu bandeja de entrada (y la carpeta de spam) para continuar.',
    resetError: 'Error al enviar el correo.',
    resetErrorDescription: 'Asegúrate de que el correo electrónico sea correcto y esté registrado.',
    cancel: 'Cancelar',
    enterEmailPrompt: 'Por favor, introduce tu correo electrónico.',
    firstUserTitle: 'Crear Cuenta de Administrador',
    firstUserDescription: 'Es la primera vez que configuras la aplicación. Crea la cuenta de administrador principal para empezar.',
    createAccountButton: 'Crear Cuenta',
    firstAdminNameLabel: 'Tu Nombre Completo',
    firstAdminNamePlaceholder: 'Juan Pérez',
    invitation: {
      title: 'Finalizar Registro',
      description: 'Estás a un paso de unirte al equipo. Completa tu perfil para continuar.',
      displayNameLabel: 'Tu Nombre Completo',
      displayNamePlaceholder: 'Jane Doe',
      submitButton: 'Completar Registro',
      errorTitle: 'Error de Invitación',
      invalid: 'El enlace de invitación no es válido o ha expirado.',
      used: 'Este enlace de invitación ya ha sido utilizado.',
      genericError: 'Ocurrió un error al registrar tu cuenta.',
      successTitle: '¡Bienvenido!',
      successDescription: 'Tu cuenta ha sido creada exitosamente.',
    },
  },
  sidebar: {
    dashboard: 'Panel de Control',
    content: 'Contenido',
    users: 'Usuarios',
    usersTooltip: 'Gestionar usuarios del equipo.',
    settingsTooltip: 'Gestionar ajustes del sitio.',
    adminOnlyTooltip: 'Solo los administradores pueden acceder a esta sección.',
    proUsersTooltip: 'Mejora a un plan Pro para gestionar usuarios.',
    siteSettings: 'Ajustes del Sitio',
    instructions: 'Instrucciones',
    logout: 'Cerrar Sesión',
    theme: 'Tema',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
    tools: 'Herramientas',
    toolsTooltip: 'Herramientas Adicionales.',
    proToolsTooltip: 'Mejora a Pro para acceder a herramientas adicionales.',
    roleToolsTooltip: 'No tienes permisos para acceder a esta sección.',
    tokenWarning: 'Has usado el {percent}% de tus tokens.'
  },
  dashboard: {
    title: 'Panel de Control',
    welcome: '¡Bienvenido de nuevo!',
    welcomeSubtitle: 'Aquí hay un resumen de su sitio.',
    totalArticles: 'Artículos Totales',
    drafts: 'Borradores',
    published: 'Publicados',
    recentActivity: {
      title: 'Actividad Reciente',
      description: 'Los últimos 5 artículos actualizados.',
      viewAll: 'Ver Todos',
      articleTitle: 'Artículo',
      status: 'Estado',
      lastUpdated: 'Última Actualización',
      noArticles: 'No hay artículos recientes.',
    },
    contentBreakdown: {
      title: 'Contenido por Tipo',
      description: 'Distribución de tus tipos de contenido.',
    },
    statusValues: {
      draft: 'Borrador',
      published: 'Publicado',
    },
    contentTypes: {
      blog: 'Blog',
      resource: 'Recurso',
      video: 'Video',
      other: 'Otro',
    },
    contentTypeTitle: 'Resumen de Contenido',
    contentTypeDescription: 'Haz clic en una tarjeta para ver todo el contenido de ese tipo.',
  },
  content: {
    title: 'Gestión de Contenido',
    description: 'Gestiona tus artículos y entradas de blog aquí.',
    newArticle: 'Nuevo Artículo',
    table: {
      title: 'Título',
      status: 'Estado',
      type: 'Tipo',
      actions: 'Acciones',
      view: 'Ver Artículo',
      edit: 'Editar',
      delete: 'Eliminar',
      viewTooltip: 'Los cambios pueden tardar unos minutos en reflejarse después de un despliegue.',
    },
    statusValues: {
      draft: 'Borrador',
      published: 'Publicado',
    },
    deleteDialog: {
      title: '¿Estás seguro?',
      description: 'Esta acción no se puede deshacer. Esto eliminará permanentemente el artículo.',
      cancel: 'Cancelar',
      continue: 'Continuar',
    },
    editAccessDenied: {
      title: 'Acceso Denegado',
      description: 'No tienes permiso para editar este artículo.',
    },
  },
  contentForm: {
    createTitle: 'Crear Nuevo Artículo',
    editTitle: 'Editar Artículo',
    titleLabel: 'Título',
    titlePlaceholder: 'El título de tu artículo',
    titleTooltip: 'Así se verá en la página final y en la URL.',
    bodyLabel: 'Cuerpo',
    bodyPlaceholder: 'Escribe tu contenido aquí...',
    bodyTooltip: 'Admite Markdown. Puedes alternar la vista para ver cómo quedará.',
    markdownHint: 'Se admite Markdown.',
    statusLabel: 'Estado (Borrador)',
    statusTooltip: 'Define si el artículo es visible públicamente (Publicado) o si solo es visible para administradores (Borrador).',
    statusTooltipRedactorJr: 'Como Redactor Jr., solo puedes guardar artículos como borradores. Un Admin o Redactor deberá publicarlos.',
    submit: 'Guardar Artículo',
    success: 'Artículo guardado con éxito.',
    error: 'Error al guardar el artículo.',
    write: 'Escribir',
    preview: 'Vista Previa',
    featuredImageLabel: 'Imagen Destacada',
    featuredImageDescription: 'La imagen se optimizará automáticamente.',
    featuredImageTooltip: 'Esta es la imagen principal del artículo. Una vez subida, usa el botón de copiar para pegar el código en el cuerpo del artículo.',
    additionalImageLabel: 'Imagen Adicional',
    additionalImageTooltip: 'Imagen adicional para el artículo. Una vez subida, usa el botón de copiar para pegar el código en el cuerpo del artículo.',
    copyMarkdown: 'Copiar Markdown',
    copyMarkdownTooltip: 'Pega esto en el artículo para mostrar la imagen.',
    copySuccessTitle: 'Copiado',
    copySuccessDescription: 'El código Markdown ha sido copiado.',
    deleteImageTooltip: 'Eliminar Imagen',
    uploadCTA: 'Haz clic para subir o arrastra',
    statusValues: {
      draft: 'Borrador',
      published: 'Publicado',
    },
    infoDialogTitle: 'Información',
    infoDialogClose: 'Cerrar',
    articleTypeLabel: 'Tipo de Contenido',
    articleTypePlaceholder: 'Selecciona un tipo',
    articleTypeTooltip: 'Clasifica el contenido para una mejor organización.',
    articleTypeValues: {
      blog: 'Artículo o Blog',
      resource: 'Recurso',
      video: 'Video',
      other: 'Otro (especifique)',
    },
    otherTypeLabel: 'Especificar Tipo',
    otherTypePlaceholder: 'p. ej. Podcast',
    otherTypeTooltip: 'Escribe el tipo de contenido personalizado. Una sola palabra, máx. 20 caracteres.',
    categoriesLabel: 'Categorías',
    categoriesPlaceholder: 'viajes, tips, consejos',
    categoriesTooltip: 'Lista de categorías separadas por comas.',
    fileUploadLabel: 'Archivo Adjunto',
    fileUploadDescription: 'Sube cualquier archivo para enlazarlo en tu artículo.',
    deleteFileTooltip: 'Eliminar Archivo',
    copyFileMarkdownTooltip: 'Copia el enlace de descarga en formato Markdown.',
    optimizingImageTitle: 'Optimizando imagen...',
    optimizingImageDescription: 'Por favor, espera un momento. Esto puede tardar dependiendo del tamaño de la imagen.',
    uploadSuccessTitle: '¡Imagen optimizada subida!',
    uploadSuccessDescription: 'Tu imagen está lista para ser usada.',
    optimizationErrorTitle: 'Error de optimización',
    optimizationErrorDescription: 'No se pudo optimizar la imagen. Por favor, inténtalo de nuevo con otra imagen.',
    markdownToolbar: {
      h1: 'Título 1',
      h2: 'Título 2',
      bold: 'Negrita',
      italic: 'Cursiva',
      list: 'Lista con viñetas',
      quote: 'Cita',
    },
    aiSuggestButton: 'Sugerir con IA',
    aiSuggestTitleTooltipCommunity: 'Mejora a un plan Pro para usar las funciones de IA.',
    aiProSuggestTitleTooltip: 'Sugerir con IA: Mejora el título (mínimo 20 caracteres)',
    aiSuccess: '¡Título actualizado!',
    aiSuccessDescription: 'La IA ha sugerido un nuevo título.',
    aiError: 'Error de IA',
    aiErrorDescription: 'No se pudo generar una sugerencia de título.',
    aiTitleTooShort: 'Título demasiado corto',
    aiTitleTooShortDescription: 'Escribe al menos 20 caracteres para obtener sugerencias.',
    aiUpgradeRequired: 'Mejora de plan requerida',
    aiUpgradeRequiredDescription: 'Esta es una función premium. Por favor, mejora tu plan.',
    aiContextPopover: {
      title: 'Contexto Adicional',
      description: 'Proporciona hasta 5 palabras clave para guiar a la IA (opcional).',
      placeholder: 'Ej: principiantes, marketing, rápido',
      closeButton: 'Aplicar',
    },
    aiBodyContextPopover: {
      title: 'Contexto para el Cuerpo',
      description: 'Proporciona hasta 5 palabras clave para guiar a la IA (opcional).',
      placeholder: 'Ej: tono formal, para expertos',
      closeButton: 'Aplicar',
    },
    aiGenerateBody: 'Generar',
    aiGenerateBodyTooltip: 'Generar contenido basado en el título',
    aiGenerateBodyCondition: 'Se requiere un título',
    aiImproveBody: 'Mejorar',
    aiImproveBodyTooltip: 'Mejorar el texto existente',
    aiImproveBodyCondition: 'Se requieren al menos 60 caracteres en el cuerpo',
    aiAddMarkdown: 'Añadir Markdown',
    aiAddMarkdownTooltip: 'Formatear el texto con Markdown',
    aiAddMarkdownCondition: 'Se requieren al menos 60 caracteres en el cuerpo',
    aiBodySuccess: '¡Cuerpo del artículo actualizado!',
    aiBodySuccessDescription: 'La IA ha procesado el contenido.',
    aiBodyError: 'Error de IA',
    aiBodyErrorDescription: 'No se pudo procesar el contenido.',
  },
  settings: {
    title: 'Configuración del Perfil',
    description: 'Esta información será visible públicamente. Edita cómo te ven los demás.',
    displayNameLabel: 'Nombre a Mostrar',
    bioLabel: 'Biografía',
    websiteLabel: 'Sitio Web',
    websitePlaceholder: 'https://tu-sitio.com',
    submitButton: 'Guardar Perfil',
    successMessage: 'Perfil actualizado con éxito.',
    errorMessage: 'Error al actualizar el perfil.',
    changePhotoButton: 'Cambiar foto',
    uploadingPhoto: 'Subiendo foto...',
    activatePlan: 'Activación de Planes',
    activatePlanTitle: 'Portal de Activación de Planes',
    activatePlanDescription: 'Haz clic en el botón de abajo para ir al portal seguro donde puedes gestionar tu plan y método de pago.',
    goToPortalButton: 'Ir al Portal de Activación',
    loadingLicense: 'Cargando información de la licencia...',
  },
  siteSettings: {
    title: 'Ajustes del Sitio',
    description: 'Configura ajustes globales para tu sitio, como los webhooks de despliegue.',
    adminOnlyTitle: 'Acceso Denegado',
    adminOnlyDescription: 'Esta sección es solo para administradores.',
    deployHookUrlLabel: 'URL del Webhook de Despliegue',
    deployHookUrlDescription: 'Cada vez que publiques un artículo, se enviará una petición POST a esta URL para activar un nuevo despliegue.',
    siteUrlLabel: 'URL del Sitio',
    siteUrlDescription: 'La URL pública principal de tu sitio. Se usa para generar enlaces para previsualizar artículos.',
    loginLogoUrlLabel: 'Logo para Página de Login',
    loginLogoUrlDescription: 'Sube un logo para que se muestre en la página de inicio de sesión.',
    siteNameLabel: 'Nombre del Sitio',
    siteNameDescription: 'El nombre que aparecerá en el panel y en el título de la pestaña.',
    pathSettingsTitle: 'Configuración de Rutas de Contenido',
    pathSettingsDescription: 'Define las rutas base para los diferentes tipos de contenido. Esto te da control total sobre el SEO y la organización de tu sitio.',
    blogPathLabel: 'Ruta para Blogs/Artículos',
    blogPathDescription: 'La ruta base para los artículos de blog (ej. /blog).',
    resourcesPathLabel: 'Ruta para Recursos',
    resourcesPathDescription: 'La ruta base para los recursos (ej. /recursos).',
    videosPathLabel: 'Ruta para Videos',
    videosPathDescription: 'La ruta base para los videos (ej. /videos).',
    otherPathLabel: 'Ruta para "Otros"',
    otherPathDescription: 'La ruta base para contenido de tipo "otro" (ej. /archivo).',
    upgradePlanPrompt: 'Mejora tu plan para usar las funciones de IA.',
    proFeatureDescription: 'Esta es una función Pro. Mejora tu plan para activarla.',
    submitButton: 'Guardar Ajustes',
    successTitle: '¡Éxito!',
    successMessage: 'Ajustes guardados correctamente.',
    fetchError: 'No se pudo cargar la configuración del sitio.',
    saveError: 'Error al guardar los ajustes.',
    deployHookTriggered: '¡Despliegue activado!',
    deployHookError: 'No se pudo activar el despliegue.',
    aiContext: {
      title: 'Información de Contexto para IA',
      description: 'Proporciona a la IA información general sobre tu sitio para que genere contenido más relevante y alineado con tu marca.',
      formDescription: 'Estos campos proporcionan contexto a la IA para mejorar la calidad de las sugerencias y generaciones.',
      siteNameLabel: 'Nombre del Sitio',
      siteNamePlaceholder: 'Mi increíble blog',
      siteDescriptionLabel: 'Descripción Breve del Sitio',
      siteDescriptionPlaceholder: 'Un sitio dedicado a...',
      targetAudienceLabel: 'Público Objetivo',
      targetAudiencePlaceholder: 'Ej: Jóvenes profesionales, entusiastas de la tecnología...',
      keyProductsLabel: 'Productos o Servicios Clave (Opcional)',
      keyProductsPlaceholder: 'Listar los productos, servicios o temas principales que se cubren.',
      forbiddenTopicsLabel: 'Temas o Palabras Prohibidas (Opcional)',
      forbiddenTopicsPlaceholder: 'Temas que la IA debe evitar. Ej: política, competidores...',
    },
    logoUploadButton: 'Subir Logo',
    uploadingLogoButton: 'Subiendo...',
    changeLogoButton: 'Cambiar Logo',
    logoUploadSuccess: 'Logo subido correctamente.',
    logoUploadError: 'Error al subir el logo.',
    generalSettingsCardTitle: 'Ajustes Generales',
    logoCardTitle: 'Logo para Inicio de Sesión',
    integrationsCardTitle: 'Integraciones y Automatización',
    pathsCardTitle: 'Rutas de Contenido',
    aiContextCardTitle: 'Contexto para IA',
    viewSettings: 'Ver Ajustes',
  },
  users: {
    title: 'Gestión de Usuarios',
    description: 'Gestiona los roles y permisos de tu equipo.',
    upgradeTitle: 'Función Pro: Gestión de Usuarios',
    upgradeDescription: 'Mejora a un plan Pro para invitar y gestionar miembros del equipo, asignar roles y controlar permisos.',
    upgradeButton: 'Ver Planes',
    adminOnlyTitle: 'Acceso Denegado',
    adminOnlyDescription: 'Esta sección es solo para administradores.',
    tableTitle: 'Lista de Usuarios',
    tableDescription: 'Estos son todos los usuarios registrados en la plataforma.',
    emailColumn: 'Correo Electrónico',
    roleColumn: 'Rol',
    actionsColumn: 'Acciones',
    inviteUser: 'Invitar Usuario',
    inviteUserTitle: 'Invitar a un nuevo usuario',
    inviteUserDescription: 'Introduce el correo electrónico y asigna un rol. Se generará un enlace de registro único.',
    generateLink: 'Generar enlace',
    linkGeneratedSuccess: '¡Enlace de invitación generado!',
    copyLink: 'Copiar enlace',
    inviteLink: 'Enlace de Invitación',
    inviteLinkDescription: 'Envía este enlace al usuario para que pueda registrarse. El enlace es de un solo uso.',
    editRole: 'Editar Rol',
    editRoleTitle: 'Editar rol para',
    editRoleDescription: 'Selecciona el nuevo rol para el usuario.',
    saveChanges: 'Guardar Cambios',
    roleUpdatedSuccess: '¡Rol actualizado!',
    roleUpdatedError: 'Error al actualizar el rol.',
    roles: {
      Admin: 'Admin',
      Redactor: 'Redactor',
      'Redactor Jr.': 'Redactor Jr.',
    },
    viewInvitations: 'Ver Invitaciones',
    invitations: {
      title: 'Invitaciones',
      description: 'Gestiona las invitaciones pendientes y utilizadas.',
      tableTitle: 'Lista de Invitaciones',
      emailColumn: 'Email Invitado',
      roleColumn: 'Rol Asignado',
      statusColumn: 'Estado',
      createdByColumn: 'Creado por',
      createdAtColumn: 'Fecha Creación',
      actionsColumn: 'Acciones',
      noInvitations: 'No se encontraron invitaciones.',
      status: {
        pending: 'Pendiente',
        used: 'Utilizada',
      },
      deleteAction: 'Eliminar',
      deleteDialog: {
        title: '¿Estás seguro?',
        description: 'Esto eliminará la invitación permanentemente. Esta acción no se puede deshacer.',
      },
      deleteSuccess: 'Invitación eliminada.',
      deleteError: 'Error al eliminar la invitación.',
      copySuccess: '¡Enlace de invitación copiado!',
    },
  },
  tools: {
    title: 'Herramientas Adicionales',
    description: 'Una colección de utilidades para potenciar tu flujo de trabajo.',
    qrGenerator: {
      label: 'Generador QR',
      description: 'Genera y personaliza códigos QR para URLs, texto, y más. Descarga en alta calidad.',
      pageTitleHtml: ['Generador de Códigos ', 'QR'],
      pageDescription: 'Crea y personaliza códigos QR fácilmente para tus enlaces, texto y más. Todo en tu navegador, ¡descarga instantánea!',
      previewTitle: 'Tu Código QR',
      previewDescription: 'Previsualiza tu código QR aquí. Se actualiza automáticamente al cambiar las opciones.',
      placeholderTitle: 'Ingresa datos para generar el QR.',
      placeholderDescription: 'Escribe un texto o URL en el panel de la derecha.',
      downloadButton: 'Descargar QR (.png)',
      privacyNote: 'Los códigos QR se generan localmente en tu navegador. No almacenamos ningún dato.',
      optionsTitle: 'Opciones',
      textLabel: 'Texto o URL',
      textPlaceholder: 'Ej: https://rtsi.site',
      fgColorLabel: 'Color Principal',
      bgColorLabel: 'Color de Fondo',
      sizeLabel: 'Tamaño (px)',
      levelLabel: 'Nivel de Corrección',
      levelPlaceholder: 'Selecciona nivel',
      levelLow: 'Bajo (L)',
      levelMedium: 'Medio (M)',
      levelQuartile: 'Quartil (Q)',
      levelHigh: 'Alto (H)',
      toastDownloadSuccessTitle: 'Descarga Iniciada',
      toastDownloadSuccessDesc: 'Tu código QR se está descargando.',
      toastDownloadErrorTitle: 'Error de Descarga',
      toastDownloadErrorDescCanvas: 'No se pudo crear el contexto del canvas para la descarga.',
      toastDownloadErrorDescGeneric: 'No se pudo generar el archivo para descargar.',
      toastDownloadErrorDescNotFound: 'No se encontró el código QR para descargar.',
    },
    vcfGenerator: {
      label: 'Generador vCard',
      description: 'Crea tarjetas de contacto digitales (.vcf) para compartir tus datos profesionalmente.',
      pageTitleHtml: ['Generador de Tarjetas de Contacto ', 'vCard (.vcf)'],
      pageDescription: 'Crea y descarga archivos .vcf personalizados con tu información de contacto y foto. Ideal para compartir tus datos profesionalmente.',
      mainInfoTitle: 'Información Principal',
      firstNameLabel: 'Nombre',
      firstNamePlaceholder: 'Juan',
      lastNameLabel: 'Apellido',
      lastNamePlaceholder: 'Pérez',
      organizationLabel: 'Organización/Empresa',
      organizationPlaceholder: 'Innovatech Soluciones',
      titleLabel: 'Puesto/Cargo',
      titlePlaceholder: 'Desarrollador Senior',
      photoTitle: 'Foto de Perfil',
      photoDescription: 'Opcional. Se recomienda una imagen cuadrada (máx. 2MB).',
      photoAlt: 'Vista previa de foto de perfil para vCard',
      photoRemoveAriaLabel: 'Eliminar foto',
      photoUploadLabel: 'Subir foto',
      contactDetailsTitle: 'Detalles de Contacto',
      phoneWorkLabel: 'Teléfono (Trabajo)',
      phoneMobileLabel: 'Teléfono (Móvil)',
      phonePlaceholder: '+1 234 567 890',
      emailWorkLabel: 'Email (Trabajo)',
      emailWorkPlaceholder: 'juan.perez@empresa.com',
      emailPersonalLabel: 'Email (Personal)',
      emailPersonalPlaceholder: 'juan@correo.com',
      websiteLabel: 'Sitio Web',
      websitePlaceholder: 'https://www.empresa.com',
      addressTitle: 'Dirección (Trabajo)',
      addressStreetLabel: 'Calle y Número',
      addressStreetPlaceholder: 'Av. Principal 123',
      addressCityLabel: 'Ciudad',
      addressCityPlaceholder: 'Ciudad Ejemplo',
      addressStateLabel: 'Estado/Provincia',
      addressStatePlaceholder: 'Estado Ejemplo',
      addressZipLabel: 'Código Postal',
      addressZipPlaceholder: '12345',
      addressCountryLabel: 'País',
      addressCountryPlaceholder: 'País Ejemplo',
      notesTitle: 'Notas Adicionales',
      notesLabel: 'Notas',
      notesPlaceholder: 'Información adicional, como horario de contacto, especialidades, etc.',
      downloadButton: 'Generar y Descargar vCard (.vcf)',
      faqTitle: 'Instrucciones y FAQs',
      faqItems: [
        { question: '¿Qué es un archivo VCF (vCard)?', answer: 'Un archivo VCF, o vCard, es un formato estándar para tarjetas de visita electrónicas. Permite intercambiar fácilmente información de contacto entre diferentes dispositivos y aplicaciones de correo o contactos.' },
        { question: '¿Cómo uso el generador?', answer: 'Completa los campos del formulario con la información de contacto que deseas incluir. Puedes añadir una foto de perfil (se recomienda cuadrada). Luego, haz clic en "Generar y Descargar vCard" para obtener tu archivo .vcf.' },
        { question: '¿Qué pasa con mi información?', answer: 'Toda la información que ingresas y la generación del archivo VCF se realizan directamente en tu navegador. No almacenamos ni transmitimos tus datos a ningún servidor. Tu privacidad está protegida.' },
        { question: '¿Hay un límite para el tamaño de la foto?', answer: 'Sí, para un rendimiento óptimo, el tamaño de la foto no debe exceder los 2MB. Las imágenes se convierten a formato Base64 para incluirlas en el archivo VCF, lo que puede aumentar su tamaño.' },
      ],
      toastPhotoTooLargeTitle: 'Imagen Demasiado Grande',
      toastPhotoTooLargeDesc: 'Por favor, elige una imagen de menos de 2MB.',
      toastInsufficientDataTitle: 'Datos Insuficientes',
      toastInsufficientDataDesc: 'Por favor, ingresa al menos un nombre, apellido u organización.',
      toastDownloadStartedTitle: 'Descarga Iniciada',
      toastDownloadStartedDesc: 'El archivo {filename} se está descargando.',
    },
    imageOptimizer: {
        label: 'Optimizador de Imágenes',
        description: 'Reduce el tamaño de tus imágenes sin perder calidad, directamente en tu navegador.',
        pageTitleHtml: ['Optimizador de Imágenes ', 'Inteligente'],
        pageDescription: 'Comprime tus imágenes JPEG, PNG y WEBP directamente en tu navegador. Rápido, seguro y sin subir archivos a un servidor.',
        upgradeTitle: 'Herramienta para Miembros Pro',
        upgradeDescription: 'El optimizador de imágenes es una herramienta exclusiva para usuarios con un plan Pro o superior.',
        upgradeCTA: 'Mejora tu plan para acceder a esta y otras herramientas avanzadas que potenciarán tu flujo de trabajo.',
        roleErrorTitle: 'Acceso Denegado',
        roleErrorDescription: 'No tienes el rol necesario para acceder a esta herramienta.',
        uploadTitle: 'Sube tu Imagen',
        uploadDescription: 'Arrastra un archivo aquí o haz clic para seleccionar. Máximo {size}MB.',
        uploadCTA: 'Haz clic o arrastra tu imagen',
        originalLabel: 'Original',
        optimizedLabel: 'Optimizada',
        savings: 'de ahorro',
        cleanButton: 'Limpiar',
        downloadButton: 'Descargar',
        optionsTitle: 'Opciones de Optimización',
        outputFormatLabel: 'Formato de Salida',
        formatWebp: 'WEBP (Recomendado)',
        formatJpeg: 'JPEG',
        formatPng: 'PNG',
        qualityLabel: 'Calidad',
        qualityDescription: 'No aplica para PNG. Menor calidad = menor tamaño.',
        optimizeButton: 'Optimizar Imagen',
        optimizingButton: 'Optimizando...',
        howItWorksTitle: '¿Cómo funciona?',
        howItWorksSteps: [
            '1. Sube tu imagen (arrastrando o seleccionando).',
            '2. Ajusta la calidad y formato deseado.',
            '3. Haz clic en "Optimizar Imagen".',
            '4. Previsualiza y descarga el resultado.',
        ],
        howItWorksNote: 'Todo el proceso se realiza en tu dispositivo. Tus imágenes nunca salen de tu navegador.',
        toastFileSizeError: 'Archivo Demasiado Grande',
        toastFileSizeErrorDesc: 'Por favor, elige un archivo de imagen de menos de {size}MB.',
        toastNoImageError: 'No hay imagen seleccionada',
        toastNoImageErrorDesc: 'Por favor, elige una imagen para optimizar.',
        toastSuccessTitle: '¡Imagen Optimizada!',
        toastSuccessDesc: 'Se ha reducido el tamaño en un {percentage}%.',
        toastGenericErrorTitle: 'Error de Optimización',
        toastGenericErrorDesc: 'No se pudo optimizar la imagen. Inténtalo de nuevo o con otro archivo.',
        uploadToStorageButton: 'Subir a la Nube',
        uploadingToStorageButton: 'Subiendo...',
        toastUploadSuccessTitle: '¡Imagen subida a la nube!',
        toastUploadErrorTitle: 'Error al Subir',
        previousUploadsTitle: 'Imágenes Subidas Anteriormente',
        noPreviousUploads: 'Aún no se han subido imágenes.',
        toastCopySuccessTitle: '¡Enlace Copiado!',
        toastCopySuccessDesc: 'La URL de la imagen ha sido copiada.',
        toastDeleteSuccessTitle: '¡Imagen Eliminada!',
        toastDeleteErrorTitle: 'Error al Eliminar',
        toastDeleteErrorUnauthorized: 'No tienes permiso para eliminar este archivo.',
    },
    imageOptimizerBatch: {
      label: 'Optimizador en Lote',
      description: 'Optimiza múltiples imágenes a la vez. Un gran ahorro de tiempo para tus galerías.',
      pageTitleHtml: ['Optimizador de Imágenes ', 'en Lote'],
      pageDescription: 'Comprime múltiples imágenes a la vez. Rápido y privado, todo sucede en tu navegador.',
      roleErrorTitle: 'Acceso Denegado',
      roleErrorDescription: 'No tienes el rol necesario para acceder a esta herramienta.',
      uploadTitle: 'Sube tus Imágenes',
      uploadDescription: 'Arrastra o selecciona hasta {maxFiles} archivos. Máximo {maxSize}MB por archivo.',
      uploadCTA: 'Haz clic o arrastra tus imágenes',
      selectedFilesTitle: '{count} imágenes seleccionadas:',
      processing: 'Procesando...',
      optimizingStatus: 'Optimizando {current} de {total}: {fileName}',
      resultsTitle: 'Resultados de la Optimización',
      savings: 'de ahorro',
      downloadButton: 'Descargar',
      cleanButton: 'Limpiar',
      optionsTitle: 'Opciones de Optimización',
      outputFormatLabel: 'Formato de Salida',
      formatWebp: 'WEBP (Recomendado)',
      formatJpeg: 'JPEG',
      formatPng: 'PNG',
      qualityLabel: 'Calidad',
      qualityDescription: 'No aplica para PNG. Menor calidad = menor tamaño.',
      optimizeButton: 'Optimizar Lote',
      optimizingButton: 'Optimizando...',
      toastTooManyFilesTitle: 'Demasiados Archivos',
      toastTooManyFilesDesc: 'Por favor, selecciona un máximo de {maxFiles} imágenes.',
      toastFileTooLargeTitle: 'Archivo Demasiado Grande',
      toastFileTooLargeDesc: 'La imagen "{fileName}" supera los {maxSize}MB y será omitida.',
      toastNoImagesTitle: 'No hay imágenes seleccionadas',
      toastNoImagesDesc: 'Por favor, elige una o más imágenes para optimizar.',
      toastErrorCompressingTitle: 'Error en {fileName}',
      toastErrorCompressingDesc: 'No se pudo optimizar esta imagen. Será omitida.',
      toastSuccessTitle: '¡Optimización Completa!',
      toastSuccessDesc: 'Se han procesado {count} imágenes.',
      uploadToStorageButton: 'Subir a la Nube',
      uploadingToStorageButton: 'Subiendo...',
      toastUploadSuccessTitle: '¡Imagen "{fileName}" subida a la nube!',
      toastUploadErrorTitle: 'Error al subir "{fileName}"',
      previousUploadsTitle: 'Imágenes Subidas Anteriormente',
      noPreviousUploads: 'Aún no se han subido imágenes.',
      toastDeleteSuccessTitle: '¡Imagen Eliminada!',
      toastDeleteErrorTitle: 'Error al Eliminar',
      toastDeleteErrorUnauthorized: 'No tienes permiso para eliminar este archivo.',
    },
    linkGenerator: {
        label: 'Generador de Enlaces para Chat',
        description: 'Crea enlaces directos a WhatsApp y Telegram, con mensajes predefinidos.',
        pageTitleHtml: ['Generador de Enlaces para ', 'Chat'],
        pageDescription: 'Crea enlaces directos y códigos QR para WhatsApp o Telegram con mensajes predefinidos.',
        configTitle: 'Configuración',
        configDescription: 'Elige la plataforma y completa los datos para generar tu enlace.',
        platformWhatsapp: 'WhatsApp',
        platformTelegram: 'Telegram',
        identifierLabelWhatsapp: 'Número de Teléfono (con código de país)',
        identifierLabelTelegram: 'Número de Teléfono o @Usuario',
        identifierPlaceholderWhatsapp: 'Ej: 5215512345678',
        identifierPlaceholderTelegram: 'Ej: +52... o tu_usuario',
        identifierDescriptionWhatsapp: "Incluye el código de país sin '+', espacios o guiones.",
        identifierDescriptionTelegram: "Para números, incluye el código de país. Para usuarios, no incluyas el '@'.",
        messageLabel: 'Mensaje Predefinido (Opcional)',
        messagePlaceholder: 'Hola, me gustaría obtener más información sobre tus servicios...',
        resultTitle: 'Tu Enlace y QR',
        resultDescription: 'Copia el enlace o descarga el QR para compartirlo.',
        qrPlaceholder: 'Ingresa un número o usuario para generar el enlace y el código QR.',
        copyButton: 'Copiar',
        openButton: 'Abrir',
        downloadButton: 'QR',
        telegramNote: 'Nota: El mensaje predefinido para Telegram podría no funcionar en todos los dispositivos o aplicaciones.',
        toastCopySuccessTitle: '¡Enlace Copiado!',
        toastCopySuccessDesc: 'El enlace se ha copiado a tu portapapeles.',
        toastCopyErrorTitle: 'Error',
        toastCopyErrorDesc: 'No se pudo copiar el enlace.',
        toastDownloadSuccessTitle: 'Descarga Iniciada',
        toastDownloadSuccessDesc: 'Tu código QR se está descargando.',
        toastDownloadErrorTitle: 'Error de Descarga',
        toastDownloadErrorDesc: 'No se pudo generar el archivo.',
    }
  },
  instructions: {
    title: 'Instrucciones',
    description: 'Selecciona una sección para ver la guía detallada.',
    comingSoon: 'Contenido de la guía próximamente...',
    controlPanelTitle: 'Panel de Control',
    controlPanelDescription: 'Una guía sobre cómo interpretar el panel principal.',
    contentManagementTitle: 'Gestión de Contenido',
    contentManagementDescription: 'Aprende a crear, editar y publicar tu contenido.',
    profileSettingsTitle: 'Configuración de Perfil',
    profileSettingsDescription: 'Cómo actualizar tu información pública de autor.',
    siteSettingsTitle: 'Ajustes del Sitio',
    siteSettingsDescription: 'Configura los ajustes globales, webhooks y rutas.',
    buildingYourSiteTitle: 'Cómo Construir tu Sitio',
    buildingYourSiteDescription: 'Una guía para desarrolladores sobre cómo obtener y mostrar tu contenido.',
    guides: {
      back: 'Volver a todas las guías',
      controlPanel: {
        title: 'Guía del Panel de Control',
        intro: 'El Panel de Control es la primera página que ves al iniciar sesión. Ofrece una visión rápida y general del contenido y la actividad de tu sitio.',
        stats: {
          title: 'Tarjetas de Estadísticas',
          p1: 'En la parte superior de la página, encontrarás tres tarjetas principales que resumen el estado de tu contenido:',
          list: {
            item1: { title: 'Artículos Totales', desc: 'Muestra el número total de piezas de contenido que has creado, sin importar su estado (borrador o publicado).' },
            item2: { title: 'Borradores', desc: 'Indica cuántos artículos están guardados actualmente como borradores. Estos no son visibles en tu sitio público.' },
            item3: { title: 'Publicados', desc: 'Muestra el número de artículos que están en vivo y visibles para tu audiencia.' },
          },
        },
        overview: {
          title: 'Resumen de Contenido',
          p1: 'Esta sección te ofrece un desglose de tu contenido por tipo. Te ayuda a entender qué clase de contenido produces más.',
          list: {
            item1: { title: 'Blog', desc: 'Para artículos y posts estándar.' },
            item2: { title: 'Recurso', desc: 'Para guías, documentos u otros materiales descargables.' },
            item3: { title: 'Video', desc: 'Para contenido cuyo elemento principal es un video incrustado.' },
            item4: { title: 'Otro', desc: 'Una categoría flexible para cualquier otro tipo de contenido que crees.' },
          },
        },
      },
      contentManagement: {
        title: 'Guía de Gestión de Contenido',
        intro: 'Este es el corazón del panel de administración. Aquí puedes crear, ver, editar y eliminar todo tu contenido.',
        table: {
          title: 'La Tabla de Contenido',
          p1: 'Esta tabla lista todos tus artículos. Puedes ordenar por título haciendo clic en el encabezado. Las acciones principales son:',
          list: {
            item1: { title: 'Búsqueda', desc: 'Usa la barra de búsqueda en la parte superior para encontrar rápidamente un artículo por su título.' },
            item2: { title: 'Estado', desc: 'Ve rápidamente si un artículo es un "Borrador" o está "Publicado".' },
            item3: { title: 'Tipo', desc: 'Identifica el tipo de contenido que asignaste (Blog, Recurso, etc.).' },
            item4: { title: 'Acciones', desc: 'Aquí puedes Ver el artículo en vivo, Editar su contenido o Eliminarlo permanentemente.' },
          },
        },
        form: {
          title: 'El Formulario de Contenido',
          p1: 'Aquí es donde ocurre la magia. Ya sea creando nuevo contenido o editando artículos existentes, usarás este formulario.',
          list: {
            item1: { title: 'Título y Tipo', desc: 'El título es crucial para el SEO. El tipo de contenido ayuda a organizar tu sitio y determina su ruta de URL, que configuras en los Ajustes del Sitio.' },
            item2: { title: 'Subida de Imágenes y Archivos', desc: 'Sube tus archivos directamente. La aplicación optimiza las imágenes a formato WebP para mayor velocidad. Una vez completada la subida, usa el botón de copiar para obtener un enlace en formato Markdown y pégalo en el cuerpo de tu artículo.' },
            item3: { title: 'Editor Markdown', desc: 'Escribe usando Markdown para un formato sencillo. Usa la barra de herramientas para un acceso rápido a estilos comunes y cambia a la pestaña "Vista Previa" para ver cómo quedará.' },
            item4: { title: 'Estado (Borrador/Publicado)', desc: 'Este es un campo clave. Un artículo en "Borrador" solo es visible para ti. Cambiarlo a "Publicado" lo hace público y, si está configurado, activará automáticamente un despliegue de tu sitio a través del webhook.' },
          },
        },
      },
      profileSettings: {
        title: 'Guía de Configuración de Perfil',
        intro: 'Esta página te permite gestionar tu identidad pública como autor. La información que guardes aquí puede mostrarse en tu sitio web público, por ejemplo, en una caja de biografía de autor debajo de tus artículos.',
        fields: {
          title: 'Campos del Perfil',
          p1: 'Cada campo ayuda a construir tu perfil público:',
          list: {
            item1: { title: 'Foto de Perfil', desc: 'Tu avatar o foto personal. Una buena foto añade un toque personal.' },
            item2: { title: 'Nombre a Mostrar', desc: 'Este es el nombre que se mostrará como autor de los artículos.' },
            item3: { title: 'Biografía', desc: 'Un texto corto para describirte a ti o tu trabajo. Puede aparecer debajo de tus artículos.' },
            item4: { title: 'Sitio Web', desc: 'Enlace a tu portafolio personal, redes sociales o cualquier otro sitio relevante.' },
          },
        },
        usage: {
          title: 'Cómo se Usa esta Información',
          p1: 'Este panel de administración guarda estos datos en la colección "profiles" de la base de datos. Tu sitio web público (el "frontend") necesita ser programado para leer estos datos y mostrarlos donde desees, por ejemplo, creando un componente de "Autor" que busque el perfil basado en el ID del autor del artículo.',
        },
      },
      siteSettings: {
        title: 'Guía de Ajustes del Sitio',
        intro: 'Este es el centro de control para la configuración global de tu sitio. Los ajustes aquí afectan a toda la plataforma, incluyendo integraciones y estructuras de URL. Ten cuidado al modificar estos valores.',
        general: {
          title: 'Ajustes Generales',
          list: {
            item1: { title: 'Nombre del Sitio', desc: 'Un nombre simple para identificar tu proyecto. Aparece en la barra lateral y en el título de la pestaña del navegador.' },
            item2: { title: 'URL del Sitio', desc: 'Crucial. Esta es la URL principal de tu sitio público (ej. https://mi-blog.com). Se utiliza para generar los enlaces de previsualización correctos para tus artículos.' },
            item3: { title: 'URL del Logo para Login', desc: 'Personaliza la página de inicio de sesión proporcionando una URL directa a la imagen de tu logo.' },
          },
        },
        integrations: {
          title: 'Integraciones y Automatización',
          list: {
            item1: { title: 'URL del Webhook de Despliegue', desc: 'Esta es una potente herramienta de automatización. Un webhook es una URL especial proporcionada por tu servicio de alojamiento (como Vercel, Netlify o Cloudflare). Cuando este panel envía una petición a esa URL, le indica a tu servicio de alojamiento que inicie un nuevo "despliegue" (reconstrucción y publicación) de tu sitio. Este panel llama automáticamente al webhook cada vez que publicas un artículo.' },
          },
        },
        paths: {
          title: 'Configuración de Rutas de Contenido',
          list: {
            item1: { title: 'Rutas de Contenido', desc: 'Esta sección te permite definir la estructura de las URLs de tu sitio web. Por ejemplo, si estableces la "Ruta para Blogs" en "/articulos", un post de blog con el slug "mi-primer-post" será accesible en `tu-sitio.com/articulos/mi-primer-post`. Esto te da control total sobre el SEO y la organización de tu sitio.' },
          },
        },
      },
      buildingYourSite: {
        title: 'Guía para Desarrolladores: Cómo Construir tu Sitio',
        intro: 'Este panel de administración es un "Headless CMS". Esto significa que gestiona tu contenido, pero no controla cómo se ve tu sitio web público. Esto te da total libertad para construir tu frontend con la tecnología que desees.',
        p1: 'Puedes construir un sitio HTML estático, usar un framework de renderizado en el servidor (SSR) como Next.js o Astro, o incluso alimentar una aplicación móvil. La clave es que tu frontend obtendrá los datos directamente de tu base de datos Firestore.',
        p2: 'Para ayudar a un desarrollador a construir tu sitio, puedes proporcionarle el siguiente esquema de datos. Detalla la estructura de tu contenido en la base de datos, para que sepa exactamente cómo leerlo y mostrarlo.',
        schemaTitle: 'Esquema de la Base de Datos',
        copyButton: 'Copiar Markdown',
        copySuccess: '¡Esquema copiado al portapapeles!',
        databaseSchemaMarkdown: databaseSchemaMarkdownEs,
      }
    },
  },
  composer: {
    pageTitle: 'Panel del Compositor',
    pageDescription: 'Herramientas avanzadas de desarrollo para la base de datos.',
    schemaCard: {
      title: 'Verificador de Estructura de BD',
      description: 'Verifica que las colecciones y documentos esenciales existan en Firestore. Si algo falta, puedes repararlo.',
      checkButton: 'Verificar Estructura',
      fixButton: 'Aplicar Cambios',
      resultsTitle: 'Problemas Encontrados:',
      successTitle: '¡Estructura Correcta!',
      missingDoc: "El documento requerido en la ruta '{path}' no existe.",
      checkError: 'Ocurrió un error al verificar la base de datos.',
      successMessage: 'Todos los documentos y colecciones requeridos existen.',
      fixSuccess: 'La estructura de la base de datos ha sido corregida.',
      fixError: 'No se pudieron aplicar los cambios.',
    },
    resetCard: {
      title: 'Reiniciar a Primer Uso',
      description: 'Elimina todos los datos de usuarios, artículos e invitaciones para simular el primer inicio de sesión. Los ajustes del sitio se conservarán. Ideal para volver a probar el flujo de bienvenida.',
      button: 'Reiniciar Sistema',
      dialog: {
        title: '¿Estás seguro de que quieres reiniciar el sistema?',
        description: 'Esta acción eliminará todos los artículos, perfiles, usuarios, invitaciones y la licencia. NO se puede deshacer. Los ajustes del sitio (siteConfig y publicConfig) NO serán eliminados.',
        confirm: 'Sí, reiniciar ahora',
      },
      resettingToast: "Colección '{collectionName}' eliminada.",
      successToast: 'El sistema está listo para un nuevo primer inicio de sesión.',
      errorToast: 'El proceso de reinicio falló y fue interrumpido.',
    },
    nukeCard: {
      title: 'Zona de Peligro: Borrado Total',
      description: 'Esta acción eliminará TODAS las colecciones de la base de datos (incluyendo ajustes) y cerrará tu sesión. Es irreversible. Úsalo solo si quieres empezar completamente de cero.',
      button: 'Borrar Base de Datos',
      dialog: {
        title: '¡Acción Irreversible!',
        description: 'Estás a punto de eliminar TODOS los datos de la aplicación. Para confirmar, escribe <strong>DELETE</strong> en el campo de abajo.',
        confirmLabel: 'Confirmación',
        confirmPlaceholder: 'Escribe DELETE aquí',
        confirmAction: 'Confirmar Borrado Total',
      },
      incorrectConfirmation: 'Confirmación Incorrecta',
      incorrectConfirmationDesc: 'Por favor, escribe DELETE para confirmar.',
      successToast: 'Todos los datos han sido eliminados. Se cerrará la sesión.',
      errorToast: 'El proceso de borrado falló y fue interrumpido.',
    },
    accessDenied: {
      title: 'Acceso Denegado',
      description: 'Esta página es solo para administradores.',
    },
    toastSuccess: 'Éxito',
    toastError: 'Error',
  },
  notFound: {
    title: 'Página No Encontrada',
    description: 'Oops. Parece que la página que buscas se ha perdido en el universo digital. Revisa la URL o vuelve al panel de control.',
    backButton: 'Volver al Panel de Control',
  },
};
