import { useEffect, useState } from "react";
import {
  createBrainDump,
  deleteBrainDump,
  getBrainDumps,
} from "../api/brainDumps";

function BrainDumpPage() {
  const [brainDumps, setBrainDumps] = useState([]);
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadBrainDumps();
  }, []);

  async function loadBrainDumps() {
    try {
      const data = await getBrainDumps();
      setBrainDumps(data);
    } catch (error) {
      setErrorMessage(error.message || "Could not load brain dumps");
    }
  }

  async function handleCreateBrainDump(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!content.trim()) {
      setErrorMessage("Write something before saving a brain dump");
      return;
    }

    try {
      await createBrainDump({
        content: content.trim(),
      });

      setContent("");
      await loadBrainDumps();
    } catch (error) {
      setErrorMessage(error.message || "Could not save brain dump");
    }
  }

  async function handleDeleteBrainDump(brainDumpId) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this brain dump?"
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");

    try {
      await deleteBrainDump(brainDumpId);
      await loadBrainDumps();
    } catch (error) {
      setErrorMessage(error.message || "Could not delete brain dump");
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Brain Dump</p>
          <h2>Quick Capture</h2>
          <p>
            Capture messy thoughts quickly without organizing them immediately.
          </p>
        </div>
      </header>

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <div className="brain-dump-layout">
        <section className="panel">
          <div className="panel-header">
            <h3>What’s on your mind?</h3>
            <p>
              Write freely. Later we can use AI to extract tasks, learning notes,
              or next steps.
            </p>
          </div>

          <form onSubmit={handleCreateBrainDump} className="form-stack">
            <label>
              Brain Dump
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Example: Need to buy groceries, finish sidebar UI, check OpenAI quota, and watch one video on AI agents..."
                className="brain-dump-textarea"
              />
            </label>

            <button type="submit" className="primary-button">
              Save Brain Dump
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Recent Brain Dumps</h3>
            <p>Your latest quick captures.</p>
          </div>

          {brainDumps.length === 0 ? (
            <p className="muted-text">No brain dumps yet.</p>
          ) : (
            <div className="brain-dump-list">
              {brainDumps.map((brainDump) => (
                <article key={brainDump.id} className="brain-dump-card">
                  <p>{brainDump.content}</p>

                  <div className="brain-dump-card-footer">
                    <small>
                      {brainDump.created_at
                        ? new Date(brainDump.created_at).toLocaleString()
                        : "Saved"}
                    </small>

                    <button
                      type="button"
                      className="danger-button small-button"
                      onClick={() => handleDeleteBrainDump(brainDump.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default BrainDumpPage;