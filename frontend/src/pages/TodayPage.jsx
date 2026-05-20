import { useEffect, useState } from "react";
import { createBrainDump, getBrainDumps } from "../api/brainDumps";
import {
  createTask,
  createTaskList,
  getTaskLists,
  getTasks,
} from "../api/tasks";

function TodayPage({ onNavigate }) {
  const [taskLists, setTaskLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [areaTasks, setAreaTasks] = useState({});
  const [recentBrainDumps, setRecentBrainDumps] = useState([]);

  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickDumpContent, setQuickDumpContent] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadTodayData();
  }, []);

  async function loadTodayData() {
    try {
      const lists = await getTaskLists();
      setTaskLists(lists);

      if (lists.length > 0) {
        setSelectedListId(String(lists[0].id));
      }

      const tasksByArea = {};

      for (const list of lists) {
        const tasks = await getTasks(list.id);
        tasksByArea[list.id] = tasks;
      }

      setAreaTasks(tasksByArea);

      const dumps = await getBrainDumps();
      setRecentBrainDumps(dumps.slice(0, 3));
    } catch (error) {
      setErrorMessage(error.message || "Could not load today dashboard");
    }
  }

  async function handleQuickAddTask(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!quickTaskTitle.trim()) {
      setErrorMessage("Task title is required");
      return;
    }

    try {
      let targetListId = selectedListId;

      if (!targetListId) {
        const defaultList = await createTaskList({
          name: "Inbox",
          description: "Default place for quick tasks",
        });

        targetListId = String(defaultList.id);
      }

      await createTask(Number(targetListId), {
        title: quickTaskTitle.trim(),
      });

      setQuickTaskTitle("");
      await loadTodayData();
    } catch (error) {
      setErrorMessage(error.message || "Could not add quick task");
    }
  }

  async function handleQuickBrainDump(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!quickDumpContent.trim()) {
      setErrorMessage("Write something before saving a brain dump");
      return;
    }

    try {
      await createBrainDump({
        content: quickDumpContent.trim(),
      });

      setQuickDumpContent("");
      await loadTodayData();
    } catch (error) {
      setErrorMessage(error.message || "Could not save brain dump");
    }
  }

  const totalOpenTasks = Object.values(areaTasks).reduce((total, tasks) => {
    return total + tasks.filter((task) => task.is_done === 0).length;
  }, 0);

  const totalCompletedTasks = Object.values(areaTasks).reduce((total, tasks) => {
    return total + tasks.filter((task) => task.is_done === 1).length;
  }, 0);

  const areasWithOpenCounts = taskLists.map((list) => {
    const tasks = areaTasks[list.id] || [];
    const openCount = tasks.filter((task) => task.is_done === 0).length;
    const completedCount = tasks.filter((task) => task.is_done === 1).length;

    return {
      ...list,
      openCount,
      completedCount,
    };
  });

  return (
    <div className="page">
      <header className="page-header today-header">
        <div>
          <p className="eyebrow">Today</p>
          <h2>What should I pick up?</h2>
          <p>
            Your daily command center for tasks, areas, and quick thoughts.
          </p>
        </div>
      </header>

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <div className="today-stats-grid">
        <section className="stat-card">
          <span>Open tasks</span>
          <strong>{totalOpenTasks}</strong>
        </section>

        <section className="stat-card">
          <span>Completed tasks</span>
          <strong>{totalCompletedTasks}</strong>
        </section>

        <section className="stat-card">
          <span>Areas</span>
          <strong>{taskLists.length}</strong>
        </section>
      </div>

      <div className="today-layout">
        <section className="panel today-primary-panel">
          <div className="panel-header">
            <h3>Quick Add Task</h3>
            <p>
              Capture a task quickly and assign it to an area like Job Hunt,
              Client Work, Personal, or Groceries.
            </p>
          </div>

          <form onSubmit={handleQuickAddTask} className="quick-task-form">
            <input
              value={quickTaskTitle}
              onChange={(event) => setQuickTaskTitle(event.target.value)}
              placeholder="Example: Apply to 2 jobs, buy groceries, review client notes..."
            />

            <select
              value={selectedListId}
              onChange={(event) => setSelectedListId(event.target.value)}
            >
              {taskLists.length === 0 ? (
                <option value="">Create Inbox automatically</option>
              ) : (
                taskLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))
              )}
            </select>

            <button type="submit" className="primary-button">
              Add Task
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Quick Brain Dump</h3>
            <p>Unload thoughts without organizing them right away.</p>
          </div>

          <form onSubmit={handleQuickBrainDump} className="form-stack">
            <textarea
              value={quickDumpContent}
              onChange={(event) => setQuickDumpContent(event.target.value)}
              placeholder="Example: Need to check client work, buy groceries, apply to jobs, and maybe start freelance estimate tomorrow..."
              className="today-dump-textarea"
            />

            <button type="submit" className="primary-button">
              Save Dump
            </button>
          </form>
        </section>
      </div>

      <div className="today-layout">
        <section className="panel">
          <div className="panel-header">
            <h3>Area Snapshot</h3>
            <p>Where your attention is currently spread.</p>
          </div>

          {areasWithOpenCounts.length === 0 ? (
            <div className="empty-state small-empty-state">
              <h3>No areas yet</h3>
              <p>Create areas from the Areas page or quick-add your first task.</p>
            </div>
          ) : (
            <div className="area-snapshot-list">
              {areasWithOpenCounts.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  className="area-snapshot-card"
                  onClick={() => onNavigate("areas")}
                >
                  <div>
                    <strong>{area.name}</strong>
                    {area.description && <span>{area.description}</span>}
                  </div>

                  <small>
                    {area.openCount} open / {area.completedCount} done
                  </small>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Recent Brain Dumps</h3>
            <p>Latest thoughts you captured.</p>
          </div>

          {recentBrainDumps.length === 0 ? (
            <p className="muted-text">No recent brain dumps yet.</p>
          ) : (
            <div className="recent-dump-list">
              {recentBrainDumps.map((dump) => (
                <article key={dump.id} className="recent-dump-card">
                  <p>{dump.content}</p>
                  <small>
                    {dump.created_at
                      ? new Date(dump.created_at).toLocaleString()
                      : "Saved"}
                  </small>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default TodayPage;