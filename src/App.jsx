import {
  useCallback,
  useEffect,
  useState,
} from "react";


import "./App.css";

import FileDropZone from "./components/FileDropZone";
import ProgressBar from "./components/ProgressBar";
import StatusBadge from "./components/StatusBadge";

import { predictProduct } from "./api/inferenceApi";
import { uploadDataset } from "./api/uploadApi";
import { getPipelineStatus } from "./api/statusApi";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [productTitle, setProductTitle] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const [trainingMetrics, setTrainingMetrics] = useState(null);

  const [
    isMonitoringPipeline,
    setIsMonitoringPipeline,
  ] = useState(false);

  const [backendOnline, setBackendOnline] = useState(null);

  const [pipelineStages, setPipelineStages] = useState([
    {
      name: "Upload dataset",
      description: "Caricamento del CSV nel bucket raw-data",
      status: "idle",
    },
    {
      name: "Preprocessing",
      description: "Pulizia e trasformazione automatica del dataset",
      status: "idle",
    },
    {
      name: "Training",
      description: "TF-IDF + Logistic Regression",
      status: "idle",
    },
  ]);

  const handlePrediction = async () => {
    const title = productTitle.trim();

    if (!title) {
      return;
    }

    setIsPredicting(true);
    setPrediction(null);
    setPredictionError("");

    try {
      const result = await predictProduct(title);

      setPrediction(result);
    } catch (error) {
      setPredictionError(error.message);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadMessage("");
    setTrainingMetrics(null);

    setPipelineStages((stages) =>
      stages.map((stage, index) => ({
        ...stage,
        status: index === 0 ? "running" : "idle",
      }))
    );

    try {
      const result =
        await uploadDataset(selectedFile);

      setUploadMessage(result.message);

      const status =
        await refreshPipelineStatus();

      if (!status?.pipeline_complete) {
        setIsMonitoringPipeline(true);
      }
    } catch (error) {
      setUploadError(error.message);

      setPipelineStages((stages) =>
        stages.map((stage, index) =>
          index === 0
            ? {
                ...stage,
                status: "error",
              }
            : stage
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const applyPipelineStatus = useCallback((data) => {
    setPipelineStages([
      {
        name: "Upload dataset",
        description:
          "Caricamento del CSV nel bucket raw-data",
        status: data.stages.upload,
      },
      {
        name: "Preprocessing",
        description:
          "Pulizia e trasformazione automatica del dataset",
        status: data.stages.preprocessing,
      },
      {
        name: "Training",
        description:
          "TF-IDF + Logistic Regression",
        status: data.stages.training,
      },
    ]);

    setTrainingMetrics(data.metrics ?? null);
  }, []);

  const refreshPipelineStatus =
    useCallback(async () => {
      try {
        const status = await getPipelineStatus();

        setBackendOnline(true);

        applyPipelineStatus(status);

        return status;
      } catch (error) {
        console.error(
          "Errore monitoraggio pipeline:",
          error
        );

        setBackendOnline(false);

        return null;
      }
    }, [applyPipelineStatus]);

  useEffect(() => {
    refreshPipelineStatus();
  }, [refreshPipelineStatus]);

  useEffect(() => {
    if (!isMonitoringPipeline) {
      return;
    }

    const intervalId = setInterval(async () => {
      const status = await refreshPipelineStatus();

      if (status?.pipeline_complete) {
        setIsMonitoringPipeline(false);
      }
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [
    isMonitoringPipeline,
    refreshPipelineStatus,
  ]);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <span className="eyebrow">
            SISTEMI DISTRIBUITI E CLOUD COMPUTING
          </span>

          <h1>Serverless Product Classification Pipeliner</h1>

          <p>
            Dashboard per gestione e test della pipeline
            serverless di classificazione prodotti.
          </p>
        </div>

        <div className="header-status">
          <StatusBadge
            status={
              backendOnline === null
                ? "idle"
                : backendOnline
                  ? "success"
                  : "error"
            }
          />

          <span>
            {backendOnline === null
              ? "Checking infrastructure..."
              : backendOnline
                ? "Infrastructure online"
                : "Infrastructure offline"}
          </span>
        </div>
      </header>

      <main className="dashboard">
        <section className="card pipeline-card">
          <div className="card-header">
            <div>
              <span className="card-kicker">
                PIPELINE
              </span>

              <h2>Training del modello</h2>

              <p>
                Carica il dataset PriceRunner per avviare
                automaticamente preprocessing e training.
              </p>
            </div>

            <span className="card-number">01</span>
          </div>

          <FileDropZone
            selectedFile={selectedFile}
            onFileSelect={(file) => {
              setSelectedFile(file);
              setUploadMessage("");
              setUploadError("");
            }}
          />

          {selectedFile && !isMonitoringPipeline && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setSelectedFile(null);
                setUploadError("");
                setUploadMessage("");
              }}
            >
              Rimuovi file selezionato
            </button>
          )}

          <button
            className="primary-button"
            onClick={handleUpload}
            disabled={
              !selectedFile ||
              isUploading ||
              isMonitoringPipeline
            }
          >
            {isUploading
              ? "Caricamento in corso..."
              : isMonitoringPipeline
                ? "Pipeline in esecuzione..."
                : "Upload e avvia pipeline"}
          </button>
          
          {uploadMessage && (
            <div className="upload-success">
              {uploadMessage}
            </div>
          )}

          {uploadError && (
            <div className="prediction-error">
              <strong>Errore durante l'upload</strong>
              <p>{uploadError}</p>
            </div>
          )}

          <div className="separator" />

          <h3>Stato pipeline</h3>

          {isMonitoringPipeline && (
            <div className="pipeline-running-banner">
              <div className="spinner" />

              <div>
                <strong>Pipeline in esecuzione</strong>

                <p>
                  Preprocessing e training vengono eseguiti
                  automaticamente. Lo stato viene aggiornato
                  ogni 2 secondi.
                </p>
              </div>
            </div>
          )}

          <ProgressBar stages={pipelineStages} />

          {trainingMetrics &&
            !isMonitoringPipeline && (
              <div className="training-complete-banner">
                <span>✓</span>

                <div>
                  <strong>Modello disponibile</strong>

                  <p>
                    Il training è completato e il modello può
                    essere utilizzato per nuove predizioni.
                  </p>
                </div>
              </div>
            )}

          <div className="metrics-grid">
            <div className="metric">
              <span>Accuracy</span>

              <strong>
                {trainingMetrics?.accuracy != null
                  ? `${(
                      trainingMetrics.accuracy * 100
                    ).toFixed(2)}%`
                  : "—"}
              </strong>
            </div>

            <div className="metric">
              <span>Macro F1</span>

              <strong>
                {trainingMetrics?.macro_f1 != null
                  ? `${(
                      trainingMetrics.macro_f1 * 100
                    ).toFixed(2)}%`
                  : "—"}
              </strong>
            </div>

            <div className="metric">
              <span>Train rows</span>

              <strong>
                {trainingMetrics?.train_rows != null
                  ? trainingMetrics.train_rows.toLocaleString(
                      "it-IT"
                    )
                  : "—"}
              </strong>
            </div>

            <div className="metric">
              <span>Test rows</span>

              <strong>
                {trainingMetrics?.test_rows != null
                  ? trainingMetrics.test_rows.toLocaleString(
                      "it-IT"
                    )
                  : "—"}
              </strong>
            </div>

            <div className="metric">
              <span>Cluster overlap</span>

              <strong>
                {trainingMetrics?.cluster_overlap != null
                  ? trainingMetrics.cluster_overlap
                  : "—"}
              </strong>
            </div>
          </div>
        </section>

        <section className="right-column">
          <div className="card inference-card">
            <div className="card-header">
              <div>
                <span className="card-kicker">
                  INFERENCE
                </span>

                <h2>Classifica un prodotto</h2>

                <p>
                  Inserisci il titolo commerciale di un
                  prodotto e ottieni la categoria prevista.
                </p>
              </div>

              <span className="card-number">02</span>
            </div>

            <label htmlFor="product-title">
              Product title
            </label>

            <textarea
              id="product-title"
              value={productTitle}
              onChange={(event) =>
                setProductTitle(event.target.value)
              }
              placeholder="Es. apple iphone 13 128gb"
              rows="4"
            />

            <button
              className="primary-button"
              onClick={handlePrediction}
              disabled={!productTitle.trim() || isPredicting}
            >
              {isPredicting
                ? "Predizione in corso..."
                : "Avvia predizione"}
            </button>
          </div>

          {(prediction || predictionError) && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setProductTitle("");
                setPrediction(null);
                setPredictionError("");
              }}
            >
              Nuova predizione
            </button>
          )}

          <div className="card result-card">
            <div className="card-header">
              <div>
                <span className="card-kicker">
                  RISULTATO
                </span>

                <h2>Predizione</h2>
              </div>

              <span className="card-number">03</span>
            </div>

            {predictionError && (
              <div className="prediction-error">
                <strong>Errore durante la predizione</strong>
                <p>{predictionError}</p>
              </div>
            )}

            {!prediction &&
              !predictionError &&
              !isPredicting && (
                <div className="empty-result">
                  <div className="result-placeholder-icon">
                    ML
                  </div>

                  <strong>Nessuna predizione</strong>

                  <p>
                    Inserisci un titolo prodotto ed esegui
                    l'inference per visualizzare il risultato.
                  </p>
                </div>
              )}

            {isPredicting && (
              <div className="empty-result">
                <div className="result-placeholder-icon">
                  ...
                </div>

                <strong>Predizione in corso</strong>

                <p>
                  Il modello sta classificando il prodotto.
                </p>
              </div>
            )}

            {prediction && !isPredicting && (
              <div className="prediction-result">
                <span className="result-label">
                  Categoria prevista
                </span>

                <strong className="predicted-category">
                  {prediction.predicted_category}
                </strong>

                <div className="confidence-header">
                  <span>Confidence</span>

                  <strong>
                    {(prediction.confidence * 100).toFixed(2)}%
                  </strong>
                </div>

                <div className="confidence-bar">
                  <div
                    className="confidence-value"
                    style={{
                      width: `${prediction.confidence * 100}%`,
                    }}
                  />
                </div>

                {prediction.normalized_title && (
                  <div className="normalized-title">
                    <span>Titolo normalizzato</span>

                    <p>{prediction.normalized_title}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer>
        <span>Nuclio FaaS</span>
        <span>•</span>
        <span>MinIO</span>
        <span>•</span>
        <span>Docker</span>
        <span>•</span>
        <span>scikit-learn</span>
      </footer>
    </div>
  );
}

export default App;