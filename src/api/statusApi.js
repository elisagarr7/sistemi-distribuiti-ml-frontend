export async function getPipelineStatus() {
  const response = await fetch("/api/status", {
    method: "GET",
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "La risposta del servizio di stato non è valida."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Impossibile recuperare lo stato della pipeline."
    );
  }

  return data;
}