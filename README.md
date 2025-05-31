
# Java Unifier - Web Edition

A modern web-based tool designed to consolidate Java project files and other text-based sources (like `.xml`, `.txt`, `.sql`) into a single, organized document. This project is a web adaptation of the original [JavaSourceToTxt application by @LucatorL](https://github.com/LucatorL/JavaSourceToTxt), bringing its core file unification functionality to the browser.

It allows users to drag & drop project folders or individual files, select which ones to include, add content manually, preview the result, and download a unified text file.

## ✨ Features

-   **Drag & Drop:** Easily import project folders or individual files (`.java`, `.xml`, `.txt`, `.sql`, `.properties`, `.md`, `.csv`, `.yaml`, `.yml`, `.classpath`, `.project`, `.dat`).
-   **Selective Unification:** Intuitive modal to select exactly which files to include in the final output.
    -   Java files are selected by default.
    -   Other supported file types (XML, TXT, SQL, etc.) are deselected by default but can be included.
-   **Multi-Project Mode Toggle:** Switch between unifying all dropped projects at once or processing them one by one using navigation arrows in the selection modal.
-   **Manual Content Addition:** Add custom code snippets or text files directly within the selection modal. Choose to add them to an existing loaded project or as a new, separate item in the current batch.
-   **Live Preview & Token Estimation:** See a real-time preview of the unified content as you select files, along with an approximate token count useful for AI model inputs.
-   **Recent History:** Access a list of recently processed items. (Note: Due to browser security, files need to be re-dragged to be processed again).
-   **Dark/Light Theme:** Adapts to your system preference or can be toggled manually.
-   **In-App Changelog:** Click the version number in the header to see the application's update history.
-   **Direct Link to Report Issues/Suggestions.**

## 📸 Screenshots

<!-- 
    **INSTRUCCIONES PARA CAPTURAS DE PANTALLA:**
    1. Toma las capturas como se describe abajo.
    2. Sube las imágenes a tu repositorio (p. ej. en una carpeta `docs/images/`).
    3. Reemplaza los comentarios de abajo con la sintaxis de Markdown: 
       `![Texto alternativo de la imagen](ruta/relativa/a/la/imagen.png)`
-->

<!-- 
    **Captura 1: Interfaz Principal**
    Muestra: La página principal con la zona de arrastrar y soltar, controles de cabecera y pie de página.
    ![Main interface of Java Unifier](path/to/your/screenshot-main-interface.png) 
-->

<!-- 
    **Captura 2: Modal de Selección de Archivos (Modo Múltiples Proyectos)**
    Muestra: Modal con "Unificar Múltiples Proyectos" activado, archivos de varios proyectos, vista previa.
    ![File selection modal in multi-project mode](path/to/your/screenshot-modal-multi-project.png) 
-->

<!-- 
    **Captura 3: Modal de Selección de Archivos (Modo Proyecto Individual con Navegación)**
    Muestra: Modal con "Unificar Múltiples Proyectos" desactivado, mostrando un proyecto y flechas de navegación.
    ![File selection modal in single-project view mode with navigation](path/to/your/screenshot-modal-single-project-nav.png) 
-->

<!-- 
    **Captura 4: Modal de Añadir Contenido Manualmente**
    Muestra: El modal para añadir contenido manualmente, con el desplegable de destino.
    ![Manual content addition modal](path/to/your/screenshot-manual-add-modal.png) 
-->

<!-- 
    **(Opcional) Captura 5: Modal de Changelog**
    Muestra: El diálogo del changelog.
    ![In-app changelog modal](path/to/your/screenshot-changelog-modal.png) 
-->

## 🛠️ Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (using App Router)
-   **UI Library:** [React](https://reactjs.org/)
-   **Components:** [ShadCN UI](https://ui.shadcn.com/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started / How to Use

1.  **Visit the application:** `[Link to your deployed application, e.g., Vercel, Netlify, or GitHub Pages link]`
    *   (Alternatively, to run locally: Clone the repository, run `npm install` and then `npm run dev`.)
2.  **Drag & Drop Files:** Drag your Java project folder(s) or individual supported files onto the main dropzone.
3.  **Select Files for Unification:**
    *   A modal will appear listing all processed files, grouped by project and then by package (for Java files) or as "(Other Project Files)".
    *   By default, `.java` files are selected. Other supported files (like `.xml`, `.txt`) are initially deselected. Check or uncheck files as needed.
    *   Use the **"Unificar Múltiples Proyectos"** toggle in the header to switch modes:
        *   **ON:** View and select files from all dropped projects simultaneously. The unification will include selected files from all projects.
        *   **OFF:** View and select files from one project at a time. Use the `<` and `>` arrows on the sides of the modal to navigate between projects. Unification will only include files from the currently viewed project.
    *   Use the **"Añadir Manualmente"** button (at the bottom of the file list panel in the modal) to paste content, assign a filename, and choose to add it to an existing project in the current batch or as a new item.
4.  **Preview Content:**
    *   If **"Activar Vista Previa"** is enabled in the header, the right panel of the modal will show a live preview of the content that will be unified from the selected files.
    *   An estimated token count for the previewed content is also displayed.
5.  **Unify and Download:**
    *   Click **"Aceptar y Guardar"** in the modal.
    *   A `.txt` file containing the unified content of all selected files will be downloaded. The filename will be based on the project name(s).
    *   If in single-project mode (toggle OFF) and there were multiple projects, the processed project is removed from the modal, allowing you to continue with the next one.
6.  **Recent History:** The main page displays a list of recently processed projects/unifications. Clicking an item provides information, but due to browser security, you'll need to re-drag the original files to process them again.
7.  **Theme & Version Info:**
    *   Use the sun/moon icon in the header to toggle between dark and light themes.
    *   Click the version number (e.g., `v0.1.7`) in the header to view the application's changelog.

## 🤝 Contributing

Contributions are welcome! If you have suggestions or want to improve the application, please feel free to:
1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

You can also [open an issue](https://github.com/LucatorL/JavaSourceToTxt/issues) for bugs or feature requests (this link points to the original app's issues, update if you want issues for this web version specifically on its own repo).

## 📜 License

This project is open-source. You can specify a license if you wish (e.g., MIT License).

---
_This project is a web adaptation of the original [JavaSourceToTxt application by @LucatorL](https://github.com/LucatorL/JavaSourceToTxt). Inspired by its utility, this version aims to provide similar functionality in a modern web interface._
