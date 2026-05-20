import { useEffect, useState } from "react";
import {
  createTask,
  createTaskList,
  deleteTask,
  deleteTaskList,
  getTaskLists,
  getTasks,
  toggleTask,
  toggleTaskToday,
  updateTask,
  updateTaskList,
} from "../api/tasks";

function TasksPage() {
  const [taskLists, setTaskLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [isCreatingArea, setIsCreatingArea] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [editingListId, setEditingListId] = useState(null);
  const [editingListName, setEditingListName] = useState("");
  const [editingListDescription, setEditingListDescription] = useState("");

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

      if (data.length === 0) {
        setSelectedList(null);
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not load areas");
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
      setErrorMessage("Area name is required");
      return;
    }

    try {
      const createdList = await createTaskList({
        name: newListName.trim(),
        description: newListDescription.trim() || null,
      });

      setNewListName("");
      setNewListDescription("");
      setIsCreatingArea(false);

      await loadTaskLists();
      setSelectedList(createdList);
    } catch (error) {
      setErrorMessage(error.message || "Could not create area");
    }
  }

  function startEditingList(list) {
    setEditingListId(list.id);
    setEditingListName(list.name);
    setEditingListDescription(list.description || "");
    setErrorMessage("");
  }

  function cancelEditingList() {
    setEditingListId(null);
    setEditingListName("");
    setEditingListDescription("");
  }

  async function handleSaveEditedList(listId) {
    setErrorMessage("");

    if (!editingListName.trim()) {
      setErrorMessage("Area name is required");
      return;
    }

    try {
      const updatedList = await updateTaskList(listId, {
        name: editingListName.trim(),
        description: editingListDescription.trim() || null,
      });

      setTaskLists((currentLists) =>
        currentLists.map((list) =>
          list.id === updatedList.id ? updatedList : list
        )
      );

      if (selectedList?.id === updatedList.id) {
        setSelectedList(updatedList);
      }

      cancelEditingList();
    } catch (error) {
      setErrorMessage(error.message || "Could not update area");
    }
  }

  async function handleDeleteTaskList(listId) {
    setErrorMessage("");

    const listToDelete = taskLists.find((list) => list.id === listId);

    const shouldDelete = window.confirm(
      `Are you sure you want to delete "${
        listToDelete?.name || "this area"
      }"? This will also delete all tasks inside it.`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteTaskList(listId);

      const remainingLists = taskLists.filter((list) => list.id !== listId);
      setTaskLists(remainingLists);

      if (selectedList?.id === listId) {
        setSelectedList(remainingLists[0] || null);
      }

      cancelEditingList();
      cancelEditingTask();
    } catch (error) {
      setErrorMessage(error.message || "Could not delete area");
    }
  }

  async function handleAddTask(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!selectedList) {
      setErrorMessage("Select an area first");
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
      setIsAddingTask(false);
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

  async function handleToggleTaskToday(taskId) {
    setErrorMessage("");

    try {
      await toggleTaskToday(taskId);

      if (selectedList) {
        await loadTasks(selectedList.id);
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not update today status");
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

  const pendingTasks = tasks.filter((task) => task.is_done === 0);
  const completedTasks = tasks.filter((task) => task.is_done === 1);

  return (
    <div className="page areas-page">
      <header className="page-header areas-header">
        <div>
          <p className="eyebrow">Areas</p>
          <h2>Areas & Tasks</h2>
          <p>
            Organize responsibilities like Job Hunt, Client Work, Personal,
            Groceries, and projects into focused areas.
          </p>
        </div>
      </header>

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <div className="clean-areas-layout">
        <section className="panel clean-area-sidebar">
          <div className="clean-section-header">
            <div>
              <h3>Areas</h3>
              <p>Pick the area you want to work from.</p>
            </div>

            <button
              type="button"
              className="icon-add-button"
              onClick={() => {
                setIsCreatingArea((current) => !current);
                cancelEditingList();
              }}
            >
              +
            </button>
          </div>

          {isCreatingArea && (
            <form onSubmit={handleCreateTaskList} className="inline-create-box">
              <input
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
                placeholder="Area name"
              />

              <textarea
                value={newListDescription}
                onChange={(event) =>
                  setNewListDescription(event.target.value)
                }
                placeholder="Optional description"
              />

              <div className="compact-action-row">
                <button type="submit" className="primary-button small-button">
                  Save
                </button>

                <button
                  type="button"
                  className="secondary-button small-button"
                  onClick={() => {
                    setIsCreatingArea(false);
                    setNewListName("");
                    setNewListDescription("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {taskLists.length === 0 ? (
            <p className="muted-text">No areas yet. Add your first area.</p>
          ) : (
            <div className="clean-area-list">
              {taskLists.map((list) => (
                <div
                  key={list.id}
                  className={
                    selectedList?.id === list.id
                      ? "clean-area-card selected"
                      : "clean-area-card"
                  }
                >
                  {editingListId === list.id ? (
                    <div className="list-edit-area">
                      <input
                        value={editingListName}
                        onChange={(event) =>
                          setEditingListName(event.target.value)
                        }
                        placeholder="Area name"
                      />

                      <textarea
                        value={editingListDescription}
                        onChange={(event) =>
                          setEditingListDescription(event.target.value)
                        }
                        placeholder="Optional description"
                      />

                      <div className="compact-action-row">
                        <button
                          type="button"
                          className="primary-button small-button"
                          onClick={() => handleSaveEditedList(list.id)}
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          className="secondary-button small-button"
                          onClick={cancelEditingList}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="clean-area-select"
                        onClick={() => {
                          setSelectedList(list);
                          setErrorMessage("");
                          setIsAddingTask(false);
                          cancelEditingTask();
                        }}
                      >
                        <strong>{list.name}</strong>
                        {list.description && <span>{list.description}</span>}
                      </button>

                      <div className="quiet-actions">
                        <button
                          type="button"
                          onClick={() => startEditingList(list)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTaskList(list.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel clean-task-panel">
          {!selectedList ? (
            <div className="empty-state">
              <h3>Select an area</h3>
              <p>Choose or create an area to view tasks.</p>
            </div>
          ) : (
            <>
              <div className="selected-area-header">
                <div>
                  <p className="eyebrow">Selected Area</p>
                  <h3>{selectedList.name}</h3>
                  {selectedList.description && (
                    <p>{selectedList.description}</p>
                  )}
                </div>

                <button
                  type="button"
                  className="icon-add-button"
                  onClick={() => {
                    setIsAddingTask((current) => !current);
                    cancelEditingTask();
                  }}
                >
                  +
                </button>
              </div>

              {isAddingTask && (
                <form onSubmit={handleAddTask} className="inline-create-box">
                  <input
                    value={newTaskTitle}
                    onChange={(event) => setNewTaskTitle(event.target.value)}
                    placeholder={`Add task to ${selectedList.name}`}
                  />

                  <div className="compact-action-row">
                    <button type="submit" className="primary-button small-button">
                      Save
                    </button>

                    <button
                      type="button"
                      className="secondary-button small-button"
                      onClick={() => {
                        setIsAddingTask(false);
                        setNewTaskTitle("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="task-section-block">
                <div className="task-section-title">
                  <h4>Pending</h4>
                </div>

                {pendingTasks.length === 0 ? (
                  <p className="muted-text">No pending tasks in this area.</p>
                ) : (
                  <div className="clean-task-list">
                    {pendingTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        editingTaskId={editingTaskId}
                        editingTaskTitle={editingTaskTitle}
                        setEditingTaskTitle={setEditingTaskTitle}
                        onToggleTask={handleToggleTask}
                        onToggleToday={handleToggleTaskToday}
                        onStartEdit={startEditingTask}
                        onCancelEdit={cancelEditingTask}
                        onSaveEdit={handleSaveEditedTask}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="task-section-block">
                <div className="task-section-title">
                  <h4>Completed</h4>
                </div>

                {completedTasks.length === 0 ? (
                  <p className="muted-text">No completed tasks in this area.</p>
                ) : (
                  <div className="clean-task-list">
                    {completedTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        editingTaskId={editingTaskId}
                        editingTaskTitle={editingTaskTitle}
                        setEditingTaskTitle={setEditingTaskTitle}
                        onToggleTask={handleToggleTask}
                        onToggleToday={handleToggleTaskToday}
                        onStartEdit={startEditingTask}
                        onCancelEdit={cancelEditingTask}
                        onSaveEdit={handleSaveEditedTask}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  editingTaskId,
  editingTaskTitle,
  setEditingTaskTitle,
  onToggleTask,
  onToggleToday,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}) {
  const isEditing = editingTaskId === task.id;

  return (
    <div
      className={
        task.is_done === 1
          ? "clean-task-row completed"
          : "clean-task-row"
      }
    >
      <label className="clean-task-main">
        <input
          type="checkbox"
          checked={task.is_done === 1}
          onChange={() => onToggleTask(task.id)}
        />

        {isEditing ? (
          <input
            value={editingTaskTitle}
            onChange={(event) => setEditingTaskTitle(event.target.value)}
            className="task-inline-edit-input"
          />
        ) : (
          <span>{task.title}</span>
        )}
      </label>

      {isEditing ? (
        <div className="compact-action-row">
          <button
            type="button"
            className="primary-button small-button"
            onClick={() => onSaveEdit(task.id)}
          >
            Save
          </button>

          <button
            type="button"
            className="secondary-button small-button"
            onClick={onCancelEdit}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="clean-task-actions">
          {task.is_done === 0 && (
            <button
              type="button"
              className={
                task.is_today === 1
                  ? "today-pill active"
                  : "today-pill"
              }
              onClick={() => onToggleToday(task.id)}
            >
              {task.is_today === 1 ? "Today" : "Add Today"}
            </button>
          )}

          <button type="button" onClick={() => onStartEdit(task)}>
            Edit
          </button>

          <button type="button" onClick={() => onDelete(task.id)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default TasksPage;