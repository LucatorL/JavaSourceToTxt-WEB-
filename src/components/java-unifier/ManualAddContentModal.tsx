// components/java-unifier/ManualAddContentModal.tsx
"use client"

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { ProjectFile } from '@/types/java-unifier';
import { t, type Language } from '@/lib/translations';

interface ManualAddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContent: (fileName: string, content: string, targetProjectId: string | 'new_project') => void;
  existingProjects: ProjectFile[]; 
  currentProjectNameInSingleView?: string; 
  isMultiProjectMode: boolean;
  currentLanguage: Language;
}

const NEW_PROJECT_ID_VALUE = 'new_project';

export function ManualAddContentModal({ 
  isOpen, 
  onClose, 
  onAddContent, 
  existingProjects,
  currentProjectNameInSingleView,
  isMultiProjectMode,
  currentLanguage,
}: ManualAddContentModalProps) {
  const [fileName, setFileName] = useState("");
  const [content, setContent] = useState("");
  const [targetProjectId, setTargetProjectId] = useState<string | 'new_project'>(NEW_PROJECT_ID_VALUE);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        if (!isMultiProjectMode && existingProjects.length === 1 && existingProjects[0]) {
             setTargetProjectId(existingProjects[0].id);
        } else {
             setTargetProjectId(NEW_PROJECT_ID_VALUE);
        }
    }
  }, [isOpen, existingProjects, isMultiProjectMode]);


  const handleAdd = () => {
    if (!fileName.trim()) {
      toast({ title: t('error', currentLanguage), description: t('fileNameEmptyError', currentLanguage), variant: "destructive" });
      return;
    }
    if (!content.trim()) {
      toast({ title: t('error', currentLanguage), description: t('contentEmptyError', currentLanguage), variant: "destructive" });
      return;
    }
    if (!fileName.includes('.')) {
        toast({ title: t('noExtensionWarning', currentLanguage), description: t('noExtensionWarning', currentLanguage), variant: "default" }); // Title same as description here
    }

    onAddContent(fileName, content, targetProjectId);
    setFileName(""); 
    setContent("");
  };

  const handleClose = () => {
    setFileName("");
    setContent("");
    setTargetProjectId(NEW_PROJECT_ID_VALUE);
    onClose();
  }

  const getSelectOptions = () => {
    if (!isMultiProjectMode && currentProjectNameInSingleView && existingProjects.length > 0 && existingProjects[0]) {
      return (
        <>
          <SelectItem value={existingProjects[0].id}>
            {t('addToProject', currentLanguage, { projectName: currentProjectNameInSingleView })}
          </SelectItem>
          <SelectItem value={NEW_PROJECT_ID_VALUE}>{t('createNewProject', currentLanguage)}</SelectItem>
        </>
      );
    } else if (isMultiProjectMode && existingProjects.length > 0) {
      return (
        <>
          <SelectItem value={NEW_PROJECT_ID_VALUE}>{t('createNewProject', currentLanguage)}</SelectItem>
          {existingProjects.map(proj => (
            <SelectItem key={proj.id} value={proj.id}>
              {t('addToProject', currentLanguage, { projectName: proj.name })}
            </SelectItem>
          ))}
        </>
      );
    }
    return <SelectItem value={NEW_PROJECT_ID_VALUE}>{t('createNewProject', currentLanguage)}</SelectItem>;
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('addManualContentTitle', currentLanguage)}</DialogTitle>
          <DialogDescription>
            {t('addManualContentDescription', currentLanguage)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="manual-filename" className="text-right">
              {t('fileNameLabel', currentLanguage)}
            </Label>
            <Input
              id="manual-filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={t('fileNamePlaceholder', currentLanguage)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="manual-content" className="text-right pt-2">
              {t('contentLabel', currentLanguage)}
            </Label>
            <Textarea
              id="manual-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('contentPlaceholder', currentLanguage)}
              className="col-span-3 min-h-[200px] font-mono text-xs"
            />
          </div>
          {(isMultiProjectMode || (existingProjects.length > 0 && currentProjectNameInSingleView)) && (
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="manual-target-project" className="text-right">
                    {t('destinationLabel', currentLanguage)}
                </Label>
                <Select 
                    value={targetProjectId} 
                    onValueChange={(value) => setTargetProjectId(value as string | 'new_project')}
                >
                    <SelectTrigger className="col-span-3" id="manual-target-project">
                        <SelectValue placeholder={t('selectDestinationPlaceholder', currentLanguage)} />
                    </SelectTrigger>
                    <SelectContent>
                        {getSelectOptions()}
                    </SelectContent>
                </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>{t('cancel', currentLanguage)}</Button>
          <Button onClick={handleAdd}>{t('addFile', currentLanguage)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
