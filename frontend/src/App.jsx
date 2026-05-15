import { useEffect, useState } from "react";
import { createTopic, getTopics } from "./api/topics";

function App() {
  const [apiMessage, setApiMessage] = useState("Checking backend...");
  const [topics, setTopics] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then((response) => response.json())
      .then((data) => {
        setApiMessage(data.message);
      })
      .catch(() => {
        setApiMessage("Could not connect to backend");
      });

    loadTopics();
  }, []);

  async function loadTopics() {
    try {
      const data = await getTopics();
      setTopics(data);
    } catch {
      setErrorMessage("Could not load topics");
    }
  }

  async function handleCreateTopic(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Topic title is required");
      return;
    }

    try {
      await createTopic({
        title: title.trim(),
        description: description.trim() || null,
      });

      setTitle("");
      setDescription("");
      await loadTopics();
    } catch {
      setErrorMessage("Could not create topic");
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Learning Companion</h1>
      <p>{apiMessage}</p>

      <section style={{ marginTop: "2rem" }}>
        <h2>Create Topic</h2>

        <form onSubmit={handleCreateTopic}>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Title
              <br />
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: RAG"
                style={{ padding: "0.5rem", width: "300px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>
              Description
              <br />
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional short description"
                style={{ padding: "0.5rem", width: "300px", height: "80px" }}
              />
            </label>
          </div>

          <button type="submit">Create Topic</button>
        </form>

        {errorMessage && (
          <p style={{ color: "red" }}>{errorMessage}</p>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Topics</h2>

        {topics.length === 0 ? (
          <p>No topics yet. Create your first topic.</p>
        ) : (
          <ul>
            {topics.map((topic) => (
              <li key={topic.id} style={{ marginBottom: "1rem" }}>
                <strong>{topic.title}</strong>
                {topic.description && <p>{topic.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;