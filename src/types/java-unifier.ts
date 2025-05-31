
export interface ProcessedFile {
  id: string; // Unique ID for the file
  path: string; // relative path within project e.g., com/example/MyClass.java or config.xml
  name: string; // MyClass.java or config.xml
  content: string;
  packageName: string; // For Java: com.example; for others: (Other Project Files) or similar
  fileType: string; // e.g., 'java', 'xml', 'txt', 'classpath', 'project', 'dat'
  projectName?: string; // Name of the original project, for multi-project unification
  selected: boolean; // For the selection modal
}

export interface ProjectFile {
  id: string; // A unique ID, could be the original dropped item's name + timestamp
  name: string; // Original file/folder name (e.g., MyProject, project.zip)
  type: 'folder' | 'file'; // Type of the root item (folder or a single .java file)
  files: ProcessedFile[]; // List of found/processed files
  timestamp: number; // Timestamp of processing
}

export interface RecentEntry {
  id: string; // Usually same as ProjectFile id
  name: string; // Name of the project/file, can be descriptive for unifications
  timestamp: number; // Timestamp of last access
  type: 'folder' | 'file'; // Simplified type, refers to the root dropped item or 'unification'
}

export interface PackageGroup {
  packageName: string;
  files: ProcessedFile[];
}

export interface ProjectGroup {
  projectName: string;
  projectActualId: string; // Added to uniquely identify project for checkbox changes
  packages: PackageGroup[];
}

export type UnifiedData = ProjectGroup[];
