# Serverless Product Classification Pipeline — Frontend

Frontend sviluppato in React per il progetto di **Sistemi Distribuiti e Cloud Computing**.

L'interfaccia permette di utilizzare e testare la pipeline Machine Learning serverless sviluppata nel backend.

## Tecnologie utilizzate

- React
- JavaScript
- Vite
- CSS
- Fetch API

## Funzionalità

Attraverso la dashboard è possibile:

- selezionare un dataset CSV;
- caricarlo nel backend;
- avviare automaticamente la pipeline;
- monitorare preprocessing e training;
- visualizzare le metriche ottenute;
- inserire il titolo di un prodotto;
- ottenere la categoria prevista dal modello;
- visualizzare la confidence della predizione.

## Requisiti

È necessario avere installato:

```text
Node.js
npm
```

Durante lo sviluppo è stata utilizzata la versione:

```text
Node.js 22.12.0
```

È inoltre necessario che il backend del progetto sia avviato.

In particolare devono essere disponibili:

```text
upload-faas      → porta 8084
inference-faas   → porta 8085
status-faas      → porta 8086
```

## Installazione

Entrare nella directory:

```text
sistemi-distribuiti-ml-forntend
```

Installare le dipendenze:

```powershell
npm install
```

## Avvio

Avviare il server di sviluppo:

```powershell
npm run dev
```

Vite mostrerà l'indirizzo locale dell'applicazione, normalmente:

```text
http://localhost:5173
```

Aprire questo indirizzo nel browser.

## Utilizzo

### Avvio della pipeline

Nella sezione dedicata al training:

1. selezionare o trascinare il file CSV;
2. premere `Upload e avvia pipeline`;
3. attendere il completamento di preprocessing e training.

La dashboard aggiorna automaticamente lo stato delle varie fasi.

Quando il training termina vengono visualizzate alcune metriche, tra cui:

```text
Accuracy
Macro F1
Train rows
Test rows
Cluster overlap
```

### Predizione

Nella sezione dedicata all'inference inserire un titolo, ad esempio:

```text
apple iphone 13 128gb
```

e premere:

```text
Avvia predizione
```

Il frontend mostra:

```text
categoria prevista
confidence
```

## Comunicazione con il backend

Durante lo sviluppo Vite utilizza dei proxy locali.

Gli endpoint utilizzati dal frontend sono:

```text
/api/upload
/api/inference
/api/status
```

che vengono inoltrati rispettivamente alle funzioni Nuclio:

```text
http://localhost:8084
http://localhost:8085
http://localhost:8086
```

La configurazione è contenuta in:

```text
vite.config.js
```

## Struttura principale

```text
sistemi-distribuiti-ml-forntend/
│
├── package.json
├── vite.config.js
├── index.html
│
└── src/
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── main.jsx
    │
    ├── api/
    │   ├── uploadApi.js
    │   ├── inferenceApi.js
    │   └── statusApi.js
    │
    └── components/
        ├── FileDropZone.jsx
        ├── ProgressBar.jsx
        └── StatusBadge.jsx
```

## Componenti principali

### FileDropZone

Permette di selezionare il dataset CSV tramite file picker oppure drag and drop.

### ProgressBar

Visualizza lo stato delle fasi:

```text
Upload
Preprocessing
Training
```

### StatusBadge

Mostra graficamente lo stato delle singole operazioni:

```text
In attesa
In esecuzione
Completato
Errore
```

## API frontend

Le chiamate HTTP sono separate dalla parte grafica.

Sono presenti:

```text
uploadApi.js
inferenceApi.js
statusApi.js
```

Questa separazione permette di mantenere più semplice il codice dei componenti React.

## Note

Il frontend è pensato per essere utilizzato insieme al backend del progetto.

Prima di avviare una demo è quindi consigliato verificare che:

```text
Docker sia attivo
MinIO sia disponibile
le funzioni Nuclio siano operative
```

Se `status-faas` non è raggiungibile, l'interfaccia segnala che l'infrastruttura backend non è disponibile.