import { useRef, useState } from "react";

function FileDropZone({ selectedFile, onFileSelect }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const validateAndSelectFile = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Seleziona un file CSV.");
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    validateAndSelectFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    validateAndSelectFile(file);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";

    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div
      className={`file-drop-zone ${dragActive ? "drag-active" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={handleInputChange}
      />

      <div className="drop-icon">↑</div>

      {selectedFile ? (
        <>
          <strong>{selectedFile.name}</strong>
          <span className="file-meta">
            {formatFileSize(selectedFile.size)}
          </span>
          <span className="drop-hint">
            Clicca o trascina un altro file per sostituirlo
          </span>
        </>
      ) : (
        <>
          <strong>Trascina qui il dataset CSV</strong>
          <span className="drop-hint">
            oppure clicca per selezionare il file
          </span>
        </>
      )}
    </div>
  );
}

export default FileDropZone;