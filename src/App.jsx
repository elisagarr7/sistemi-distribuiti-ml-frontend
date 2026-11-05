import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { predictProduct } from "./api/inferenceApi";
import { uploadDataset } from "./api/uploadApi";
import { getPipelineStatus } from "./api/statusApi";

function Icon({name, size=24}) {
 const s={width:size,height:size,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":true};
 const paths={
 layers:<><path d="m12 2-9 5 9 5 9-5-9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
 upload:<><path d="M5 3h9l5 5v13H5z"/><path d="M14 3v6h5M12 18V11m-3 3 3-3 3 3"/></>,
 cloud:<><path d="M7 18H5a4 4 0 0 1-.5-8A6 6 0 0 1 16 8a5 5 0 0 1 3 10h-2"/><path d="M12 21V11m-4 4 4-4 4 4"/></>,
 file:<><path d="M6 2h8l5 5v15H6zM14 2v6h5"/></>,
 trash:<><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/></>,
 settings:<><path d="M9.8 2h4.4l.7 2.5 2 1 2.4-1 3.1 3.2-1 2.3 1 2-.1 4.4-2.5.7-1 2 1 2.4-3.1 3.1-2.4-1-2 1-.7 2.4H9.8l-.7-2.4-2-1-2.4 1-3.1-3.1 1-2.4-1-2-.1-4.4 2.5-.7 1-2-1-2.3 3.1-3.2 2.4 1 2-1z" transform="translate(1 1) scale(.91)"/><circle cx="12" cy="12" r="3.5"/></>,
 training:<><path d="m3 18 7-7 4 4 7-8M15 7h6v6"/></>,
 metrics:<><path d="M3 20v-7h3v7M10 20V8h3v12M17 20V3h3v17"/></>,
 target:<><circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="5"/><circle cx="11" cy="13" r="2"/><path d="m11 13 9-9m-4 0h4v4"/></>,
 database:<><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/></>,
 network:<><circle cx="12" cy="4" r="3"/><circle cx="4" cy="19" r="3"/><circle cx="20" cy="19" r="3"/><path d="m10 7-5 9m9-9 5 9M7 19h10"/></>,
 cube:<><path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5m-9 5v10"/></>,
 sparkles:<><path d="m12 2 2.3 6.7L21 11l-6.7 2.3L12 20l-2.3-6.7L3 11l6.7-2.3zM20 17v5m-2.5-2.5h5"/></>,
 tag:<><path d="M3 4h10l8 8-9 9-9-9z"/><circle cx="8" cy="9" r="1"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/></>,
 chip:<><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 9h6v6H9zM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/></>,
 arrow:<><path d="m9 5 7 7-7 7"/></>,
 check:<><path d="m5 12 4 4L19 6"/></>,
 play:<><path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/></>,
 };
 return <svg {...s}>{paths[name]??paths.layers}</svg>;
}
function SectionHeading({icon,title,description}){return <div className="section-heading"><span className="section-heading-icon"><Icon name={icon} size={30}/></span><div><h2>{title}</h2>{description&&<p>{description}</p>}</div></div>}
function StatusPill({status,label}){return <span className={`status-pill status-${status}`}><span className="pill-symbol">{status==="success"?<Icon name="check" size={13}/>:status==="running"?"…":status==="error"?"!":"·"}</span>{label}</span>}
function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [productTitle, setProductTitle] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const [trainingMetrics, setTrainingMetrics] = useState(null);
  const [activeModel, setActiveModel] = useState(null);

  const [
    isMonitoringPipeline,
    setIsMonitoringPipeline,
  ] = useState(false);

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
      description: "TF-IDF + selezione automatica del modello",
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
      const result = await uploadDataset(selectedFile);
      setUploadMessage(result.message);

      const status = await refreshPipelineStatus();

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
        description: "Caricamento del CSV nel bucket raw-data",
        status: data.stages.upload,
      },
      {
        name: "Preprocessing",
        description: "Pulizia e trasformazione automatica del dataset",
        status: data.stages.preprocessing,
      },
      {
        name: "Training",
        description: "TF-IDF + selezione automatica del modello",
        status: data.stages.training,
      },
    ]);

    setTrainingMetrics(data.metrics ?? null);
    setActiveModel(data.active_model ?? null);
  }, []);

  const refreshPipelineStatus = useCallback(async () => {
    try {
      const status = await getPipelineStatus();
      applyPipelineStatus(status);
      return status;
    } catch (error) {
      console.error("Errore monitoraggio pipeline:", error);
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
  }, [isMonitoringPipeline, refreshPipelineStatus]);

  const formatModelVersion = (version) => {
    if (!version || version.length < 16) {
      return version;
    }

    const year = version.slice(0, 4);
    const month = version.slice(4, 6);
    const day = version.slice(6, 8);
    const hour = version.slice(9, 11);
    const minute = version.slice(11, 13);
    const second = version.slice(13, 15);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const formatAlgorithmName = (algorithm) => {
    const names = {
      LogisticRegression: "Logistic Regression",
      MultinomialNB: "Multinomial Naive Bayes",
      LinearSVM: "Linear SVM",
    };

    return names[algorithm] ?? algorithm;
  };

  const formatStageStatus = (status) => {
    const labels = {
      idle: "In attesa",
      running: "In corso",
      success: "Completato",
      error: "Errore",
    };

    return labels[status] ?? status;
  };



  const chooseFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {setUploadError("Seleziona un file CSV."); return;}
    setSelectedFile(file); setUploadMessage(""); setUploadError("");
  };
  const fileSize = selectedFile ? `${(selectedFile.size/1024/1024).toFixed(2)} MB` : "";
  const candidates = trainingMetrics?.selection?.candidate_models ?? [];
  const orderedAlgorithms = ["LogisticRegression","LinearSVM","MultinomialNB"];
  const orderedCandidates = orderedAlgorithms.map(algorithm => candidates.find(c => c.algorithm === algorithm) ?? { algorithm, accuracy: null, macro_f1: null, selected: false });
  const fmt = (x) => typeof x === "number" ? x.toFixed(3) : "—";
  const rows = (x) => x == null ? "—" : x.toLocaleString("en-US");


  return (
    <div className="app">
      <header className="app-header">
        <span className="eyebrow">
          SERVERLESS ML PIPELINE
        </span>

        <h1>Product Classification Dashboard</h1>

        <p>Serverless pipeline end-to-end per la classificazione dei prodotti, che comprende preprocessing dei dati, training del modello, selezione del modello e inferenza</p>

      </header>
      <main className="dashboard">
        <section className="dashboard-section pipeline-section">
          <SectionHeading icon="layers" title="Pipeline" />
          <div className="upload-card glass-card">
            <div className="upload-card-heading">
              <h3>Dataset Upload</h3>
              <span>Carica il dataset PriceRunner per avviare automaticamante preprocessing e training</span>
            </div>
            <div className="upload-content">
              <div className={`custom-dropzone ${dragActive ? "drag-active" : ""}`}
                role="button" tabIndex={0}
                onClick={()=>fileInputRef.current?.click()}
                onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fileInputRef.current?.click();}}}
                onDragOver={(e)=>{e.preventDefault();setDragActive(true)}}
                onDragLeave={(e)=>{e.preventDefault();setDragActive(false)}}
                onDrop={(e)=>{e.preventDefault();setDragActive(false);chooseFile(e.dataTransfer.files?.[0])}}>
                <input ref={fileInputRef} className="sr-only" type="file" accept=".csv,text/csv" onChange={e=>{chooseFile(e.target.files?.[0]);e.target.value=""}} />
                <Icon name="cloud" size={39}/>
                <strong>Trascina qui il dataset CSV</strong><span>oppure</span>
                <span className="choose-file">
                  <Icon name="file" size={15}/> Scegli file</span>
              </div>
              <div className="upload-right">
                <div className="uploaded-file">
                  <Icon name="file" size={34}/>
                  <div className="uploaded-file-copy">
                    <strong>{selectedFile?.name ?? "Nessun file selezionato"}</strong>
                    <span>{selectedFile ? `CSV file · ${fileSize}` : "Scegli un file CSV per avviare la pipeline"}</span>
                  </div>
                  {selectedFile && <StatusPill status={uploadMessage ? "success":"idle"} label={uploadMessage ? "Caricato":"Selezionato"}/>}
                  {selectedFile && <button className="icon-button" type="button" title="Rimuovi file" aria-label="Rimuovi file" disabled={isUploading||isMonitoringPipeline} onClick={()=>{setSelectedFile(null);setUploadMessage("");setUploadError("")}}><Icon name="trash" size={21}/></button>}
                </div>
                <button type="button" className="primary-button upload-run" onClick={handleUpload} disabled={!selectedFile||isUploading||isMonitoringPipeline}>{isUploading?"Caricamento in corso...":isMonitoringPipeline?"Pipeline in esecuzione...":"Upload e avvia pipeline"}</button>
              </div>
            </div>
            {(uploadError||uploadMessage) && <div className={uploadError?"feedback-error":"feedback-success"}>{uploadError||uploadMessage}</div>}
          </div>
          {isMonitoringPipeline && <div className="running-notice">
            <span className="spinner"/>Pipeline in esecuzione: aggiornamento automatico ogni 2 secondi.</div>}
          <div className="pipeline-stages">
            {pipelineStages.map((stage,i)=><div className="pipeline-stage-wrap" key={stage.name}>
              <div className="stage-card glass-card">
                <span className="stage-icon">
                  <Icon name={["upload","settings","training"][i]} size={39}/>
                </span>
                <span className="stage-copy">
                  <strong>{stage.name}</strong>
                  <small>{i===0?"Caricamento del dataset":i===1?"Pulizia e normalizzazione dei dati":"Allenamento dei modelli candidati"}</small>
                </span>
                <StatusPill status={stage.status} label={formatStageStatus(stage.status)}/>
              </div>
              {i<2&&<span className="stage-chevron"><Icon name="arrow" size={26}/></span>}
            </div>)}
          </div>
        </section>
        <section className="dashboard-section metrics-section"><SectionHeading icon="metrics" title="Metrics" />
          <div className="metrics-grid">
            {[{label:"Accuracy",value:fmt(trainingMetrics?.accuracy)},{label:"Macro F1",value:fmt(trainingMetrics?.macro_f1)},{label:"Train rows",value:rows(trainingMetrics?.train_rows)},{label:"Test rows",value:rows(trainingMetrics?.test_rows)},{label:"Cluster overlap",value:fmt(trainingMetrics?.cluster_overlap)}].map(item=>
            <div className="metric" key={item.label}>
              <span className="metric-icon"></span>
              <div className="metric-copy">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            </div>)}
          </div>
        </section>
        <section className="models-layout">
          <div className="model-selection-section"><SectionHeading icon="cube" title="Model Selection" description="Compara i modelli candidati e seleziona il migliore in base alle metriche di valutazione" />
            <div className="model-selection-list">
              {orderedCandidates.map(candidate=>
              <div className={`model-selection-row glass-card ${candidate.selected?"model-selection-row-selected":""}`} key={candidate.algorithm}>
                <div className="model-row-top">
                  <h3>{formatAlgorithmName(candidate.algorithm)}</h3>
                  {candidate.selected&&<span className="selected-badge"><Icon name="check" size={13}/> Selezionato</span>}
                </div>
                <div className="model-row-metrics">
                  <div>
                    <span>Accuracy</span>
                    <strong>{fmt(candidate.accuracy)}</strong>
                  </div>
                <div><span>Macro F1</span><strong>{fmt(candidate.macro_f1)}</strong></div></div>
              </div>)}
            </div>
            {trainingMetrics?.selection?.validation_rows!=null&&<p className="validation-note">Validation rows: {rows(trainingMetrics.selection.validation_rows)} · Selezione basata sul validation set</p>}
          </div>
          <div className="active-model-section"><SectionHeading icon="layers" title="Active Model" description="Modello attualmente usato per l'inferenza" />
            <div className="active-model-card">
              <strong>{activeModel?formatAlgorithmName(activeModel.algorithm):"No active model"}</strong>
              <div className="active-model-line"/>
              <span>
                <Icon name="clock" size={22}/>Versione: {activeModel?.version?formatModelVersion(activeModel.version):"—"}
              </span>
            </div>
          </div>
        </section>
        <section className="dashboard-section inference-section"><SectionHeading icon="sparkles" title="Inference" description="Classifica un nuovo prodotto fornendo il suo titolo" />
          <div className="inference-layout">
            <div className="inference-card glass-card">
              <label htmlFor="product-title">Product title</label>
            <div className="inference-form">
              <input id="product-title" value={productTitle} onChange={e=>setProductTitle(e.target.value)} placeholder="Es. Apple Iphone 13 128GB" onKeyDown={e=>{if(e.key==="Enter")handlePrediction()}}/>
              <button className="primary-button" onClick={handlePrediction} disabled={!productTitle.trim()||isPredicting}>{isPredicting?"Predizione...":"Avvia predizione"}</button>
            </div></div>
            <div className="result-card glass-card">
              {predictionError?<div className="feedback-error">
                <strong>Errore durante la predizione</strong>
                <p>{predictionError}</p>
            </div>:<>
                <div className="result-primary">
                  <span className="result-icon"></span>
                  <div className="result-category">
                  <span>Categoria prevista</span>
                  <strong>{prediction?.predicted_category ?? (isPredicting?"Predicting...":"—")}</strong>
                </div>
                <div className="result-confidence">
                  <span>Confidence</span>
                  <strong>{prediction?.confidence!=null?fmt(prediction.confidence):"—"}</strong>
                </div></div>
                <div className="result-meta">
                  <span>
                    Modello: 
                      <strong>{prediction?.algorithm?formatAlgorithmName(prediction.algorithm):activeModel?.algorithm?formatAlgorithmName(activeModel.algorithm):"—"}</strong>
                  </span>
                  <span>
                    <Icon name="clock" size={24}/>Versione: {prediction?.model_version?formatModelVersion(prediction.model_version):activeModel?.version?formatModelVersion(activeModel.version):"—"}
                  </span>
                </div>
                {prediction?.normalized_title&&<p className="normalized-note">Titolo normalizzato: {prediction.normalized_title}</p>}
              </>}
              {(prediction||predictionError)&&
                <button type="button" className="reset-link" onClick={()=>{setProductTitle("");setPrediction(null);setPredictionError("")}}>Nuova predizione</button>}
            </div>
          </div>
        </section>
      </main>
      <footer>Nuclio FaaS <span>•</span> MinIO <span>•</span> Docker <span>•</span> scikit-learn</footer>
    </div>
  );
}
export default App;
