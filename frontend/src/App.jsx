import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import TodayPage from "./pages/TodayPage";
import TasksPage from "./pages/TasksPage";
import BrainDumpPage from "./pages/BrainDumpPage";
import SettingsPage from "./pages/SettingsPage";
import "./App.css";

function App() {
  const [activeSection, setActiveSection] = useState("today");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [apiMessage, setApiMessage] = useState("Checking backend...");

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then((response) => response.json())
      .then((data) => {
        setApiMessage(data.message);
      })
      .catch(() => {
        setApiMessage("Could not connect to backend");
      });
  }, []);

  function renderActiveSection() {
    if (activeSection === "today") {
      return <TodayPage onNavigate={setActiveSection} />;
    }

    if (activeSection === "areas") {
      return <TasksPage />;
    }

    if (activeSection === "brain-dump") {
      return <BrainDumpPage />;
    }

    if (activeSection === "settings") {
      return <SettingsPage apiMessage={apiMessage} />;
    }

    return <TodayPage onNavigate={setActiveSection} />;
  }

  return (
    <div className={isSidebarOpen ? "app-shell" : "app-shell sidebar-closed"}>
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
      />

      <main className="main-content">
        {!isSidebarOpen && (
          <button
            type="button"
            className="floating-menu-button"
            onClick={() => setIsSidebarOpen(true)}
          >
            ☰
          </button>
        )}

        {renderActiveSection()}
      </main>
    </div>
  );
}

export default App;