import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import LearningPage from "./pages/LearningPage";
import TasksPage from "./pages/TasksPage";
import BrainDumpPage from "./pages/BrainDumpPage";
import SettingsPage from "./pages/SettingsPage";
import "./App.css";

function App() {
  const [activeSection, setActiveSection] = useState("learning");
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
    if (activeSection === "dashboard") {
      return <DashboardPage />;
    }

    if (activeSection === "learning") {
      return <LearningPage />;
    }

    if (activeSection === "tasks") {
      return <TasksPage />;
    }

    if (activeSection === "brain-dump") {
      return <BrainDumpPage />;
    }

    if (activeSection === "settings") {
      return <SettingsPage apiMessage={apiMessage} />;
    }

    return <LearningPage />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="main-content">
        {renderActiveSection()}
      </main>
    </div>
  );
}

export default App;