import { useEffect, useState } from "react";
import { createTopic, getTopics } from "../api/topics";
import {
  createLearningInput,
  getLearningInputs,
} from "../api/learningInputs";
import {
  generateTopicSummary,
  getTopicSummary,
} from "../api/summaries";

function LearningPage() {
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
    } catch (error) {
      setErrorMessage(error.message || "Could not generate topic summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Learning</p>
          <h2>Learning Topics</h2>
          <p>
            Capture what you learn, add quick inputs, and generate simple summaries.
          </p>
        </div>
      </header>

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <div className="learning-layout">
        <section className="panel topics-panel">
          <div className="panel-header">
            <h3>Create Topic</h3>
            <p>Add a topic you are learning or researching.</p>
          </div>

          <form onSubmit={handleCreateTopic} className="form-stack">
            <label>
              Title
              <input
                value={topicTitle}
                onChange={(event) => setTopicTitle(event.target.value)}
                placeholder="Example: RAG"
              />
            </label>

            <label>
              Description
              <textarea
                value={topicDescription}
                onChange={(event) =>
                  setTopicDescription(event.target.value)
                }
                placeholder="Optional short description"
              />
            </label>

            <button type="submit" className="primary-button">
              Create Topic
            </button>
          </form>

          <div className="topic-list-section">
            <h3>Topics</h3>

            {topics.length === 0 ? (
              <p className="muted-text">No topics yet. Create your first topic.</p>
            ) : (
              <div className="topic-list">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setSelectedTopic(topic);
                    }}
                    className={
                      selectedTopic?.id === topic.id
                        ? "topic-card selected"
                        : "topic-card"
                    }
                  >
                    <strong>{topic.title}</strong>
                    {topic.description && <span>{topic.description}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="panel detail-panel">
          {!selectedTopic ? (
            <div className="empty-state">
              <h3>Select a topic</h3>
              <p>
                Choose a topic from the left to add learning inputs and generate a summary.
              </p>
            </div>
          ) : (
            <>
              <div className="panel-header">
                <p className="eyebrow">Selected Topic</p>
                <h3>{selectedTopic.title}</h3>
                {selectedTopic.description && (
                  <p>{selectedTopic.description}</p>
                )}
              </div>

              <form onSubmit={handleCreateLearningInput} className="form-stack">
                <label>
                  Input Type
                  <select
                    value={inputType}
                    onChange={(event) => setInputType(event.target.value)}
                  >
                    <option value="quick_note">Quick Note</option>
                    <option value="pasted_text">Pasted Text</option>
                    <option value="youtube_url">YouTube URL</option>
                  </select>
                </label>

                <label>
                  Content
                  <textarea
                    value={inputContent}
                    onChange={(event) =>
                      setInputContent(event.target.value)
                    }
                    placeholder="Paste a thought, text, or YouTube URL"
                    className="large-textarea"
                  />
                </label>

                <button type="submit" className="primary-button">
                  Add Learning Input
                </button>
              </form>

              <div className="summary-card">
                <div className="summary-header">
                  <div>
                    <h3>Topic Summary</h3>
                    <p>
                      Generate once, then regenerate only when you intentionally want a new AI call.
                    </p>
                  </div>
                </div>

                <div className="button-row">
                  <button
                    type="button"
                    onClick={() => handleGenerateTopicSummary(false)}
                    disabled={isGeneratingSummary || Boolean(topicSummary)}
                    className="primary-button"
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
                      className="secondary-button"
                    >
                      Regenerate Summary
                    </button>
                  )}
                </div>

                {topicSummary ? (
                  <div className="summary-text">{topicSummary}</div>
                ) : (
                  <p className="muted-text">
                    No summary yet. Add learning inputs and generate one.
                  </p>
                )}
              </div>

              <div className="saved-inputs">
                <h3>Saved Inputs</h3>

                {learningInputs.length === 0 ? (
                  <p className="muted-text">
                    No learning inputs yet for this topic.
                  </p>
                ) : (
                  <div className="input-list">
                    {learningInputs.map((learningInput) => (
                      <article
                        key={learningInput.id}
                        className="input-card"
                      >
                        <div className="input-type">
                          {learningInput.input_type}
                        </div>
                        <p>{learningInput.content}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default LearningPage;