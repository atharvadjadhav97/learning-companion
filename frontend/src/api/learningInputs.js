const API_BASE_URL = "http://localhost:8000";

export async function getLearningInputs(topicId) {
  const response = await fetch(`${API_BASE_URL}/topics/${topicId}/inputs`);

  if (!response.ok) {
    throw new Error("Failed to fetch learning inputs");
  }

  return response.json();
}

export async function createLearningInput(topicId, inputData) {
  const response = await fetch(`${API_BASE_URL}/topics/${topicId}/inputs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inputData),
  });

  if (!response.ok) {
    throw new Error("Failed to create learning input");
  }

  return response.json();
}
