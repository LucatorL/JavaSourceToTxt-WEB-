// components/java-unifier/FileSelectionModal.tsx
"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ProcessedFile, ProjectFile, PackageGroup, ProjectGroup } from '@/types/java-unifier';
import { unifyJavaFiles, getProjectBaseName } from '@/lib/file-processor';
import { Copy, Download, Eye, CheckSquare, Square, FileText, FileCode, Database, Settings2, Info, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ManualAddContentModal } from '@/components/java-unifier/ManualAddContentModal';
import { t, type Language, DEFAULT_PACKAGE_NAME_LOGIC, OTHER_FILES_PACKAGE_NAME_LOGIC } from '@/lib/translations';

interface FileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void; 
  projectsToProcess: ProjectFile[];
  onSingleProjectProcessed: (projectId: string, downloadData: { fileName: string; content: string }) => void;
  onMultiProjectProcessed: (projectIdsToRemove: string[], downloadData: { fileName: string; content: string }) => void;
  isMultiProjectMode: boolean;
  showPreview: boolean;
  initialProjectIndex?: number;
  onProjectViewedIndexChange?: (index: number) => void;
  onManualFileRequested: (fileName: string, content: string, targetProjectId: string | 'new_project') => void;
  currentLanguage: Language;
}

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'java':
      return <FileCode className="w-3.5 h-3.5 mr-1.5 text-blue-500 shrink-0" />;
    case 'xml':
    case 'pom':
      return <Settings2 className="w-3.5 h-3.5 mr-1.5 text-orange-500 shrink-0" />;
    case 'sql':
      return <Database className="w-3.5 h-3.5 mr-1.5 text-indigo-500 shrink-0" />;
    case 'txt':
    case 'md':
    case 'properties':
    case 'csv':
    case 'yaml':
    case 'yml':
    case 'classpath':
    case 'project':
    case 'dat':
    default:
      return <FileText className="w-3.5 h-3.5 mr-1.5 text-gray-500 shrink-0" />;
  }
};


export function FileSelectionModal({
  isOpen,
  onClose,
  projectsToProcess,
  onSingleProjectProcessed,
  onMultiProjectProcessed,
  isMultiProjectMode,
  showPreview,
  initialProjectIndex = 0,
  onProjectViewedIndexChange,
  onManualFileRequested,
  currentLanguage,
}: FileSelectionModalProps) {
  const [currentDisplayProjects, setCurrentDisplayProjects] = useState<ProjectFile[]>(projectsToProcess);
  const [unifiedPreview, setUnifiedPreview] = useState("");
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const { toast } = useToast();
  // const [outputFileName, setOutputFileName] = useState("proyecto_unificado.txt"); // No longer needed here
  const [individualFilePreview, setIndividualFilePreview] = useState<{ name: string, content: string, fileType: string } | null>(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(initialProjectIndex);
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);

  useEffect(() => {
    setCurrentDisplayProjects(projectsToProcess);
    if (projectsToProcess.length > 0) {
      const newIndex = Math.min(currentProjectIndex, projectsToProcess.length - 1);
      if (newIndex !== currentProjectIndex) {
        setCurrentProjectIndex(newIndex);
      }
    }
  }, [projectsToProcess, isOpen, currentProjectIndex]);

  useEffect(() => {
    setCurrentProjectIndex(initialProjectIndex);
  }, [initialProjectIndex]);
  
  useEffect(() => {
    if (onProjectViewedIndexChange) {
      onProjectViewedIndexChange(currentProjectIndex);
    }
  }, [currentProjectIndex, onProjectViewedIndexChange]);

  // OutputFileName is now determined in handleConfirmAndSave just before download
  // useEffect(() => {
  //   let fileName = "Proyectos_Unificados_unificado.txt";
  //   if (currentDisplayProjects.length > 0) {
  //     const projectForName = currentDisplayProjects[currentProjectIndex] || currentDisplayProjects[0];
  //     if (isMultiProjectMode) {
  //       fileName = (currentDisplayProjects.length > 1 ? "Proyectos_Unificados" : getProjectBaseName(projectForName?.name || "proyecto")) + "_unificado.txt";
  //     } else {
  //       fileName = getProjectBaseName(projectForName?.name || "proyecto") + "_unificado.txt";
  //     }
  //   }
  //   setOutputFileName(fileName);
  // }, [currentProjectIndex, isMultiProjectMode, currentDisplayProjects]);


  useEffect(() => {
    if (showPreview && currentDisplayProjects.length > 0) {
      const projectsForPreview = isMultiProjectMode ? currentDisplayProjects : (currentDisplayProjects[currentProjectIndex] ? [currentDisplayProjects[currentProjectIndex]] : []);
      const selectedProjectsForPreview = projectsForPreview.map(p => ({
        ...p,
        files: p.files.filter(f => f.selected) 
      })).filter(p => p.files.length > 0);

      if (selectedProjectsForPreview.length === 0) {
        setUnifiedPreview("");
        setEstimatedTokens(0);
        return;
      }
      // Pass language to unifyJavaFiles if its output comments need translation
      const content = unifyJavaFiles(selectedProjectsForPreview, isMultiProjectMode); 
      setUnifiedPreview(content);
      const tokens = Math.max(0, Math.ceil(content.length / 4));
      setEstimatedTokens(tokens);
    } else {
      setUnifiedPreview("");
      setEstimatedTokens(0);
    }
  }, [currentDisplayProjects, isMultiProjectMode, currentProjectIndex, showPreview]);

  const handleFileSelectionChange = (projectId: string, fileId: string, selected: boolean) => {
    setCurrentDisplayProjects(prevProjects =>
      prevProjects.map(proj =>
        proj.id === projectId
          ? {
              ...proj,
              files: proj.files.map(file =>
                file.id === fileId ? { ...file, selected } : file
              ),
            }
          : proj
      )
    );
  };

  const handleSelectAllInVisibleProjects = (selectAllFiles: boolean) => {
    const targetProjectIds = isMultiProjectMode 
      ? currentDisplayProjects.map(p => p.id) 
      : (currentDisplayProjects[currentProjectIndex] ? [currentDisplayProjects[currentProjectIndex].id] : []);

    setCurrentDisplayProjects(prevProjects =>
      prevProjects.map(proj =>
        targetProjectIds.includes(proj.id)
          ? {
              ...proj,
              files: proj.files.map(file => ({ ...file, selected: selectAllFiles })),
            }
          : proj
      )
    );
  };
  
  const handleSelectOnlyJavaInVisibleProjects = (selectJava: boolean) => {
    const targetProjectIds = isMultiProjectMode 
      ? currentDisplayProjects.map(p => p.id) 
      : (currentDisplayProjects[currentProjectIndex] ? [currentDisplayProjects[currentProjectIndex].id] : []);

    setCurrentDisplayProjects(prevProjects =>
        prevProjects.map(proj =>
          targetProjectIds.includes(proj.id)
            ? {
                ...proj,
                files: proj.files.map(file => ({
                ...file,
                selected: file.fileType === 'java' ? selectJava : (selectJava ? false : file.selected)
                })),
            }
            : proj
        )
    );
  };

  const handleConfirmAndSave = () => {
    let finalOutputFileName: string;
    let finalUnifiedContent: string;
    // let projectsIncludedInUnification: ProjectFile[] = []; // Not strictly needed locally


    if (isMultiProjectMode) {
      const projectsToUnify = currentDisplayProjects.map(p => ({
        ...p,
        files: p.files.filter(f => f.selected)
      })).filter(p => p.files.length > 0);

      if (projectsToUnify.length === 0) {
        toast({ title: t('noSelection', currentLanguage), description: t('pleaseSelectOneFileFromAProject', currentLanguage), variant: "destructive" });
        return;
      }
      finalUnifiedContent = unifyJavaFiles(projectsToUnify, true); // Pass lang if needed
      const baseName = projectsToUnify.length > 1 || !projectsToUnify[0] 
        ? t('unifiedProjectsGenericName', currentLanguage).replace(/\s/g, '_') 
        : getProjectBaseName(projectsToUnify[0].name);
      finalOutputFileName = `${baseName}_unificado.txt`;
      
      // projectsIncludedInUnification = projectsToUnify;
      const projectIdsProcessed = projectsToUnify.map(p => p.id);

      onMultiProjectProcessed(projectIdsProcessed, { fileName: finalOutputFileName, content: finalUnifiedContent });
    
    } else if (currentDisplayProjects[currentProjectIndex]) {
      const currentProjectForConfirm = currentDisplayProjects[currentProjectIndex];
      const selectedFiles = currentProjectForConfirm.files.filter(f => f.selected);

      if (selectedFiles.length === 0) {
        toast({ title: t('noSelection', currentLanguage), description: t('pleaseSelectOneFileFromCurrentProject', currentLanguage), variant: "destructive" });
        return;
      }
      finalUnifiedContent = unifyJavaFiles([{...currentProjectForConfirm, files: selectedFiles}], false); // Pass lang if needed
      finalOutputFileName = getProjectBaseName(currentProjectForConfirm.name) + "_unificado.txt";
      
      // projectsIncludedInUnification = [currentProjectForConfirm];
      onSingleProjectProcessed(currentProjectForConfirm.id, { fileName: finalOutputFileName, content: finalUnifiedContent });
    } else {
      toast({ title: t('error', currentLanguage), description: t('noProjectToUnify', currentLanguage), variant: "destructive" });
      return;
    }
  };


  const handleCopyToClipboard = () => {
    if (!unifiedPreview) {
        toast({ title: t('emptyContent', currentLanguage), description: t('nothingToCopy', currentLanguage), variant: "destructive" });
        return;
    }
    navigator.clipboard.writeText(unifiedPreview)
      .then(() => toast({ title: t('copied', currentLanguage), description: t('unifiedContentCopied', currentLanguage) }))
      .catch(() => toast({ title: t('error', currentLanguage), description: t('couldNotCopyToClipboard', currentLanguage), variant: "destructive" }));
  };

  const projectsForListDisplay = useMemo(() => {
    if (isMultiProjectMode || !currentDisplayProjects[currentProjectIndex]) {
      return currentDisplayProjects;
    }
    return [currentDisplayProjects[currentProjectIndex]];
  }, [currentDisplayProjects, isMultiProjectMode, currentProjectIndex]);

  const organizedData: ProjectGroup[] = useMemo(() => { 
    return projectsForListDisplay.map(project => {
      const packageMap = new Map<string, ProcessedFile[]>();
      project.files.forEach(file => {
        const list = packageMap.get(file.packageName) || [];
        list.push(file);
        packageMap.set(file.packageName, list);
      });
      
      const packages: PackageGroup[] = Array.from(packageMap.entries())
        .sort(([pkgA], [pkgB]) => {
            if (pkgA === DEFAULT_PACKAGE_NAME_LOGIC) return -1;
            if (pkgB === DEFAULT_PACKAGE_NAME_LOGIC) return 1;
            if (pkgA === OTHER_FILES_PACKAGE_NAME_LOGIC && pkgB !== DEFAULT_PACKAGE_NAME_LOGIC) return 1; 
            if (pkgB === OTHER_FILES_PACKAGE_NAME_LOGIC && pkgA !== DEFAULT_PACKAGE_NAME_LOGIC) return -1;
            return pkgA.localeCompare(pkgB);
        })
        .map(([packageName, filesInPkg]) => ({
          packageName, // This is the logic constant
          files: filesInPkg.sort((a,b) => a.name.localeCompare(b.name)),
        }));
      
      return { projectName: project.name, projectActualId: project.id, packages };
    });
  }, [projectsForListDisplay, currentLanguage]); // Added currentLanguage dependency

  const getDisplayPackageName = (packageNameConstant: string) => {
    if (packageNameConstant === DEFAULT_PACKAGE_NAME_LOGIC) {
      return t('defaultPackageNameDisplay', currentLanguage);
    }
    if (packageNameConstant === OTHER_FILES_PACKAGE_NAME_LOGIC) {
      return t('otherFilesPackageNameDisplay', currentLanguage);
    }
    return packageNameConstant;
  };


  const handleNextProject = useCallback(() => {
    setCurrentProjectIndex(prev => Math.min(projectsToProcess.length - 1, prev + 1));
  }, [projectsToProcess.length]);

  const handlePrevProject = useCallback(() => {
    setCurrentProjectIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleModalManualContentSubmit = (fileName: string, content: string, targetProjectId: string | 'new_project') => {
    onManualFileRequested(fileName, content, targetProjectId);
    setIsManualAddModalOpen(false); 
  };


  if (!isOpen || projectsToProcess.length === 0) return null; 
  const currentSingleProjectNameForTitle = !isMultiProjectMode && currentDisplayProjects[currentProjectIndex] ? currentDisplayProjects[currentProjectIndex].name : (projectsToProcess[0]?.name || 'Proyecto');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) onClose(); }}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        {!isMultiProjectMode && projectsToProcess.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevProject}
              disabled={currentProjectIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full shadow-md bg-background/80 hover:bg-background"
              title={t('previousProject', currentLanguage)} 
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextProject}
              disabled={currentProjectIndex === projectsToProcess.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full shadow-md bg-background/80 hover:bg-background"
              title={t('nextProject', currentLanguage)} 
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
        
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {isMultiProjectMode ? t('unifyMultipleProjectsTitle', currentLanguage) : t('selectFilesFromProjectTitle', currentLanguage, { projectName: currentSingleProjectNameForTitle })}
            {!isMultiProjectMode && projectsToProcess.length > 1 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                    {t('projectPageIndicator', currentLanguage, { currentIndex: currentProjectIndex + 1, totalProjects: projectsToProcess.length })}
                </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {t('selectFilesModalDescription', currentLanguage)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden p-6 pt-2">
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2 p-1 rounded-md bg-secondary flex-wrap gap-1">
              <Label className="font-semibold px-2">
                {isMultiProjectMode ? t('projectFiles', currentLanguage) : t('filesFromProject', currentLanguage, { projectName: currentDisplayProjects[currentProjectIndex]?.name || t('currentProjectFallbackName', currentLanguage) })}
              </Label>
              <div className="space-x-1">
                <Button variant="ghost" size="sm" onClick={() => handleSelectOnlyJavaInVisibleProjects(true)} title={t('onlyJava', currentLanguage)}>
                  <FileCode className="w-4 h-4 mr-1" /> {t('onlyJava', currentLanguage)}
                </Button>
                 <Button variant="ghost" size="sm" onClick={() => handleSelectAllInVisibleProjects(true)} title={t('selectAll', currentLanguage)}>
                  <CheckSquare className="w-4 h-4" /> {t('selectAll', currentLanguage)}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleSelectAllInVisibleProjects(false)} title={t('deselectAll', currentLanguage)}>
                  <Square className="w-4 h-4" /> {t('deselectAll', currentLanguage)}
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-grow border rounded-md p-1">
              {organizedData.length === 0 && (
                  <p className="text-sm text-muted-foreground p-4 text-center">{t('noSelectableFiles', currentLanguage)}</p>
              )}
              {organizedData.map(projectGroup => (
                <div key={projectGroup.projectName + projectGroup.projectActualId} className="mb-3">
                  {(isMultiProjectMode && projectsToProcess.length > 1 && projectsForListDisplay.length > 1) && (
                    <h4 className="text-sm font-semibold p-2 bg-muted rounded-t-md sticky top-0 z-10">{projectGroup.projectName}</h4>
                  )}
                  {projectGroup.packages.map(pkgGroup => (
                    <div key={pkgGroup.packageName} className="mb-2">
                       <p className="text-xs font-medium text-muted-foreground px-2 py-1">{getDisplayPackageName(pkgGroup.packageName)}</p>
                      <ul className="ml-2">
                        {pkgGroup.files.map(file => (
                          <li key={file.id} className="flex items-center justify-between text-sm py-0.5 px-1 rounded hover:bg-accent/50 group">
                            <div className="flex items-center flex-grow overflow-hidden">
                              <Checkbox
                                id={`${projectGroup.projectActualId}-${file.id}`}
                                checked={file.selected}
                                onCheckedChange={(checked) => handleFileSelectionChange(projectGroup.projectActualId!, file.id, !!checked)}
                                className="mr-2 shrink-0"
                              />
                              {getFileIcon(file.fileType)}
                              <Label htmlFor={`${projectGroup.projectActualId}-${file.id}`} className="truncate cursor-pointer" title={file.name}>
                                {file.name}
                              </Label>
                            </div>
                            <Button variant="ghost" size="icon" className="w-6 h-6 shrink-0 opacity-50 group-hover:opacity-100" onClick={() => setIndividualFilePreview({name: file.name, content: file.content, fileType: file.fileType})}>
                               <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </ScrollArea>
            <div className="pt-2 text-center border-t mt-2">
                <Button variant="outline" size="sm" onClick={() => setIsManualAddModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('addManually', currentLanguage)}
                </Button>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center mb-2 p-1">
              <Label className="font-semibold">{t('unifiedPreview', currentLanguage)}</Label>
              {showPreview && unifiedPreview.length > 0 && (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1.5 text-xs text-muted-foreground flex items-center cursor-default">
                        {t('approxTokens', currentLanguage, { tokenCount: estimatedTokens })}
                        <Info className="w-3 h-3 ml-1" />)
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs p-2">
                      <p className="text-xs">
                        {t('tokenEstimationTooltip', currentLanguage)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {showPreview ? (
              <Textarea
                value={unifiedPreview}
                readOnly
                className="flex-grow font-mono text-xs resize-none h-full bg-muted/50"
                placeholder={t('previewDeactivatedPlaceholder', currentLanguage)} 
              />
            ) : (
              <div className="flex-grow flex items-center justify-center border rounded-md bg-muted/50">
                <p className="text-muted-foreground text-sm">{t('previewDeactivated', currentLanguage)}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 border-t mt-auto">
          <Button variant="outline" onClick={onClose}>{t('cancel', currentLanguage)}</Button>
          {showPreview && <Button variant="secondary" onClick={handleCopyToClipboard}><Copy className="mr-2 h-4 w-4" /> {t('copyAll', currentLanguage)}</Button>}
          <Button onClick={handleConfirmAndSave}><Download className="mr-2 h-4 w-4" /> {t('acceptAndSave', currentLanguage)}</Button>
        </DialogFooter>
      </DialogContent>

      {individualFilePreview && (
         <Dialog open={!!individualFilePreview} onOpenChange={() => setIndividualFilePreview(null)}>
            <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
                 <DialogHeader>
                    <DialogTitle className="flex items-center">
                      {getFileIcon(individualFilePreview.fileType)}
                      {t('previewFileTitle', currentLanguage, { fileName: individualFilePreview.name })}
                    </DialogTitle>
                 </DialogHeader>
                 <ScrollArea className="flex-grow border rounded-md my-4">
                    <pre className="text-xs p-4 font-mono whitespace-pre-wrap break-all">{individualFilePreview.content}</pre>
                 </ScrollArea>
                 <DialogFooter>
                     <Button variant="secondary" onClick={() => {
                         navigator.clipboard.writeText(individualFilePreview.content)
                           .then(() => toast({ title: t('copied', currentLanguage), description: t('fileContentCopied', currentLanguage, { fileName: individualFilePreview.name }) }))
                           .catch(() => toast({ title: t('error', currentLanguage), description: t('couldNotCopyToClipboard', currentLanguage), variant: "destructive" }));
                     }}><Copy className="mr-2 h-4 w-4" /> {t('copy', currentLanguage)}</Button>
                    <DialogClose asChild>
                        <Button>{t('close', currentLanguage)}</Button>
                    </DialogClose>
                 </DialogFooter>
            </DialogContent>
         </Dialog>
      )}
      {isManualAddModalOpen && (
        <ManualAddContentModal
          isOpen={isManualAddModalOpen}
          onClose={() => setIsManualAddModalOpen(false)}
          onAddContent={handleModalManualContentSubmit}
          existingProjects={projectsForListDisplay}
          currentProjectNameInSingleView={!isMultiProjectMode && currentDisplayProjects[currentProjectIndex] ? currentDisplayProjects[currentProjectIndex].name : undefined}
          isMultiProjectMode={isMultiProjectMode}
          currentLanguage={currentLanguage}
        />
      )}
    </Dialog>
  );
}


      