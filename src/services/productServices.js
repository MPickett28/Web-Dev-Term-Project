const API_URL = "http://localhost:5000/api/products";

export async function getProducts() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Unable to load products.");
  }

  return response.json();
}