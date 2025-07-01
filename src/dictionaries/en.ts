
import type { Dictionary } from '@/types';

export const dictionary: Dictionary = {
  login: {
    title: 'Login',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    submitButton: 'Login',
    error: 'Login failed. Please check your credentials.',
  },
  sidebar: {
    dashboard: 'Dashboard',
    content: 'Content',
    instructions: 'Instructions',
    instructionsContent: `Welcome to the Admin Panel!

Here is a quick guide to get you started.

**Dashboard**
This is your landing page. Here you can see a quick summary of your content's status.

**Content Management**
This is where the magic happens.
-   Visit the [Content](/dashboard/content) section to see a list of all your articles.
-   Use the **"New Article"** button to create content from scratch.
-   In the form, you can upload images and files. Once uploaded, use the copy button to get the link in Markdown format and paste it into the body of the text.
-   Don't forget to use the **Status** toggle to switch between "Draft" (private) and "Published" (public).

**Profile Settings**
-   Click on your name (bottom left) and then on [Settings](/dashboard/settings).
-   There you can update your public name, bio, and website.`,
    logout: 'Logout',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome back!',
    welcomeSubtitle: "Here's a summary of your site.",
    totalArticles: 'Total Articles',
    drafts: 'Drafts',
    published: 'Published',
    recentActivity: {
      title: 'Recent Activity',
      description: 'The last 5 updated articles.',
      viewAll: 'View All',
      articleTitle: 'Article',
      status: 'Status',
      lastUpdated: 'Last Updated',
      noArticles: 'No recent articles.',
    },
    contentBreakdown: {
      title: 'Content Breakdown',
      description: 'Distribution of your content types.',
    },
    statusValues: {
      draft: 'Draft',
      published: 'Published',
    },
    contentTypes: {
      blog: 'Blog',
      resource: 'Resource',
      video: 'Video',
      other: 'Other',
    },
    contentTypeTitle: 'Content Overview',
    contentTypeDescription: 'Click on a card to view all content of that type.',
  },
  content: {
    title: 'Content Management',
    description: 'Manage your articles and blog posts here.',
    newArticle: 'New Article',
    table: {
      title: 'Title',
      status: 'Status',
      actions: 'Actions',
      view: 'View Article',
      edit: 'Edit',
      delete: 'Delete',
    },
    statusValues: {
      draft: 'Draft',
      published: 'Published',
    },
    deleteDialog: {
      title: 'Are you sure?',
      description: 'This action cannot be undone. This will permanently delete the article.',
      cancel: 'Cancel',
      continue: 'Continue',
    },
  },
  contentForm: {
    createTitle: 'Create New Article',
    editTitle: 'Edit Article',
    titleLabel: 'Title',
    titlePlaceholder: 'Your article title',
    titleTooltip: 'This will be shown on the final page and in the URL.',
    bodyLabel: 'Body',
    bodyPlaceholder: 'Write your content here...',
    bodyTooltip: 'Markdown is supported. You can switch the view to see how it will look.',
    markdownHint: 'Markdown is supported.',
    statusLabel: 'Status (Draft)',
    statusTooltip: 'Defines if the article is publicly visible (Published) or only visible to administrators (Draft).',
    submit: 'Save Article',
    success: 'Article saved successfully.',
    error: 'Failed to save article.',
    write: 'Write',
    preview: 'Preview',
    featuredImageLabel: 'Featured Image',
    featuredImageDescription: 'Image size must be less than 10MB.',
    featuredImageTooltip: 'This is the main image for the article. After uploading, use the copy button to paste the markdown code into the body.',
    additionalImageLabel: 'Additional Image',
    additionalImageTooltip: 'Additional image for the article. After uploading, use the copy button to paste the markdown code into the body.',
    copyMarkdown: 'Copy Markdown',
    copyMarkdownTooltip: 'Paste this into the article to display the image.',
    copySuccessTitle: 'Copied',
    copySuccessDescription: 'The Markdown code has been copied.',
    deleteImageTooltip: 'Delete Image',
    uploadCTA: 'Click to upload',
    statusValues: {
      draft: 'Draft',
      published: 'Published',
    },
    infoDialogTitle: 'Information',
    infoDialogClose: 'Close',
    articleTypeLabel: 'Content Type',
    articleTypePlaceholder: 'Select a type',
    articleTypeTooltip: 'Classify the content for better organization.',
    articleTypeValues: {
        blog: 'Article or Blog',
        resource: 'Resource',
        video: 'Video',
        other: 'Other (specify)',
    },
    otherTypeLabel: 'Specify Type',
    otherTypePlaceholder: 'e.g. Podcast',
    otherTypeTooltip: 'Enter the custom content type. Single word, max 20 characters.',
    categoriesLabel: 'Categories',
    categoriesPlaceholder: 'travel, tips, advice',
    categoriesTooltip: 'Comma-separated list of categories.',
    fileUploadLabel: 'File Attachment',
    fileUploadDescription: 'File size must be less than 10MB.',
    deleteFileTooltip: 'Delete File',
    copyFileMarkdownTooltip: 'Copy the download link as Markdown.',
  },
  settings: {
    title: 'Profile Settings',
    description: 'This information will be publicly visible. Edit how others see you.',
    displayNameLabel: 'Display Name',
    bioLabel: 'Biography',
    websiteLabel: 'Website',
    websitePlaceholder: 'https://your-site.com',
    submitButton: 'Save Profile',
    successMessage: 'Profile updated successfully.',
    errorMessage: 'Failed to update profile.',
    changePhotoButton: 'Change photo',
    uploadingPhoto: 'Uploading photo...',
  },
};
