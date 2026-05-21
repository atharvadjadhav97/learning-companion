const API_BASE_URL = "http://localhost:8000";

async function parseError(response, fallbackMessage) {
  let errorMessage = fallbackMessage;

  try {
    const errorData = await response.json();
    errorMessage = errorData.detail || fallbackMessage;
  } catch {
    // Ignore parsing error
  }

  return errorMessage;
}

export async function getBrainDumps() {
  const response = await fetch(`${API_BASE_URL}/brain-dumps`);

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to fetch brain dumps"));
  }

  return response.json();
}

export async function createBrainDump(brainDumpData) {
  const response = await fetch(`${API_BASE_URL}/brain-dumps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(brainDumpData),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to create brain dump"));
  }

  return response.json();
}

export async function deleteBrainDump(brainDumpId) {
  const response = await fetch(`${API_BASE_URL}/brain-dumps/${brainDumpId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to delete brain dump"));
  }

  return response.json();
}