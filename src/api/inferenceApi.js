export async function predictProduct(productTitle) {
  const response = await fetch("/api/inference", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      product_title: productTitle,
    }),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "La risposta ricevuta dal servizio di inference non è valida."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        "Errore durante la predizione."
    );
  }

  return data;
}