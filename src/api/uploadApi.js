export async function uploadDataset(file) {
  if (!file) {
    throw new Error("Nessun file selezionato.");
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Il file selezionato deve essere un CSV.");
  }

  const response = await fetch("/api/upload", {
    method: "POST",

    headers: {
      "Content-Type": "text/csv",
      "X-Filename": file.name,
    },

    body: file,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "La risposta ricevuta dal servizio di upload non è valida."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Errore durante il caricamento del dataset."
    );
  }

  return data;
}