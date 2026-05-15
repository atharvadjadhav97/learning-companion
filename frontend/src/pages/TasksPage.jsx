function TasksPage() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Tasks</p>
          <h2>Task Lists</h2>
          <p>
            Soon this will help you organize tasks by lists like Groceries, Personal, Learning Companion, and Tomorrow.
          </p>
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="panel">
          <h3>Groceries</h3>
          <p className="muted-text">Example list for grocery items you need to buy.</p>
        </section>

        <section className="panel">
          <h3>Learning Companion Project</h3>
          <p className="muted-text">Example list for this app’s development tasks.</p>
        </section>

        <section className="panel">
          <h3>Personal</h3>
          <p className="muted-text">Example list for personal admin and life tasks.</p>
        </section>

        <section className="panel">
          <h3>Tomorrow</h3>
          <p className="muted-text">Example list for things you want to take up next day.</p>
        </section>
      </div>
    </div>
  );
}

export default TasksPage;