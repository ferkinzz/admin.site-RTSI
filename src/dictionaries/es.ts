
export const dictionary = {
  login: {
    title: 'Iniciar Sesión',
    emailLabel: 'Correo Electrónico',
    passwordLabel: 'Contraseña',
    submitButton: 'Iniciar Sesión',
    error: 'Error de inicio de sesión. Por favor, compruebe sus credenciales.',
  },
  sidebar: {
    dashboard: 'Panel de Control',
    content: 'Contenido',
    instructions: 'Instrucciones',
    instructionsContent: `¡Bienvenido al Panel de Administración!

Esta es una guía rápida para ayudarte a empezar.

**Panel de Control**
Es tu página de inicio. Aquí puedes ver un resumen rápido del estado de tus contenidos.

**Gestión de Contenido**
Aquí es donde ocurre la magia.
-   Visita la sección de [Contenido](/dashboard/content) para ver la lista de todos tus artículos.
-   Usa el botón **"Nuevo Artículo"** para crear contenido desde cero.
-   En el formulario, puedes subir imágenes y archivos. Una vez subidos, usa el botón de copiar para obtener el enlace en formato Markdown y pégalo en el cuerpo del texto.
-   No olvides usar el selector de **Estado** para cambiar entre "Borrador" (privado) y "Publicado" (público).

**Configuración de Perfil**
-   Haz clic en tu nombre (abajo a la izquierda) y luego en [Configuración](/dashboard/settings).
-   Allí podrás actualizar tu nombre público, biografía y sitio web.`,
    logout: 'Cerrar Sesión',
    theme: 'Tema',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
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
      actions: 'Acciones',
      view: 'Ver Artículo',
      edit: 'Editar',
      delete: 'Eliminar',
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
    submit: 'Guardar Artículo',
    success: 'Artículo guardado con éxito.',
    error: 'Error al guardar el artículo.',
    write: 'Escribir',
    preview: 'Vista Previa',
    featuredImageLabel: 'Imagen Destacada',
    featuredImageDescription: 'La imagen no debe pesar más de 10MB.',
    featuredImageTooltip: 'Esta es la imagen principal del artículo. Una vez subida, usa el botón de copiar para pegar el código en el cuerpo del artículo.',
    additionalImageLabel: 'Imagen Adicional',
    additionalImageTooltip: 'Imagen adicional para el artículo. Una vez subida, usa el botón de copiar para pegar el código en el cuerpo del artículo.',
    copyMarkdown: 'Copiar Markdown',
    copyMarkdownTooltip: 'Pega esto en el artículo para mostrar la imagen.',
    copySuccessTitle: 'Copiado',
    copySuccessDescription: 'El código Markdown ha sido copiado.',
    deleteImageTooltip: 'Eliminar Imagen',
    uploadCTA: 'Haz clic para subir',
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
    fileUploadDescription: 'El archivo no debe pesar más de 10MB.',
    deleteFileTooltip: 'Eliminar Archivo',
    copyFileMarkdownTooltip: 'Copia el enlace de descarga en formato Markdown.',
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
  },
};
