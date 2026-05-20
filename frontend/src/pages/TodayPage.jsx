import { useEffect, useState } from "react";
import { getBrainDumps } from "../api/brainDumps";
import { getTaskLists, getTasks } from "../api/tasks";

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
        <p>
          A quiet place to decide what deserves your attention today.
        </p>
      </header>

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <section className="today-focus-card">
        <div className="today-focus-content">
          <p className="eyebrow">Today’s Focus</p>
          <h3>No tasks selected for today yet</h3>
          <p>
            Next, we’ll add a “Mark as Today” option inside Areas. This page
            will only show tasks you intentionally choose for today.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => onNavigate("areas")}
        >
          Choose from Areas
        </button>
      </section>

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