import { useState } from "react";

const initialTaskLists = [
  {
    id: 1,
    name: "Groceries",
    description: "Things to buy during grocery runs.",
    tasks: [
      { id: 1, title: "Buy Greek yogurt", isDone: false },
      { id: 2, title: "Buy fruits", isDone: false },
      { id: 3, title: "Buy sourdough bread", isDone: true },
    ],
  },
  {
    id: 2,
    name: "Learning Companion Project",
    description: "Tasks related to building this app.",
    tasks: [
      { id: 4, title: "Add sidebar workspace UI", isDone: true },
      { id: 5, title: "Design task lists page", isDone: false },
      { id: 6, title: "Add task backend with SQLite", isDone: false },
    ],
  },
  {
    id: 3,
    name: "Personal",
    description: "Personal admin and life tasks.",
    tasks: [
      { id: 7, title: "Organize documents", isDone: false },
      { id: 8, title: "Plan weekly errands", isDone: false },
    ],
  },
  {
    id: 4,
    name: "Tomorrow",
    description: "Things I want to take up next day.",
    tasks: [
      { id: 9, title: "Review current project checkpoint", isDone: false },
      { id: 10, title: "Watch one AI/RAG video during lunch", isDone: false },
    ],
  },
];

function TasksPage() {
  const [taskLists, setTaskLists] = useState(initialTaskLists);
  const [selectedListId, setSelectedListId] = useState(initialTaskLists[0].id);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const selectedList = taskLists.find((list) => list.id === selectedListId);

  function handleAddTask(event) {
    event.preventDefault();

    if (!newTaskTitle.trim() || !selectedList) {
      return;
    }

    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      isDone: false,
    };

    setTaskLists((currentLists) =>
      currentLists.map((list) => {
        if (list.id !== selectedList.id) {
          return list;
        }

        return {
          ...list,
          tasks: [newTask, ...list.tasks],
        };
      })
    );

    setNewTaskTitle("");
  }

  function handleToggleTask(taskId) {
    setTaskLists((currentLists) =>
      currentLists.map((list) => {
        if (list.id !== selectedListId) {
          return list;
        }

        return {
          ...list,
          tasks: list.tasks.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            return {
              ...task,
              isDone: !task.isDone,
            };
          }),
        };
      })
    );
  }

  const totalTasks = taskLists.reduce(
    (total, list) => total + list.tasks.length,
    0
  );

  const completedTasks = taskLists.reduce(
    (total, list) =>
      total + list.tasks.filter((task) => task.isDone).length,
    0
  );

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

      <div className="task-stats-grid">
        <section className="stat-card">
          <span>Total tasks</span>
          <strong>{totalTasks}</strong>
        </section>

        <section className="stat-card">
          <span>Completed</span>
          <strong>{completedTasks}</strong>
        </section>

        <section className="stat-card">
          <span>Open</span>
          <strong>{totalTasks - completedTasks}</strong>
        </section>
      </div>

      <div className="tasks-layout">
        <section className="panel task-list-panel">
          <div className="panel-header">
            <h3>Lists</h3>
            <p>Choose the area you want to focus on.</p>
          </div>

          <div className="task-list-menu">
            {taskLists.map((list) => {
              const openCount = list.tasks.filter((task) => !task.isDone).length;

              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => setSelectedListId(list.id)}
                  className={
                    selectedListId === list.id
                      ? "task-list-card selected"
                      : "task-list-card"
                  }
                >
                  <div>
                    <strong>{list.name}</strong>
                    <span>{list.description}</span>
                  </div>

                  <small>{openCount} open</small>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel task-detail-panel">
          {!selectedList ? (
            <div className="empty-state">
              <h3>Select a list</h3>
              <p>Choose a list to view and add tasks.</p>
            </div>
          ) : (
            <>
              <div className="panel-header">
                <p className="eyebrow">Selected List</p>
                <h3>{selectedList.name}</h3>
                <p>{selectedList.description}</p>
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
                {selectedList.tasks.length === 0 ? (
                  <p className="muted-text">No tasks in this list yet.</p>
                ) : (
                  selectedList.tasks.map((task) => (
                    <label
                      key={task.id}
                      className={
                        task.isDone ? "task-item completed" : "task-item"
                      }
                    >
                      <input
                        type="checkbox"
                        checked={task.isDone}
                        onChange={() => handleToggleTask(task.id)}
                      />

                      <span>{task.title}</span>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <section className="panel note-panel">
        <h3>Checkpoint note</h3>
        <p className="muted-text">
          These tasks are currently frontend-only mock data. They reset when the page refreshes.
          In the next task checkpoint, we will persist task lists and tasks with SQLite.
        </p>
      </section>
    </div>
  );
}

export default TasksPage;