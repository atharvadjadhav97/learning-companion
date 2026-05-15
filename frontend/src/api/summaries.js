const API_BASE_URL = "http://localhost:8000";

export async function generateTopicSummary(topicId) {
  const response = await fetch(`${API_BASE_URL}/topics/${topicId}/summary`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to generate topic summary");
  }

  return response.json();
}

export async function getTopicSummary(topicId) {
  const response = await fetch(`${API_BASE_URL}/topics/${topicId}/summary`);

  if (!response.ok) {
    throw new Error("Failed to fetch topic summary");
  }

  return response.json();
}