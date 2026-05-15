const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Overview",
  },
  {
    id: "learning",
    label: "Learning",
    description: "Topics and summaries",
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "To-dos and lists",
  },
  {
    id: "brain-dump",
    label: "Brain Dump",
    description: "Quick thoughts",
  },
  {
    id: "settings",
    label: "Settings",
    description: "App status",
  },
];

function Sidebar({ activeSection, onSectionChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="app-logo">AI</div>
        <div>
          <h1>Personal AI</h1>
          <p>Workspace</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              activeSection === item.id
                ? "sidebar-nav-item active"
                : "sidebar-nav-item"
            }
            onClick={() => onSectionChange(item.id)}
          >
            <span>{item.label}</span>
            <small>{item.description}</small>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;