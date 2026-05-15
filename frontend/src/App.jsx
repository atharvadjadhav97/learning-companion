import { useEffect, useState } from "react";
import { createTopic, getTopics } from "./api/topics";
import {
  createLearningInput,
  getLearningInputs,
} from "./api/learningInputs";
import {
  generateTopicSummary,
  getTopicSummary,
} from "./api/summaries";

function App() {
  const [apiMessage, setApiMessage] = useState("Checking backend...");
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [topicTitle, setTopicTitle] = useState("");
  const [topicDescription, setTopicDescription] = useState("");

  const [learningInputs, setLearningInputs] = useState([]);
  const [inputType, setInputType] = useState("quick_note");
  const [inputContent, setInputContent] = useState("");

  const [topicSummary, setTopicSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

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

  useEffect(() => {
    if (selectedTopic) {
      loadLearningInputs(selectedTopic.id);
      loadTopicSummary(selectedTopic.id);
    } else {
      setLearningInputs([]);
      setTopicSummary("");
    }
  }, [selectedTopic]);

  async function loadTopics() {
    try {
      const data = await getTopics();
      setTopics(data);
    } catch {
      setErrorMessage("Could not load topics");
    }
  }

  async function loadLearningInputs(topicId) {
    try {
      const data = await getLearningInputs(topicId);
      setLearningInputs(data);
    } catch {
      setErrorMessage("Could not load learning inputs");
    }
  }

  async function loadTopicSummary(topicId) {
    try {
      const data = await getTopicSummary(topicId);
      setTopicSummary(data.summary);
    } catch {
      setErrorMessage("Could not load topic summary");
    }
  }

  async function handleCreateTopic(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!topicTitle.trim()) {
      setErrorMessage("Topic title is required");
      return;
    }

    try {
      const newTopic = await createTopic({
        title: topicTitle.trim(),
        description: topicDescription.trim() || null,
      });

      setTopicTitle("");
      setTopicDescription("");

      await loadTopics();
      setSelectedTopic(newTopic);
    } catch {
      setErrorMessage("Could not create topic");
    }
  }

  async function handleCreateLearningInput(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!selectedTopic) {
      setErrorMessage("Select a topic first");
      return;
    }

    if (!inputContent.trim()) {
      setErrorMessage("Learning input content is required");
      return;
    }

    try {
      await createLearningInput(selectedTopic.id, {
        input_type: inputType,
        content: inputContent.trim(),
      });

      setInputContent("");
      await loadLearningInputs(selectedTopic.id);
    } catch {
      setErrorMessage("Could not create learning input");
    }
  }

  async function handleGenerateTopicSummary(forceRegenerate = false) {
    if (!selectedTopic) {
      setErrorMessage("Select a topic first");
      return;
    }

    if (topicSummary && !forceRegenerate) {
      setErrorMessage(
        "Summary already exists. Use Regenerate if you really want to call AI again."
      );
      return;
    }

    setErrorMessage("");
    setIsGeneratingSummary(true);

    try {
      const data = await generateTopicSummary(
        selectedTopic.id,
        forceRegenerate
      );
      setTopicSummary(data.summary);
    } catch {
      setErrorMessage("Could not generate topic summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Learning Companion</h1>
      <p>{apiMessage}</p>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <section style={{ marginTop: "2rem" }}>
        <h2>Create Topic</h2>

        <form onSubmit={handleCreateTopic}>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Title
              <br />
              <input
                value={topicTitle}
                onChange={(event) => setTopicTitle(event.target.value)}
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
                value={topicDescription}
                onChange={(event) =>
                  setTopicDescription(event.target.value)
                }
                placeholder="Optional short description"
                style={{
                  padding: "0.5rem",
                  width: "300px",
                  height: "80px",
                }}
              />
            </label>
          </div>

          <button type="submit">Create Topic</button>
        </form>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Topics</h2>

        {topics.length === 0 ? (
          <p>No topics yet. Create your first topic.</p>
        ) : (
          <ul>
            {topics.map((topic) => (
              <li key={topic.id} style={{ marginBottom: "1rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    setSelectedTopic(topic);
                  }}
                  style={{
                    fontWeight:
                      selectedTopic?.id === topic.id ? "bold" : "normal",
                  }}
                >
                  {topic.title}
                </button>

                {topic.description && <p>{topic.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>
          Learning Inputs{" "}
          {selectedTopic ? `for ${selectedTopic.title}` : ""}
        </h2>

        {!selectedTopic ? (
          <p>Select a topic to add learning inputs.</p>
        ) : (
          <>
            <form onSubmit={handleCreateLearningInput}>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  Input Type
                  <br />
                  <select
                    value={inputType}
                    onChange={(event) => setInputType(event.target.value)}
                    style={{ padding: "0.5rem", width: "320px" }}
                  >
                    <option value="quick_note">Quick Note</option>
                    <option value="pasted_text">Pasted Text</option>
                    <option value="youtube_url">YouTube URL</option>
                  </select>
                </label>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label>
                  Content
                  <br />
                  <textarea
                    value={inputContent}
                    onChange={(event) =>
                      setInputContent(event.target.value)
                    }
                    placeholder="Paste a thought, text, or YouTube URL"
                    style={{
                      padding: "0.5rem",
                      width: "400px",
                      height: "120px",
                    }}
                  />
                </label>
              </div>

              <button type="submit">Add Learning Input</button>
            </form>

            <div
              style={{
                marginTop: "2rem",
                marginBottom: "2rem",
                border: "1px solid #ddd",
                padding: "1rem",
              }}
            >
              <h3>Topic Summary</h3>

              <button
                type="button"
                onClick={() => handleGenerateTopicSummary(false)}
                disabled={isGeneratingSummary || Boolean(topicSummary)}
              >
                {isGeneratingSummary
                  ? "Generating..."
                  : "Generate Topic Summary"}
              </button>

              {topicSummary && (
                <button
                  type="button"
                  onClick={() => {
                    const shouldRegenerate = window.confirm(
                      "This will call the AI provider again and may cost money. Continue?"
                    );

                    if (shouldRegenerate) {
                      handleGenerateTopicSummary(true);
                    }
                  }}
                  disabled={isGeneratingSummary}
                  style={{ marginLeft: "0.5rem" }}
                >
                  Regenerate Summary
                </button>
              )}

              {topicSummary ? (
                <p style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>
                  {topicSummary}
                </p>
              ) : (
                <p style={{ marginTop: "1rem" }}>
                  No summary yet. Add learning inputs and generate one.
                </p>
              )}
            </div>

            <h3 style={{ marginTop: "2rem" }}>Saved Inputs</h3>

            {learningInputs.length === 0 ? (
              <p>No learning inputs yet for this topic.</p>
            ) : (
              <ul>
                {learningInputs.map((learningInput) => (
                  <li
                    key={learningInput.id}
                    style={{
                      marginBottom: "1rem",
                      border: "1px solid #ddd",
                      padding: "1rem",
                    }}
                  >
                    <strong>{learningInput.input_type}</strong>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {learningInput.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default App;