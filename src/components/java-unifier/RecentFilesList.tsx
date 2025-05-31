// components/java-unifier/RecentFilesList.tsx
"use client"

import { RecentEntry } from "@/types/java-unifier";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, File as FileIconLucide, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { t, type Language } from '@/lib/translations';

interface RecentFilesListProps {
  recents: RecentEntry[];
  onSelectRecent: (recent: RecentEntry) => void;
  onRemoveRecent: (id: string) => void;
  currentLanguage: Language;
}

export function RecentFilesList({ recents, onSelectRecent, onRemoveRecent, currentLanguage }: RecentFilesListProps) {
  if (recents.length === 0) {
    return null;
  }

  const getIcon = (type: RecentEntry['type']) => {
    switch (type) {
      case 'folder': return <Folder className="w-4 h-4 mr-2 text-accent shrink-0" />;
      case 'file': return <FileIconLucide className="w-4 h-4 mr-2 text-accent shrink-0" />;
      default:
        const exhaustiveCheck: never = type; 
        return <FileIconLucide className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">{t('processedHistory', currentLanguage)}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[150px]">
          <ul className="space-y-2">
            {recents.map((recent) => (
              <li key={recent.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary group">
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm text-left flex-grow text-foreground hover:text-primary truncate flex items-center"
                  onClick={() => onSelectRecent(recent)}
                  title={t('viewInfoAbout', currentLanguage, {
                    fileName: recent.name,
                    type: recent.type,
                    timestamp: new Date(recent.timestamp).toLocaleString(currentLanguage)
                  })}
                >
                  {getIcon(recent.type)}
                  <span className="truncate">{recent.name}</span>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 w-7 h-7 shrink-0" title={t('deleteFromRecents', currentLanguage)}>
                        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('confirmDeletion', currentLanguage)}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('confirmDeletionDescription', currentLanguage, { fileName: recent.name })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel', currentLanguage)}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onRemoveRecent(recent.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        {t('delete', currentLanguage)}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
