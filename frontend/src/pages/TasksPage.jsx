import { useEffect, useState } from "react";
import {
  createTask,
  createTaskList,
  deleteTask,
  getTaskLists,
  getTasks,
  toggleTask,
  updateTask,
} from "../api/tasks";

function TasksPage() {
  const [taskLists, setTaskLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadTaskLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      loadTasks(selectedList.id);
    } else {
      setTasks([]);
    }
  }, [selectedList]);

  async function loadTaskLists() {
    try {
      const data = await getTaskLists();
      setTaskLists(data);

      if (data.length > 0 && !selectedList) {
        setSelectedList(data[0]);
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not load task lists");
    }
  }

  async function loadTasks(taskListId) {
    try {
      const data = await getTasks(taskListId);
      setTasks(data);
    } catch (error) {
      setErrorMessage(error.message || "Could not load tasks");
    }
  }

  async function handleCreateTaskList(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!newListName.trim()) {
      setErrorMessage("Task list name is required");
      return;
    }

    try {
      const createdList = await createTaskList({
        name: newListName.trim(),
        description: newListDescription.trim() || null,
      });

      setNewListName("");
      setNewListDescription("");

      await loadTaskLists();
      setSelectedList(createdList);
    } catch (error) {
      setErrorMessage(error.message || "Could not create task list");
    }
  }

  async function handleAddTask(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!selectedList) {
      setErrorMessage("Select a task list first");
      return;
    }

    if (!newTaskTitle.trim()) {
      setErrorMessage("Task title is required");
      return;
    }

    try {
      await createTask(selectedList.id, {
        title: newTaskTitle.trim(),
      });

      setNewTaskTitle("");
      await loadTasks(selectedList.id);
    } catch (error) {
      setErrorMessage(error.message || "Could not create task");
    }
  }

  async function handleToggleTask(taskId) {
    setErrorMessage("");

    try {
      await toggleTask(taskId);

      if (selectedList) {
        await loadTasks(selectedList.id);
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not update task");
    }
  }

  function startEditingTask(task) {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setErrorMessage("");
  }

  function cancelEditingTask() {
    setEditingTaskId(null);
    setEditingTaskTitle("");
  }

  async function handleSaveEditedTask(taskId) {
    setErrorMessage("");

    if (!editingTaskTitle.trim()) {
      setErrorMessage("Task title is required");
      return;
    }

    try {
      await updateTask(taskId, {
        title: editingTaskTitle.trim(),
      });

      setEditingTaskId(null);
      setEditingTaskTitle("");

      if (selectedList) {
        await loadTasks(selectedList.id);
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not update task");
    }
  }

  async function handleDeleteTask(taskId) {
    setErrorMessage("");

    const shouldDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteTask(taskId);

      if (selectedList) {
        await loadTasks(selectedList.id);
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not delete task");
    }
  }

  const completedTasks = tasks.filter((task) => task.is_done === 1).length;
  const openTasks = tasks.length - completedTasks;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Tasks</p>
          <h2>Task Lists</h2>
          <p>
            Organize personal tasks into focused lists instead of one giant to-do pile.
          </p>
        </div>
      </header>

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <div className="task-stats-grid">
        <section className="stat-card">
          <span>Lists</span>
          <strong>{taskLists.length}</strong>
        </section>

        <section className="stat-card">
          <span>Selected open</span>
          <strong>{openTasks}</strong>
        </section>

        <section className="stat-card">
          <span>Selected completed</span>
          <strong>{completedTasks}</strong>
        </section>
      </div>

      <div className="tasks-layout">
        <section className="panel task-list-panel">
          <div className="panel-header">
            <h3>Create List</h3>
            <p>Add focused areas like Groceries, Personal, or Project tasks.</p>
          </div>

          <form onSubmit={handleCreateTaskList} className="form-stack">
            <label>
              List Name
              <input
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
                placeholder="Example: Groceries"
              />
            </label>

            <label>
              Description
              <textarea
                value={newListDescription}
                onChange={(event) =>
                  setNewListDescription(event.target.value)
                }
                placeholder="Optional short description"
              />
            </label>

            <button type="submit" className="primary-button">
              Create List
            </button>
          </form>

          <div className="topic-list-section">
            <h3>Lists</h3>

            {taskLists.length === 0 ? (
              <p className="muted-text">
                No task lists yet. Create your first list.
              </p>
            ) : (
              <div className="task-list-menu">
                {taskLists.map((list) => (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setSelectedList(list);
                      cancelEditingTask();
                    }}
                    className={
                      selectedList?.id === list.id
                        ? "task-list-card selected"
                        : "task-list-card"
                    }
                  >
                    <div>
                      <strong>{list.name}</strong>
                      {list.description && <span>{list.description}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="panel task-detail-panel">
          {!selectedList ? (
            <div className="empty-state">
              <h3>Select a list</h3>
              <p>Choose or create a list to view and add tasks.</p>
            </div>
          ) : (
            <>
              <div className="panel-header">
                <p className="eyebrow">Selected List</p>
                <h3>{selectedList.name}</h3>
                {selectedList.description && <p>{selectedList.description}</p>}
              </div>

              <form onSubmit={handleAddTask} className="task-add-row">
                <input
                  value={newTaskTitle}
                  onChange={(event) => setNewTaskTitle(event.target.value)}
                  placeholder={`Add task to ${selectedList.name}`}
                />

                <button type="submit" className="primary-button">
                  Add Task
                </button>
              </form>

              <div className="task-items">
                {tasks.length === 0 ? (
                  <p className="muted-text">No tasks in this list yet.</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={
                        task.is_done === 1
                          ? "task-item task-item-row completed"
                          : "task-item task-item-row"
                      }
                    >
                      <label className="task-check-label">
                        <input
                          type="checkbox"
                          checked={task.is_done === 1}
                          onChange={() => handleToggleTask(task.id)}
                        />
                      </label>

                      {editingTaskId === task.id ? (
                        <div className="task-edit-area">
                          <input
                            value={editingTaskTitle}
                            onChange={(event) =>
                              setEditingTaskTitle(event.target.value)
                            }
                          />

                          <div className="task-actions">
                            <button
                              type="button"
                              className="primary-button small-button"
                              onClick={() => handleSaveEditedTask(task.id)}
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              className="secondary-button small-button"
                              onClick={cancelEditingTask}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="task-title">{task.title}</span>

                          <div className="task-actions">
                            <button
                              type="button"
                              className="secondary-button small-button"
                              onClick={() => startEditingTask(task)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="danger-button small-button"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default TasksPage;