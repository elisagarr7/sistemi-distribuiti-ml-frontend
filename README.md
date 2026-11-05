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
- caricarlo nel backend e avviare automaticamente la pipeline;
- monitorare upload, preprocessing e training;
- visualizzare le metriche finali;
- confrontare i modelli candidati;
- vedere quale modello è stato selezionato automaticamente;
- visualizzare algoritmo e versione del modello attivo;
- inserire il titolo di un prodotto;
- ottenere la categoria prevista e la confidence.

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

Nella sezione `Pipeline`:

1. selezionare o trascinare il file CSV;
2. premere `Avvia pipeline`;
3. attendere il completamento delle tre fasi.

La dashboard aggiorna automaticamente lo stato di:

```text
Upload dataset
Preprocessing
Training
```

Durante l'esecuzione viene effettuato periodicamente il polling di `status-faas`.

### Metriche

Quando il training termina vengono mostrate le principali metriche finali:

```text
Accuracy
Macro F1
Train rows
Test rows
Cluster overlap
```

Queste metriche si riferiscono al modello selezionato e valutato sul test set.

### Model Selection

La dashboard mostra il confronto tra:

```text
Logistic Regression
Multinomial Naive Bayes
Linear SVM
```

Per ogni modello vengono visualizzati:

```text
Accuracy
Macro F1
```

Le metriche di questa sezione sono quelle ottenute sul validation set.

Il modello con il miglior Macro F1 viene evidenziato come selezionato.

### Active Model

La sezione `Active Model` mostra:

```text
algoritmo attivo
versione del modello
```

La versione corrisponde all'identificativo generato durante il training, ad esempio:

```text
20261104T042133Z
```

Nell'interfaccia viene mostrata in un formato data/ora più leggibile.

### Inference

Nella sezione `Inference` inserire un titolo, ad esempio:

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
modello utilizzato
versione
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
        └── FileDropZone.jsx
```

## Organizzazione del frontend

`App.jsx` gestisce:

- stato della pipeline;
- polling dello stato backend;
- metriche;
- model selection;
- modello attivo;
- inference.

Le chiamate HTTP sono separate nei file:

```text
uploadApi.js
inferenceApi.js
statusApi.js
```

Questa separazione mantiene distinta la logica di comunicazione con il backend dalla parte grafica.

`FileDropZone` gestisce la selezione del dataset tramite file picker o drag and drop.

## Note

Il frontend è pensato per essere utilizzato insieme al backend del progetto.

Prima di avviare una demo è consigliato verificare che:

```text
Docker sia attivo
MinIO sia disponibile
le funzioni Nuclio siano operative
```

Il frontend non implementa direttamente la logica di Machine Learning: visualizza lo stato e i risultati restituiti dalle funzioni serverless del backend.