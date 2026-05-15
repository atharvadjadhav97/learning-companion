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

export async function getTaskLists() {
  const response = await fetch(`${API_BASE_URL}/task-lists`);

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to fetch task lists"));
  }

  return response.json();
}

export async function createTaskList(taskListData) {
  const response = await fetch(`${API_BASE_URL}/task-lists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskListData),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to create task list"));
  }

  return response.json();
}

export async function getTasks(taskListId) {
  const response = await fetch(`${API_BASE_URL}/task-lists/${taskListId}/tasks`);

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to fetch tasks"));
  }

  return response.json();
}

export async function createTask(taskListId, taskData) {
  const response = await fetch(`${API_BASE_URL}/task-lists/${taskListId}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to create task"));
  }

  return response.json();
}

export async function toggleTask(taskId) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to toggle task"));
  }

  return response.json();
}