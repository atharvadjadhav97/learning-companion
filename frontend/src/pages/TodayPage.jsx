import { useEffect, useState } from "react";
import { getBrainDumps } from "../api/brainDumps";
import {
  getTaskLists,
  getTasks,
  toggleTask,
  toggleTaskToday,
} from "../api/tasks";

function TodayPage({ onNavigate }) {
  const [taskLists, setTaskLists] = useState([]);
  const [areaTasks, setAreaTasks] = useState({});
  const [recentBrainDumps, setRecentBrainDumps] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadTodayData();
  }, []);

  async function loadTodayData() {
    try {
      const lists = await getTaskLists();
      setTaskLists(lists);

      const tasksByArea = {};

      for (const list of lists) {
        const tasks = await getTasks(list.id);
        tasksByArea[list.id] = tasks;
      }

      setAreaTasks(tasksByArea);

      const dumps = await getBrainDumps();
      setRecentBrainDumps(dumps.slice(0, 2));
    } catch (error) {
      setErrorMessage(error.message || "Could not load today dashboard");
    }
  }

  async function handleToggleTask(taskId) {
    setErrorMessage("");

    try {
      await toggleTask(taskId);
      await loadTodayData();
    } catch (error) {
      setErrorMessage(error.message || "Could not update task");
    }
  }

  async function handleRemoveFromToday(taskId) {
    setErrorMessage("");

    try {
      await toggleTaskToday(taskId);
      await loadTodayData();
    } catch (error) {
      setErrorMessage(error.message || "Could not remove task from today");
    }
  }

  const todayTasks = taskLists.flatMap((list) => {
    const tasks = areaTasks[list.id] || [];

    return tasks
      .filter((task) => task.is_today === 1 && task.is_done === 0)
      .map((task) => ({
        ...task,
        areaName: list.name,
      }));
  });

  const completedTodayTasks = taskLists.flatMap((list) => {
    const tasks = areaTasks[list.id] || [];
    const today = new Date().toDateString();

    return tasks
      .filter((task) => {
        if (!task.completed_at) {
          return false;
        }

        return new Date(task.completed_at).toDateString() === today;
      })
      .map((task) => ({
        ...task,
        areaName: list.name,
      }));
  });

  const areasWithOpenCounts = taskLists
    .map((list) => {
      const tasks = areaTasks[list.id] || [];
      const openCount = tasks.filter((task) => task.is_done === 0).length;

      return {
        ...list,
        openCount,
      };
    })
    .filter((area) => area.openCount > 0)
    .slice(0, 4);

  return (
    <div className="page today-page">
      <header className="today-clean-header">
        <p className="eyebrow">Today</p>
        <h2>What should I pick up?</h2>
        <p>A quiet place to decide what deserves your attention today.</p>
      </header>

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <section className="today-focus-card">
        <div className="today-focus-content">
          <p className="eyebrow">Today’s Focus</p>

          {todayTasks.length === 0 ? (
            <>
              <h3>No tasks selected for today yet</h3>
              <p>
                Go to Areas and mark a few tasks as Today. Only those selected
                tasks will appear here.
              </p>
            </>
          ) : (
            <>
              <h3>{todayTasks.length} task(s) selected for today</h3>

              <div className="today-task-list">
                {todayTasks.map((task) => (
                  <div key={task.id} className="today-task-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleTask(task.id)}
                      />
                      <span>{task.title}</span>
                    </label>

                    <div className="today-task-meta">
                      <small>{task.areaName}</small>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => handleRemoveFromToday(task.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => onNavigate("areas")}
        >
          Choose from Areas
        </button>
      </section>

      {completedTodayTasks.length > 0 && (
        <section className="mini-panel completed-today-panel">
          <div className="mini-panel-header">
            <h3>Completed today</h3>
          </div>

          <div className="compact-area-list">
            {completedTodayTasks.map((task) => (
              <div key={task.id} className="completed-task-row">
                <span>✓ {task.title}</span>
                <small>{task.areaName}</small>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="today-clean-grid">
        <section className="mini-panel">
          <div className="mini-panel-header">
            <h3>Areas needing attention</h3>
            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate("areas")}
            >
              View all
            </button>
          </div>

          {areasWithOpenCounts.length === 0 ? (
            <p className="muted-text">No open tasks right now.</p>
          ) : (
            <div className="compact-area-list">
              {areasWithOpenCounts.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  className="compact-area-row"
                  onClick={() => onNavigate("areas")}
                >
                  <span>{area.name}</span>
                  <small>{area.openCount} open</small>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mini-panel">
          <div className="mini-panel-header">
            <h3>Recent thoughts</h3>
            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate("brain-dump")}
            >
              View all
            </button>
          </div>

          {recentBrainDumps.length === 0 ? (
            <p className="muted-text">No recent brain dumps.</p>
          ) : (
            <div className="compact-dump-list">
              {recentBrainDumps.map((dump) => (
                <article key={dump.id} className="compact-dump-card">
                  <p>{dump.content}</p>
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