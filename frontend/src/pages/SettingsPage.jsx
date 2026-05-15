function SettingsPage({ apiMessage }) {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h2>App Settings</h2>
          <p>Basic app status and configuration reminders.</p>
        </div>
      </header>

      <section className="panel">
        <h3>Backend Status</h3>
        <p className="muted-text">{apiMessage}</p>
      </section>

      <section className="panel">
        <h3>AI Cost Reminder</h3>
        <p className="muted-text">
          Keep AI_PROVIDER=mock in backend/.env when you do not want to make paid API calls.
        </p>
      </section>
    </div>
  );
}

export default SettingsPage;