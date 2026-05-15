function DashboardPage() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Home</p>
          <h2>Dashboard</h2>
          <p>
            A simple overview of your learning, tasks, and quick thoughts.
          </p>
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="panel">
          <h3>Learning</h3>
          <p className="muted-text">
            Create topics, add learning inputs, and generate summaries.
          </p>
        </section>

        <section className="panel">
          <h3>Tasks</h3>
          <p className="muted-text">
            Coming soon: task lists like Groceries, Personal, and Project tasks.
          </p>
        </section>

        <section className="panel">
          <h3>Brain Dump</h3>
          <p className="muted-text">
            Coming soon: quickly capture messy thoughts and convert them into useful notes.
          </p>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;