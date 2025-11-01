import React, {
  useState,
  useEffect,
  JSX,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { UploadIcon } from "../../icons";
export interface UploadedFile {
  file: File | undefined;
  id: string;
  url: string;
  original_name?: string;
  size?: number;
}
export interface DocumentRow {
  id: string;
  name: string;
  file?: File;
  uploadedFile?: UploadedFile;
  isUploaded: boolean;
  isMandatory?: boolean;
  isNameEditable?: boolean;
}
interface FileUploadProps {
  onFilesSelect?: (files: UploadedFile[]) => void;
  onUploadFile?: (
    file: File,
    onProgress: (percent: number) => void
  ) => Promise<{ id: string; url: string }>;
  onDeleteFile?: (fileId: string) => Promise<{ status: boolean }>;
  onRenameFile?: (
    fileId: string,
    newName: string
  ) => Promise<{ status: boolean; newName?: string }>; // API call for renaming files
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  maxFiles?: number;
  files?: UploadedFile[];
  context?: "create-project" | "create-contract" | "create-request"; // Controls which sections to show
  showAdditionalDocs?: boolean; // Controls visibility of additional documents section
  taxCategory?: string; // Tax category to determine which mandatory documents to show
}

const UploadFile: React.FC<FileUploadProps> = ({
  onFilesSelect,
  onUploadFile,
  maxSize = 10, // Default max size 10MB
  acceptedFormats = [".pdf", ".doc", ".docx", ".txt", ".png"],
  files,
  onDeleteFile,
  onRenameFile,
  context = "create-request", // Default to showing both sections
  showAdditionalDocs = true, // Default to showing additional documents
  taxCategory = "importation", // Default to importation (shows all 3 documents)
}) => {
  const { t } = useTranslation();
  // Function to get mandatory documents based on tax category
  const getMandatoryDocsByTaxCategory = (category: string): DocumentRow[] => {
    if (category === "location_acquisition") {
      // For Location Acquisition: only show "Facture émise par le fournisseur"
      return [
        {
          id: "mandatory_3",
          name: "Facture émise par le fournisseur",
          isUploaded: false,
          isMandatory: true,
          isNameEditable: false,
        },
      ];
    } else {
      // For Importation: show all 3 documents
      return [
        {
          id: "mandatory_1",
          name: "Letter de transport, note de fret, note d'assurance",
          isUploaded: false,
          isMandatory: true,
          isNameEditable: false,
        },
        {
          id: "mandatory_2",
          name: "Déclaration pour I'importation Conditionnelle <<IC>>",
          isUploaded: false,
          isMandatory: true,
          isNameEditable: false,
        },
        {
          id: "mandatory_3",
          name: "Facture émise par le fournisseur",
          isUploaded: false,
          isMandatory: true,
          isNameEditable: false,
        },
      ];
    }
  };

  const [mandatoryDocs, setMandatoryDocs] = useState<DocumentRow[]>(() =>
    getMandatoryDocsByTaxCategory(taxCategory)
  );

  const [additionalDocs, setAdditionalDocs] = useState<DocumentRow[]>([
    {
      id: "additional_1",
      name: "",
      isUploaded: false,
      isMandatory: false,
      isNameEditable: true,
    },
  ]);
  const [error, setError] = useState<string>("");
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [removingFile, setRemovingFile] = useState<boolean>(false);
  const [renamingFiles, setRenamingFiles] = useState<Set<string>>(new Set());

  const filesDep = useMemo(() => files?.map((f) => f.id).join(","), [files]);

  const isInitialMount = useRef(true);
  const lastNotifiedFiles = useRef<string>("");

  // Helper function to process files for display in both mandatory and additional docs
  const processFilesForDisplay = useCallback(
    (currentFiles: UploadedFile[]) => {
      if (!currentFiles || currentFiles.length === 0) {
        // Just update mandatory docs structure without touching files
        const newMandatoryDocs = getMandatoryDocsByTaxCategory(taxCategory);
        setMandatoryDocs(newMandatoryDocs);

        setAdditionalDocs([
          {
            id: `additional_${Date.now()}`,
            name: "",
            isUploaded: false,
            isMandatory: false,
            isNameEditable: true,
          },
        ]);
        return;
      }

      const newMandatoryDocs = getMandatoryDocsByTaxCategory(taxCategory);
      const newAdditionalDocs: DocumentRow[] = [];
      const mandatoryDocNames = newMandatoryDocs.map((doc) => doc.name);

      // Process each file and categorize it
      currentFiles.forEach((file) => {
        const mandatoryIndex = mandatoryDocNames.indexOf(
          file.original_name || ""
        );
        if (mandatoryIndex !== -1) {
          // Update the corresponding mandatory document
          newMandatoryDocs[mandatoryIndex] = {
            ...newMandatoryDocs[mandatoryIndex],
            isUploaded: true,
            uploadedFile: file,
          };
        } else {
          // Add to additional documents
          newAdditionalDocs.push({
            id: file.id,
            name: file.original_name || "",
            file: undefined,
            uploadedFile: file,
            isUploaded: true,
            isMandatory: false,
            isNameEditable: true,
          });
        }
      });

      // Ensure at least one empty additional doc row exists
      if (newAdditionalDocs.length === 0) {
        newAdditionalDocs.push({
          id: `additional_${Date.now()}`,
          name: "",
          isUploaded: false,
          isMandatory: false,
          isNameEditable: true,
        });
      }

      setMandatoryDocs(newMandatoryDocs);
      setAdditionalDocs(newAdditionalDocs);
    },
    [taxCategory]
  );

  // Effect to update mandatory documents when tax category changes
  useEffect(() => {
    // Re-process current files with new tax category
    processFilesForDisplay(files || []);
  }, [taxCategory, processFilesForDisplay]);

  // Listen for form reset events
  useEffect(() => {
    const resetFilesListener = () => {
      // Reset all document states based on current tax category
      setMandatoryDocs(getMandatoryDocsByTaxCategory(taxCategory));

      setAdditionalDocs([
        {
          id: "additional_1",
          name: "",
          isUploaded: false,
          isMandatory: false,
          isNameEditable: true,
        },
      ]);

      // Reset other states
      setError("");
      setUploadingFiles(new Set());
      setUploadProgress({});
      setRemovingFile(false);
      setRenamingFiles(new Set());

      // Reset refs
      isInitialMount.current = true;
      lastNotifiedFiles.current = "";

      // Notify parent with empty files array
      onFilesSelect?.([]);
    };

    window.addEventListener("form-reset", resetFilesListener);

    return () => {
      window.removeEventListener("form-reset", resetFilesListener);
    };
  }, [onFilesSelect, taxCategory]);

  // useEffect(() => {
  //   if (files && files.length > 0) {
  //     // Handle existing files - for now just notify parent
  //     onFilesSelect?.(files);
  //   }
  // }, [files]);

  // Process files when the files prop changes
  useEffect(() => {
    console.log("Files changed, processing for display:", files);
    processFilesForDisplay(files || []);
  }, [filesDep, processFilesForDisplay]);

  useEffect(() => {
    const allUploadedFiles = [
      ...mandatoryDocs.filter((d) => d.isUploaded).map((d) => d.uploadedFile!),
      ...additionalDocs.filter((d) => d.isUploaded).map((d) => d.uploadedFile!),
    ].filter(Boolean);

    // Create a stable string representation of the files to compare
    const currentFilesSignature = allUploadedFiles
      .map((f) => `${f.id}-${f.original_name}`)
      .sort()
      .join("|");

    // Only call onFilesSelect if this is not the initial mount and files have actually changed
    if (
      !isInitialMount.current &&
      currentFilesSignature !== lastNotifiedFiles.current
    ) {
      lastNotifiedFiles.current = currentFilesSignature;
      onFilesSelect?.(allUploadedFiles);
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastNotifiedFiles.current = currentFilesSignature;
    }
  }, [mandatoryDocs, additionalDocs, onFilesSelect]);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File ${file.name} exceeds maximum size of ${maxSize}MB`);
      return false;
    }
    const fileExtension =
      "." + (file.name.split(".").pop()?.toLowerCase() || "");
    if (!acceptedFormats.includes(fileExtension)) {
      const formats = acceptedFormats
        .map((ext) => ext.replace(".", "").toUpperCase())
        .join(", ");
      setError(`File ${file.name} is not a supported format. Supported formats: ${formats}`);
      return false;
    }
    return true;
  };

  const handleFileUpload = async (file: File, rowId: string) => {
    if (!validateFile(file)) return;

    setUploadingFiles((prev) => new Set(prev).add(rowId));
    setUploadProgress((prev) => ({ ...prev, [rowId]: 0 }));

    const isMandatoryRow = mandatoryDocs.some((doc) => doc.id === rowId);

    try {
      let fileToUpload = file;
      const mandatoryRowData = mandatoryDocs.find((doc) => doc.id === rowId);
      if (mandatoryRowData) {
        fileToUpload = new File([file], mandatoryRowData.name, {
          type: file.type,
        });
      }

      let uploaded: { id: string; url: string };
      if (onUploadFile) {
        uploaded = await onUploadFile(fileToUpload, (percent) => {
          setUploadProgress((prev) => ({ ...prev, [rowId]: percent }));
        });
      } else {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress((prev) => ({ ...prev, [rowId]: i }));
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        uploaded = {
          id: `${Date.now()}_${file.name}`,
          url: URL.createObjectURL(file),
        };
      }

      const uploadedFile: UploadedFile = {
        file,
        id: uploaded.id,
        url: uploaded.url,
        original_name: fileToUpload.name,
        size: file.size,
      };

      // Update the appropriate document row
      const updateRow = (row: DocumentRow): DocumentRow => {
        if (row.id === rowId) {
          return {
            ...row,
            name: row.isNameEditable ? row.name.trim() || file.name : row.name,
            uploadedFile,
            isUploaded: true,
          };
        }
        return row;
      };

      if (isMandatoryRow) {
        setMandatoryDocs((prev) => prev.map(updateRow));
      } else {
        setAdditionalDocs((prev) => prev.map(updateRow));
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to upload ${file.name}`);
    } finally {
      setUploadingFiles((prev) => {
        const updated = new Set(prev);
        updated.delete(rowId);
        return updated;
      });
    }
  };

  const handleNameChange = (rowId: string, newName: string) => {
    setAdditionalDocs((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, name: newName } : row))
    );
    setMandatoryDocs((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, name: newName } : row))
    );
  };

  const addMoreRow = () => {
    const newRow: DocumentRow = {
      id: `additional_${Date.now()}`,
      name: "",
      isUploaded: false,
      isMandatory: false,
      isNameEditable: true,
    };
    setAdditionalDocs((prev) => [...prev, newRow]);
  };

  const addMoreMandatoryRow = () => {
    const newRow: DocumentRow = {
      id: `mandatory_${Date.now()}`,
      name: "",
      isUploaded: false,
      isMandatory: true,
      isNameEditable: true,
    };
    setMandatoryDocs((prev) => [...prev, newRow]);
  };

  const removeRow = async (rowId: string) => {
    const mandatoryRow = mandatoryDocs.find((r) => r.id === rowId);
    const additionalRow = additionalDocs.find((r) => r.id === rowId);
    const row = mandatoryRow || additionalRow;

    if (!row) return;

    // Allow deletion of mandatory documents for replacement - just reset the row instead of preventing deletion
    if (row.isMandatory && row.isUploaded) {
      // For custom added mandatory rows (editable name), allow full deletion
      if (row.isNameEditable && row.uploadedFile && onDeleteFile) {
        setRemovingFile(true);
        try {
          const response = await onDeleteFile(row.uploadedFile.id);
          if (response?.status) {
            // Remove the row entirely for custom mandatory docs
            setMandatoryDocs((prev) => prev.filter((r) => r.id !== rowId));

            // Update parent component
            const remainingFiles = [...mandatoryDocs, ...additionalDocs]
              .filter((r) => r.id !== rowId && r.isUploaded && r.uploadedFile)
              .map((r) => r.uploadedFile!)
              .filter((file): file is UploadedFile => Boolean(file));

            onFilesSelect?.(remainingFiles);
            setError("");
          }
        } catch (error) {
          console.error("Error removing file:", error);
          setError("Failed to remove file. Please try again.");
        } finally {
          setRemovingFile(false);
        }
      } else if (row.isNameEditable && !row.uploadedFile) {
        // Just remove the row if no file uploaded and it's a custom mandatory doc
        setMandatoryDocs((prev) => prev.filter((r) => r.id !== rowId));
      } else if (row.uploadedFile && onDeleteFile) {
        // For preset mandatory documents (non-editable name), reset instead of delete
        setRemovingFile(true);
        try {
          const response = await onDeleteFile(row.uploadedFile.id);
          if (response?.status) {
            // Reset the mandatory row to allow new upload
            setMandatoryDocs((prev) => prev.map((r) => 
              r.id === rowId ? { ...r, isUploaded: false, uploadedFile: undefined } : r
            ));

            // Update parent component
            const remainingFiles = [...mandatoryDocs, ...additionalDocs]
              .filter((r) => r.id !== rowId && r.isUploaded && r.uploadedFile)
              .map((r) => r.uploadedFile!)
              .filter((file): file is UploadedFile => Boolean(file));

            onFilesSelect?.(remainingFiles);
            setError("");
          }
        } catch (error) {
          console.error("Error removing file:", error);
          setError("Failed to remove file. Please try again.");
        } finally {
          setRemovingFile(false);
        }
      } else {
        // Just reset the row if no file uploaded
        setMandatoryDocs((prev) => prev.map((r) => 
          r.id === rowId ? { ...r, isUploaded: false, uploadedFile: undefined } : r
        ));
      }
      return;
    }

    if (row.isUploaded && row.uploadedFile && onDeleteFile) {
      setRemovingFile(true);
      try {
        const response = await onDeleteFile(row.uploadedFile.id);
        if (response?.status) {
          setAdditionalDocs((prev) => prev.filter((r) => r.id !== rowId));

          // Update parent component
          const remainingFiles = [...mandatoryDocs, ...additionalDocs]
            .filter((r) => r.id !== rowId && r.isUploaded && r.uploadedFile)
            .map((r) => r.uploadedFile!)
            .filter((file): file is UploadedFile => Boolean(file));

          onFilesSelect?.(remainingFiles);
          setError("");
        }
      } catch (error) {
        console.error("Error removing file:", error);
        setError("Failed to remove file. Please try again.");
      } finally {
        setRemovingFile(false);
      }
    } else {
      // Just remove the row if no file uploaded (only for additional docs)
      setAdditionalDocs((prev) => prev.filter((r) => r.id !== rowId));
    }
  };

  const handleRenameFile = async (rowId: string) => {
    const row =
      mandatoryDocs.find((r) => r.id === rowId) ||
      additionalDocs.find((r) => r.id === rowId);
    if (!row || !row.isUploaded || !row.uploadedFile) {
      setError("File not found or not uploaded");
      return;
    }

    const newName = row.name.trim();
    if (!newName) {
      setError(t("enter_file_name"));
      return;
    }
    console.log(row, "row");

    setRenamingFiles((prev) => new Set(prev).add(rowId));

    try {
      if (onRenameFile) {
        // Call the API to rename the file
        const response = await onRenameFile(row.uploadedFile.id, newName);

        if (response?.status) {
          // Update the local state with the new name
          const updateRow = (row: DocumentRow) => {
            if (row.id === rowId && row.uploadedFile) {
              return {
                ...row,
                uploadedFile: {
                  ...row.uploadedFile,
                  original_name: response.newName || newName,
                },
              };
            }
            return row;
          };

          setMandatoryDocs((prev) => prev.map(updateRow));
          setAdditionalDocs((prev) => prev.map(updateRow));

          // Notify parent component
          const allUploaded = [...mandatoryDocs, ...additionalDocs]
            .filter((row) => row.isUploaded && row.uploadedFile)
            .map((row) => {
              if (row.id === rowId && row.uploadedFile) {
                return {
                  ...row.uploadedFile,
                  original_name: response.newName || newName,
                };
              }
              return row.uploadedFile!;
            })
            .filter((file): file is UploadedFile => Boolean(file));

          onFilesSelect?.(allUploaded);
          setError("");
        } else {
          setError("Failed to rename file. Please try again.");
        }
      } else {
        // Just update locally if no API call is provided (for demo purposes)
        const updateRow = (row: DocumentRow): DocumentRow => {
          if (row.id === rowId && row.uploadedFile) {
            return {
              ...row,
              uploadedFile: {
                ...row.uploadedFile,
                original_name: newName,
              },
            };
          }
          return row;
        };

        setMandatoryDocs((prev) => prev.map(updateRow));
        setAdditionalDocs((prev) => prev.map(updateRow));
        setError("");
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      setError("Failed to rename file. Please try again.");
    } finally {
      setRenamingFiles((prev) => {
        const updated = new Set(prev);
        updated.delete(rowId);
        return updated;
      });
    }
  };

  const renderDocumentRow = (row: DocumentRow, index: number): JSX.Element => {
    const isUploading = uploadingFiles.has(row.id);
    const progress = uploadProgress[row.id] || 0;

    return (
      <tr key={row.id} className="border-b border-gray-100">
        {/* Sr No */}
        <td className="py-4 px-4">
          <span className="text-gray-700">{index + 1}</span>
        </td>

        {/* Name */}
        <td className="py-4 px-4">
          {row.isNameEditable ? (
            <input
              type="text"
              value={row.name}
              onChange={(e) => handleNameChange(row.id, e.target.value)}
              placeholder={t("enter_file_name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
          ) : (
            <span className="text-gray-900 font-medium">{row.name}</span>
          )}
        </td>

        {/* File Upload */}
        <td className="py-4 px-4">
          {row.isUploaded && !row.isMandatory ? (
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-sm min-w-[100px] h-[38px]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-500 flex-shrink-0"
              >
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 2V8H20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="truncate text-xs flex-1">
                {row.uploadedFile?.original_name ||
                  row.uploadedFile?.file?.name ||
                  "Uploaded File"}
              </span>
              {/* Edit Icon */}
              <div className="relative">
                <input
                  type="file"
                  accept={acceptedFormats.join(",")}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, row.id);
                    }
                  }}
                  className="hidden"
                  id={`file-replace-additional-${row.id}`}
                />
                <label
                  htmlFor={`file-replace-additional-${row.id}`}
                  className="flex items-center justify-center p-1 cursor-pointer hover:bg-gray-200 rounded transition-colors"
                  title={t("replace_file")}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <path
                      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H16C16.5304 20 17.0391 19.7893 17.4142 19.4142C17.7893 19.0391 18 18.5304 18 18V11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </label>
              </div>
            </div>
          ) : row.isUploaded && row.isMandatory ? (
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm min-w-[100px] h-[38px]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-green-500 flex-shrink-0"
              >
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 2V8H20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="truncate text-xs flex-1">
                {row.uploadedFile?.original_name ||
                  row.uploadedFile?.file?.name ||
                  "Uploaded File"}
              </span>
              {/* Edit Icon */}
              <div className="relative">
                <input
                  type="file"
                  accept={acceptedFormats.join(",")}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, row.id);
                    }
                  }}
                  className="hidden"
                  id={`file-replace-${row.id}`}
                />
                <label
                  htmlFor={`file-replace-${row.id}`}
                  className="flex items-center justify-center p-1 cursor-pointer hover:bg-green-100 rounded transition-colors"
                  title={t("replace_file")}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-green-600 hover:text-blue-600"
                  >
                    <path
                      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H16C16.5304 20 17.0391 19.7893 17.4142 19.4142C17.7893 19.0391 18 18.5304 18 18V11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </label>
              </div>
            </div>
          ) : isUploading ? (
            <div className="flex items-center space-x-2 min-w-[100px] h-[38px]">
              <div className="w-16 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600">{progress}%</span>
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept={acceptedFormats.join(",")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, row.id);
                  }
                }}
                className="hidden"
                id={`file-${row.id}`}
              />
              <label
                htmlFor={`file-${row.id}`}
                className="group flex items-center justify-center text-white text-xs font-medium px-2 py-1.5 rounded-md bg-primary-150 hover:bg-primary-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-150 focus:ring-offset-1 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95 w-8 h-8 shadow-sm"
                title="Upload file"
              >
                <UploadIcon
                  className="text-white group-hover:animate-pulse"
                  size={14}
                />
              </label>
            </div>
          )}
        </td>

        {/* Action */}
        <td className="py-4 px-4">
          <div className="flex items-center space-x-2">
            {row.isUploaded &&
              row.uploadedFile &&
              (row.isMandatory || row.isNameEditable) && (
                <button
                  onClick={() => handleRenameFile(row.id)}
                  type="button"
                  disabled={renamingFiles.has(row.id)}
                  className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                  title="Rename file"
                >
                  {renamingFiles.has(row.id) ? t("uploading") : t("rename")}
                </button>
              )}

            {/* Delete button */}
            <button
              onClick={() => removeRow(row.id)}
              disabled={removingFile}
              className="p-2 rounded-md transition-colors text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
              title={t("delete")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 6H5H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Determine which sections to show based on context and props
  const showMandatoryDocs = context === "create-request";
  // Show additional docs based on prop
  const shouldShowAdditionalDocs = Boolean(showAdditionalDocs);

  console.log("UploadFile render check:", {
    context,
    showAdditionalDocs,
    shouldShowAdditionalDocs,
    showMandatoryDocs,
  });

  // Calculate starting index for additional docs serial numbers
  const additionalDocsStartIndex = showMandatoryDocs ? mandatoryDocs.length : 0;

  return (
    <div className="w-full bg-white">
      {/* Upload restrictions note */}
      <div className="mb-3 p-3 bg-secondary-10 border border-secondary-30 rounded-md">
        <p className="text-sm text-secondary-80">{t("upload_restrictions_note")}</p>
      </div>

      {/* Mandatory Documents Section - Only show for create-request */}
      {showMandatoryDocs && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("mandatory_documents")}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 w-16">
                      {t("sr_no")}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      {t("name")}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      {t("file_upload")}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 w-20">
                      {t("action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {mandatoryDocs.map((row, index) =>
                    renderDocumentRow(row, index)
                  )}
                </tbody>
              </table>
            </div>

            {/* Add More Button for Mandatory Documents */}
            <div className="mt-4">
              <button
                onClick={addMoreMandatoryRow}
                type="button"
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-medium">{t("add_more")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Documents Section - Show conditionally */}
      {shouldShowAdditionalDocs && (
        <div className={showMandatoryDocs ? "" : "mt-0"}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {showMandatoryDocs ? t("additional_documents") : t("documents")}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 w-16">
                      {t("sr_no")}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      {t("name")}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      {t("file_upload")}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 w-20">
                      {t("action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {additionalDocs.map((row, index) =>
                    renderDocumentRow(row, index + additionalDocsStartIndex)
                  )}
                </tbody>
              </table>
            </div>

            {/* Add More Button */}
            <div className="mt-4">
              <button
                onClick={addMoreRow}
                type="button"
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-medium">{t("add_more")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
