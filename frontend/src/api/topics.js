const API_BASE_URL = "http://localhost:8000";

export async function getTopics() {
  const response = await fetch(`${API_BASE_URL}/topics`);

  if (!response.ok) {
    throw new Error("Failed to fetch topics");
  }

  return response.json();
}

export async function createTopic(topicData) {
  const response = await fetch(`${API_BASE_URL}/topics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(topicData),
  });

  if (!response.ok) {
    throw new Error("Failed to create topic");
  }

  return response.json();
}
