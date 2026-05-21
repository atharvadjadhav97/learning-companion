const navItems = [
  {
    id: "today",
    label: "Today",
    description: "What to pick up",
  },
  {
    id: "areas",
    label: "Areas",
    description: "Tasks by area",
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

function Sidebar({
  activeSection,
  onSectionChange,
  isSidebarOpen,
  onToggleSidebar,
}) {
  if (!isSidebarOpen) {
    return null;
  }

  return (
    <aside className="sidebar">
      <button
        type="button"
        className="sidebar-toggle"
        onClick={onToggleSidebar}
      >
        ☰
      </button>

      <div className="sidebar-header">
        <div className="app-logo">PC</div>
        <div>
          <h1>Personal Command</h1>
          <p>Center</p>
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