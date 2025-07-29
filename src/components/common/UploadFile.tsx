import React, { useState, useEffect, JSX } from "react";
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
}) => {
  const [mandatoryDocs, setMandatoryDocs] = useState<DocumentRow[]>([
    {
      id: "mandatory_1",
      name: "Letter de transport, note de fret, note d'assurance",
      isUploaded: false,
      isMandatory: true,
      isNameEditable: false,
    },
    {
      id: "mandatory_2",
      name: "De`claration pour I'importation Conditionnelle <<IC>>",
      isUploaded: false,
      isMandatory: true,
      isNameEditable: false,
    },
    {
      id: "mandatory_3",
      name: "Facture e`mise par le fournisseur",
      isUploaded: false,
      isMandatory: true,
      isNameEditable: false,
    },
  ]);

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

  useEffect(() => {
    if (files && files.length > 0) {
      // Handle existing files - for now just notify parent
      onFilesSelect?.(files);
    }
  }, [files]);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File ${file.name} exceeds maximum size of ${maxSize}MB`);
      return false;
    }
    const fileExtension =
      "." + (file.name.split(".").pop()?.toLowerCase() || "");
    if (!acceptedFormats.includes(fileExtension)) {
      setError(
        `File ${file.name} is not a supported format. Supported formats: PDF, DOC, TXT and PNG`
      );
      return false;
    }
    return true;
  };

  const handleFileUpload = async (file: File, rowId: string) => {
    if (!validateFile(file)) return;

    setUploadingFiles((prev) => new Set(prev).add(rowId));
    setUploadProgress((prev) => ({ ...prev, [rowId]: 0 }));

    try {
      let uploaded: { id: string; url: string };
      if (onUploadFile) {
        uploaded = await onUploadFile(file, (percent) => {
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
        original_name: file.name,
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

      setMandatoryDocs((prev) => prev.map(updateRow));
      setAdditionalDocs((prev) => prev.map(updateRow));

      // Notify parent component
      const allUploaded = [...mandatoryDocs, ...additionalDocs]
        .filter((row) => row.isUploaded || row.id === rowId)
        .map((row) => (row.id === rowId ? uploadedFile : row.uploadedFile!))
        .filter((file): file is UploadedFile => Boolean(file));

      onFilesSelect?.(allUploaded);
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

  const removeRow = async (rowId: string) => {
    const mandatoryRow = mandatoryDocs.find((r) => r.id === rowId);
    const additionalRow = additionalDocs.find((r) => r.id === rowId);
    const row = mandatoryRow || additionalRow;

    if (!row) return;

    // Cannot delete mandatory documents
    if (row.isMandatory) {
      setError("Mandatory documents cannot be deleted");
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
      setError("Please enter a valid file name");
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
              placeholder="Enter name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
          ) : (
            <span className="text-gray-900 font-medium">{row.name}</span>
          )}
        </td>

        {/* File Upload */}
        <td className="py-4 px-4">
          {row.isUploaded && !row.isMandatory ? (
            <div className="flex flex-col space-y-2">
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
                <span className="truncate text-xs">
                  {row.uploadedFile?.original_name ||
                    row.uploadedFile?.file?.name ||
                    "Uploaded File"}
                </span>
              </div>
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
                  className="flex items-center justify-center space-x-2 px-3 py-1 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors text-blue-600 font-medium text-xs min-w-[100px] h-[30px]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-blue-600"
                  >
                    <path
                      d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 8L12 3L7 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Replace</span>
                </label>
              </div>
            </div>
          ) : row.isUploaded && row.isMandatory ? (
            <div className="flex flex-col space-y-2">
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
                <span className="truncate text-xs">
                  {row.uploadedFile?.original_name ||
                    row.uploadedFile?.file?.name ||
                    "Uploaded File"}
                </span>
              </div>
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
                  className="flex items-center justify-center space-x-2 px-3 py-1 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors text-blue-600 font-medium text-xs min-w-[100px] h-[30px]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-blue-600"
                  >
                    <path
                      d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 8L12 3L7 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Replace</span>
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
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors text-blue-600 font-medium text-sm min-w-[100px] h-[38px]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-blue-600"
                >
                  <path
                    d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 8L12 3L7 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 3V15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Upload</span>
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
                  disabled={renamingFiles.has(row.id)}
                  className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                  title="Rename file"
                >
                  {renamingFiles.has(row.id) ? "Renaming..." : "Rename"}
                </button>
              )}

            {/* Delete button */}
            <button
              onClick={() => removeRow(row.id)}
              disabled={removingFile || row.isMandatory}
              className={`p-2 rounded-md transition-colors ${
                row.isMandatory
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
              }`}
              title={
                row.isMandatory ? "Cannot delete mandatory document" : "Delete"
              }
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

  // Determine which sections to show based on context
  const showMandatoryDocs = context === "create-request";
  const showAdditionalDocs =
    context === "create-request" ||
    context === "create-project" ||
    context === "create-contract"; // Show additional docs for create-request, create-project, and create-contract

  // Calculate starting index for additional docs serial numbers
  const additionalDocsStartIndex = showMandatoryDocs ? mandatoryDocs.length : 0;

  return (
    <div className="w-full bg-white">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Document Upload
        </h2>
      </div>

      {/* Mandatory Documents Section - Only show for create-request */}
      {showMandatoryDocs && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Mandatory Documents
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 w-16">
                      Sr No
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      File Upload
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 w-20">
                      Action
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
          </div>
        </div>
      )}

      {/* Additional Documents Section - Always show */}
      {showAdditionalDocs && (
        <div className={showMandatoryDocs ? "" : "mt-0"}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {showMandatoryDocs ? "Additional Documents" : "Documents"}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 w-16">
                      Sr No
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      File Upload
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 w-20">
                      Action
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
                <span className="font-medium">Add More</span>
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
