
// app/page.tsx
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { HeaderControls } from '@/components/java-unifier/HeaderControls';
import { FileDropzone } from '@/components/java-unifier/FileDropzone';
import { RecentFilesList } from '@/components/java-unifier/RecentFilesList';
import { FileSelectionModal } from '@/components/java-unifier/FileSelectionModal';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { ProjectFile, RecentEntry, ProcessedFile } from '@/types/java-unifier';
import { processDroppedItems, unifyJavaFiles, downloadTextFile, getProjectBaseName, getFileExtension, extractJavaPackageName, SUPPORTED_EXTENSIONS } from '@/lib/file-processor';
import { DEFAULT_PACKAGE_NAME_LOGIC, OTHER_FILES_PACKAGE_NAME_LOGIC, t, type Language, translations } from '@/lib/translations';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';


const MAX_RECENTS = 5; 
const APP_VERSION = "0.1.7"; 

export default function JavaUnifierPage() {
  const [recents, setRecents] = useLocalStorage<RecentEntry[]>('java-unifier-recents', []);
  const [language, setLanguage] = useLocalStorage<Language>('java-unifier-language', 'es');
  
  const [processedProjects, setProcessedProjects] = useState<ProjectFile[]>([]);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  
  const [isRecentInfoModalOpen, setIsRecentInfoModalOpen] = useState(false);
  const [selectedRecentForInfoModal, setSelectedRecentForInfoModal] = useState<RecentEntry | null>(null);
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(true);
  const [isMultiProjectMode, setIsMultiProjectMode] = useState(true); 
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);
  const [currentProjectIndexInModal, setCurrentProjectIndexInModal] = useState(0);

  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('appTitle', language);
  }, [language]);

  useEffect(() => {
    if (isSelectionModalOpen && processedProjects.length === 0) {
      setIsSelectionModalOpen(false);
    }
  }, [processedProjects, isSelectionModalOpen]);

  const addRecentEntry = useCallback((project: ProjectFile | RecentEntry, customName?: string) => {
    setRecents(prevRecents => {
      const newEntry: RecentEntry = { 
        id: project.id, 
        name: customName || project.name, 
        timestamp: Date.now(), 
        type: 'type' in project ? project.type : 'folder' 
      };
      const filteredRecents = prevRecents.filter(r => r.id !== newEntry.id);
      const updatedRecents = [newEntry, ...filteredRecents].slice(0, MAX_RECENTS);
      return updatedRecents;
    });
  }, [setRecents]);

  const removeRecentEntry = useCallback((id: string) => {
    setRecents(prevRecents => prevRecents.filter(r => r.id !== id));
    toast({ title: t('successToastTitle', language), description: t('entryDeletedFromHistoryToast', language) });
  }, [setRecents, toast, language]);

  const handleFilesDropped = async (droppedItems: FileSystemFileEntry[]) => {
    if (droppedItems.length === 0) return;

    try {
      const projects = await processDroppedItems(droppedItems);
      if (projects.length === 0 || projects.every(p => p.files.length === 0)) {
        toast({
          title: t('noSupportedFilesFoundToastTitle', language),
          description: t('noSupportedFilesFoundToastDescription', language, { extensions: SUPPORTED_EXTENSIONS.join(', ') }),
          variant: "default",
        });
        return;
      }
      
      setProcessedProjects(projects); 
      
      projects.forEach(proj => {
        if(proj.files.length > 0) addRecentEntry(proj);
      });
      
      setCurrentProjectIndexInModal(0); 
      
      if (projects.length > 0) {
        setIsSelectionModalOpen(true); 
      }

    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        title: t('processingErrorToastTitle', language),
        description: t('processingErrorToastDescription', language),
        variant: "destructive",
      });
    }
  };
  
  const handleSelectionModalClose = useCallback(() => {
    setIsSelectionModalOpen(false); 

    if (isMultiProjectMode || processedProjects.length <= 1) {
        setProcessedProjects([]);
    } else {
      if (processedProjects[currentProjectIndexInModal]) {
        const projectToRemoveId = processedProjects[currentProjectIndexInModal].id;
        const updatedProjects = processedProjects.filter(p => p.id !== projectToRemoveId);
        setProcessedProjects(updatedProjects);
        
        if (updatedProjects.length > 0) {
          setCurrentProjectIndexInModal(prevIndex => Math.max(0, Math.min(prevIndex, updatedProjects.length - 1)));
          setIsSelectionModalOpen(true); 
        } else {
          setProcessedProjects([]);
        }
      } else {
        setProcessedProjects([]); 
      }
    }
  }, [isMultiProjectMode, processedProjects, currentProjectIndexInModal, setProcessedProjects, setIsSelectionModalOpen, setCurrentProjectIndexInModal]);


  const handleSingleProjectProcessed = (projectId: string, downloadData: { fileName: string; content: string }) => {
    downloadTextFile(downloadData.fileName, downloadData.content);
    const projectThatWasProcessed = processedProjects.find(p => p.id === projectId);
    if (projectThatWasProcessed) {
        addRecentEntry(projectThatWasProcessed); 
    }

    const updatedProjects = processedProjects.filter(p => p.id !== projectId);
    setProcessedProjects(updatedProjects); 
    
    setCurrentProjectIndexInModal(idx => Math.max(0, Math.min(idx, updatedProjects.length - 1)));
    
    toast({ 
      title: t('successToastTitle', language), 
      description: t('projectProcessedAndDownloadedToast', language, { projectName: getProjectBaseName(downloadData.fileName.replace('_unificado.txt', '')) }) 
    });

    if (updatedProjects.length === 0) {
        setIsSelectionModalOpen(false);
    } else {
      setIsSelectionModalOpen(true); // Keep modal open if other projects remain
    }
  };

  const handleMultiProjectProcessed = (projectIdsProcessed: string[], downloadData: { fileName: string; content: string }) => {
    downloadTextFile(downloadData.fileName, downloadData.content);

    const projectsThatWereProcessed = processedProjects.filter(p => projectIdsProcessed.includes(p.id));
    let recentName = t('unifiedProjectsGenericName', language);
    if (projectsThatWereProcessed.length > 0) {
        const names = projectsThatWereProcessed.map(p => p.name).slice(0,3);
        recentName = `${t('projectUnifiedNamePrefix', language)}${names.join(', ')}${projectsThatWereProcessed.length > 3 ? t('projectUnifiedNameSuffixOthers', language) : ''}`;
    } else if (downloadData.fileName) {
        recentName = getProjectBaseName(downloadData.fileName.replace('_unificado.txt', '')) || t('unifiedProjectsGenericName', language);
    }

    const unifiedRecentEntry: RecentEntry = {
        id: `unified-${Date.now()}-${Math.random()}`,
        name: recentName,
        timestamp: Date.now(),
        type: 'folder', 
    };
    addRecentEntry(unifiedRecentEntry, recentName); 
    
    setProcessedProjects(prev => prev.filter(p => !projectIdsProcessed.includes(p.id)));
    
    toast({ title: t('successToastTitle', language), description: t('fileDownloadedToast', language, { fileName: downloadData.fileName }) });
    setIsSelectionModalOpen(false); 
  };

  const handleManualContentAddRequested = (fileName: string, content: string, targetProjectId: string | 'new_project') => {
    if (!fileName.trim() || !content.trim()) {
      toast({ title: t('error', language), description: t('fileNameEmptyError', language), variant: "destructive" });
      return;
    }

    const fileType = getFileExtension(fileName);
    let packageName = fileType === 'java' ? extractJavaPackageName(content) : OTHER_FILES_PACKAGE_NAME_LOGIC;
    if (packageName === '' && fileType === 'java') packageName = DEFAULT_PACKAGE_NAME_LOGIC;

    const uniqueFileId = `manual-file-${Date.now()}-${Math.random()}`;

    if (targetProjectId !== 'new_project' && processedProjects.some(p => p.id === targetProjectId)) {
        setProcessedProjects(prevProjects => 
            prevProjects.map(proj => {
                if (proj.id === targetProjectId) {
                    const newFile: ProcessedFile = {
                        id: uniqueFileId,
                        path: fileName, 
                        name: fileName,
                        content,
                        packageName,
                        fileType,
                        projectName: proj.name, 
                        selected: fileType === 'java',
                    };
                    const updatedProject = { ...proj, files: [...proj.files, newFile], timestamp: Date.now() };
                    addRecentEntry(updatedProject);
                    toast({ title: t('fileAddedToastTitle', language), description: t('fileXAddedToYToast', language, { fileName, projectName: proj.name }) });
                    return updatedProject;
                }
                return proj;
            })
        );
    } else {
        const newProjectName = `Manual: ${getProjectBaseName(fileName) || 'Archivo'}`;
        const newFile: ProcessedFile = {
            id: uniqueFileId,
            path: fileName,
            name: fileName,
            content,
            packageName,
            fileType,
            projectName: newProjectName,
            selected: fileType === 'java',
        };
        const newProject: ProjectFile = {
            id: `manual-project-${Date.now()}-${Math.random()}`,
            name: newProjectName,
            type: 'file', 
            files: [newFile],
            timestamp: Date.now(),
        };

        setProcessedProjects(prevProjects => [...prevProjects, newProject]);
        addRecentEntry(newProject); 
        
        if (!isSelectionModalOpen || (processedProjects.length === 0 && !isMultiProjectMode)) {
            setCurrentProjectIndexInModal(processedProjects.length); // Go to new project if modal wasn't open or was empty
            setIsSelectionModalOpen(true);
        } else if (!isMultiProjectMode) {
             setCurrentProjectIndexInModal(processedProjects.length); // Go to the new project
        }
        toast({ title: t('fileAddedToastTitle', language), description: t('fileXAddedAsNewProjectToast', language, { fileName }) });
    }
  };


  const handleSelectRecent = (recent: RecentEntry) => {
    setSelectedRecentForInfoModal(recent);
    setIsRecentInfoModalOpen(true);
  };

  const handleVersionClick = () => {
    setIsChangelogModalOpen(true);
  };

  const changelogContent = `
    <ul class="list-disc pl-5 space-y-2 text-sm">
       <li>
        Versión ${APP_VERSION} (UI Traducida)
        <ul class="list-disc pl-5 space-y-1 mt-1">
          <li>Internacionalización: Interfaz de usuario ahora disponible en Inglés y Español.</li>
          <li>Selector de idioma movido a la cabecera.</li>
          <li>Adición Manual de Archivos Mejorada:
            <ul class="list-disc pl-5">
              <li>Al añadir un archivo manualmente desde el modal de selección:
                <ul class="list-disc pl-5">
                  <li>Si "Unificar Múltiples Proyectos" está activado, se puede elegir añadir el archivo a un proyecto existente o crearlo como un nuevo "proyecto" en la lista.</li>
                  <li>Si "Unificar Múltiples Proyectos" está desactivado, se puede elegir añadir el archivo al proyecto actual visible o crearlo como un nuevo "proyecto".</li>
                </ul>
              </li>
              <li>La entrada de "Recientes" se actualiza para el proyecto modificado o el nuevo proyecto manual.</li>
            </ul>
          </li>
          <li>Historial de Procesados Más Descriptivo:
            <ul class="list-disc pl-5">
              <li>Al unificar múltiples proyectos, la entrada en "Recientes" ahora lista los nombres de los proyectos unificados (ej: "Unificación de: ProyectoA, ProyectoB").</li>
            </ul>
          </li>
        </ul>
      </li>
      <li>
        Versión 0.1.6
        <ul class="list-disc pl-5 space-y-1 mt-1">
          <li>Adición Manual de Archivos (Comportamiento Anterior):
            <ul class="list-disc pl-5">
              <li>Si "Unificar Múltiples Proyectos" estaba desactivado y había un proyecto visible, el archivo manual se añadía a ese proyecto.</li>
              <li>En otros casos, el archivo manual creaba un nuevo "proyecto" en la lista.</li>
            </ul>
          </li>
          <li>Historial de Recientes para Unificaciones Múltiples (Comportamiento Anterior):
            <ul class="list-disc pl-5">
              <li>Se creaba una entrada genérica en "Recientes" (ej: "Proyectos Unificados").</li>
            </ul>
          </li>
        </ul>
      </li>
      <li>
        Versión 0.1.5
        <ul class="list-disc pl-5 space-y-1 mt-1">
          <li>Funcionalidad "Añadir Contenido Manualmente":
            <ul class="list-disc pl-5">
              <li>El botón para añadir contenido manualmente se movió al modal de selección de archivos.</li>
              <li>El archivo creado manualmente se añadía a la lista de proyectos.</li>
            </ul>
          </li>
        </ul>
      </li>
      <li>
        Versión 0.1.4
        <ul class="list-disc pl-5 space-y-1 mt-1">
          <li>Reestructurado el formato del changelog.</li>
          <li>Ajustado el comportamiento al cerrar el modal de selección de archivos con "X"/Esc/Cancelar.</li>
          <li>Corregida la gestión de la descarga de proyectos individuales.</li>
        </ul>
      </li>
      <li>
        Versión 0.1.3
        <ul class="list-disc pl-5 space-y-1 mt-1">
          <li>Corregido un error grave donde proyectos cerrados podían ser incluidos incorrectamente en unificaciones posteriores.</li>
        </ul>
      </li>
       <li>
        Versión 0.1.2
        <ul class="list-disc pl-5 space-y-1 mt-1">
          <li>Corregido error de visualización de conteo de tokens negativo.</li>
          <li>Corregido error de posicionamiento del modal de selección de archivos.</li>
        </ul>
      </li>
      <li>
        Versión 0.1.1
        <ul class="list-disc pl-5 space-y-1 mt-1">
          <li>Rehabilitado el interruptor "Unificar Múltiples Proyectos".</li>
          <li>Añadida navegación por proyectos individuales en el modal.</li>
          <li>En modo de proyecto individual, al descargar, solo ese proyecto se elimina de la lista.</li>
        </ul>
      </li>
      <li>
        Versión Inicial (0.1.0 y anteriores)
        <ul class="list-disc pl-5 space-y-1 mt-1">
          <li>Funcionalidad de arrastrar y soltar, soporte de tipos de archivo, modal de selección, descarga, historial, tema, enlace a GitHub.</li>
          <li>Estimación de tokens, versión de app en cabecera y changelog.</li>
          <li>Actualización automática del changelog.</li>
          <li>Foto de perfil y enlace a GitHub de Lucas en pie de página.</li>
        </ul>
      </li>
    </ul>
  `;


  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <HeaderControls 
        previewEnabled={isPreviewEnabled}
        onPreviewToggle={(checked) => setIsPreviewEnabled(!!checked)}
        multiProjectModeEnabled={isMultiProjectMode}
        onMultiProjectModeToggle={(checked) => setIsMultiProjectMode(!!checked)}
        appVersion={APP_VERSION}
        onVersionClick={handleVersionClick}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <FileDropzone onFilesProcessed={handleFilesDropped} currentLanguage={language} />
        <RecentFilesList 
            recents={recents} 
            onSelectRecent={handleSelectRecent}
            onRemoveRecent={removeRecentEntry}
            currentLanguage={language}
        />
      </main>
      {isSelectionModalOpen && processedProjects.length > 0 && (
        <FileSelectionModal
          key={processedProjects.map(p => p.id).join('-') + `-${currentProjectIndexInModal}-${isMultiProjectMode}-${language}`} 
          isOpen={isSelectionModalOpen}
          onClose={handleSelectionModalClose} 
          projectsToProcess={processedProjects}
          onSingleProjectProcessed={handleSingleProjectProcessed}
          onMultiProjectProcessed={handleMultiProjectProcessed}
          isMultiProjectMode={isMultiProjectMode}
          showPreview={isPreviewEnabled}
          initialProjectIndex={currentProjectIndexInModal}
          onProjectViewedIndexChange={setCurrentProjectIndexInModal}
          onManualFileRequested={handleManualContentAddRequested} 
          currentLanguage={language}
        />
      )}
      {selectedRecentForInfoModal && (
         <AlertDialog open={isRecentInfoModalOpen} onOpenChange={setIsRecentInfoModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('recentInfoModalTitle', language, { recentName: selectedRecentForInfoModal.name })}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('recentInfoModalDescription1', language)}
                <br /><br />
                {t('recentInfoModalType', language, { type: selectedRecentForInfoModal.type === 'folder' ? t('folderUnificationType', language) : t('individualFileType', language) })}
                <br />
                {t('recentInfoModalProcessedOn', language, { timestamp: new Date(selectedRecentForInfoModal.timestamp).toLocaleString(language) })}
                <br /><br />
                {t('recentInfoModalSecurity', language)}
                <br /><br />
                {t('recentInfoModalReprocess', language, { recentName: selectedRecentForInfoModal.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsRecentInfoModalOpen(false)}>{t('understood', language)}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {isChangelogModalOpen && (
        <AlertDialog open={isChangelogModalOpen} onOpenChange={setIsChangelogModalOpen}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>{t('versionNewsTitle', language, { version: APP_VERSION })}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                 <div className="max-h-[60vh] overflow-y-auto pr-2 mt-2" dangerouslySetInnerHTML={{ __html: changelogContent }} />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsChangelogModalOpen(false)}>{t('close', language)}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <footer className="text-center p-4 border-t text-sm text-muted-foreground flex flex-col sm:flex-row justify-between items-center">
        <span className="flex items-center">
          {t('footerAdaptedFrom', language)}&nbsp;
          <a
            href="https://github.com/LucatorL/JavaSourceToTxt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {t('originalApplicationLinkText', language)}
          </a>
          &nbsp;{t('byText', language)}&nbsp;
          <a 
            href="https://github.com/LucatorL" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center text-primary hover:underline"
          >
            <Image 
              src="https://github.com/LucatorL.png" 
              alt={t('lucasProfileText', language)}
              width={24} 
              height={24} 
              className="rounded-full mr-1.5 ml-0.5"
              data-ai-hint="github profile"
            />
            {t('lucasProfileText', language)}
          </a>.
        </span>
        <Button variant="link" asChild className="mt-2 sm:mt-0 text-muted-foreground hover:text-primary">
          <a href="https://github.com/LucatorL/JavaSourceToTxt-WEB-/issues" target="_blank" rel="noopener noreferrer">
            <Github className="mr-2 h-4 w-4" />
            {t('reportIssueLinkText', language)}
          </a>
        </Button>
      </footer>
    </div>
  );
}


    