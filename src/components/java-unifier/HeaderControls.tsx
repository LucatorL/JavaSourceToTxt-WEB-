// components/java-unifier/HeaderControls.tsx
"use client"

import { ThemeToggle } from "./ThemeToggle"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Language } from "@/lib/translations";
import { t } from "@/lib/translations";

interface HeaderControlsProps {
  previewEnabled: boolean;
  onPreviewToggle: (enabled: boolean) => void;
  multiProjectModeEnabled: boolean;
  onMultiProjectModeToggle: (enabled: boolean) => void;
  appVersion?: string;
  onVersionClick?: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export function HeaderControls({
  previewEnabled,
  onPreviewToggle,
  multiProjectModeEnabled,
  onMultiProjectModeToggle,
  appVersion,
  onVersionClick,
  currentLanguage,
  onLanguageChange,
}: HeaderControlsProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b gap-4">
      <div className="flex items-center space-x-4 flex-wrap">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="preview-enabled"
            checked={previewEnabled}
            onCheckedChange={(checked) => {
              if (typeof checked === 'boolean') onPreviewToggle(checked);
            }}
          />
          <Label htmlFor="preview-enabled" className="text-sm font-medium">
            {t('activatePreview', currentLanguage)}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="multi-project-mode"
            checked={multiProjectModeEnabled}
             onCheckedChange={(checked) => {
              if (typeof checked === 'boolean') onMultiProjectModeToggle(checked);
            }}
          />
          <Label htmlFor="multi-project-mode" className="text-sm font-medium">
            {t('unifyMultipleProjects', currentLanguage)}
          </Label>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Select value={currentLanguage} onValueChange={(value: Language) => onLanguageChange(value)}>
          <SelectTrigger className="w-[120px] h-9 text-sm">
            <SelectValue placeholder={t('selectLanguage', currentLanguage)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t('english', currentLanguage)}</SelectItem>
            <SelectItem value="es">{t('spanish', currentLanguage)}</SelectItem>
          </SelectContent>
        </Select>
        {appVersion && onVersionClick && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onVersionClick} 
            className="font-medium select-none"
            title={t('viewVersionNews', currentLanguage, { version: appVersion })}
          >
            {t('appVersion', currentLanguage, { version: appVersion })}
            <Info className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        )}
        {appVersion && !onVersionClick && (
           <span className="text-sm font-medium px-2.5 py-1.5 rounded-md border border-border bg-secondary text-secondary-foreground select-none">
            {t('appVersion', currentLanguage, { version: appVersion })}
          </span>
        )}
        <ThemeToggle />
      </div>
    </div>
  )
}
