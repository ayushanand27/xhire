import { useState, useEffect, useRef } from "react";
import { codeAPI } from "../api/rooms.js";
import "./SharedCodeEditor.css";

export default function SharedCodeEditor({ roomId, socket, canExecute = false }) {
  const [code, setCode] = useState("// Welcome to collaborative coding!\n");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(14);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on("code-updated", (newCode) => {
        setCode(newCode);
      });

      socket.on("code-executed", (result) => {
        if (result.success) {
          setOutput(result.output);
        } else {
          setError(result.error);
        }
      });

      return () => {
        socket.off("code-updated");
        socket.off("code-executed");
      };
    }
  }, [socket]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

    // Broadcast to other users
    if (socket) {
      socket.emit("code-updated", newCode);
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleExecuteCode = async () => {
    if (!canExecute) {
      setError("You don't have permission to execute code");
      return;
    }

    try {
      setIsExecuting(true);
      setError(null);
      setOutput("");

      const response = await codeAPI.executeCode(roomId, code, language);

      if (response.data.success) {
        setOutput(response.data.output);
      } else {
        setError(response.data.error);
      }

      // Broadcast execution event
      if (socket) {
        socket.emit("execute-code", {
          language,
          success: response.data.success,
          output: response.data.output,
          error: response.data.error,
        });
      }
    } catch (err) {
      setError("Failed to execute code: " + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClearOutput = () => {
    setOutput("");
    setError(null);
  };

  const handleClearCode = () => {
    if (window.confirm("Clear all code?")) {
      setCode("");
      if (socket) {
        socket.emit("code-updated", "");
      }
    }
  };

  // Auto-indent when pressing Tab
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + "\t" + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  return (
    <div className="code-editor-container">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="language-select"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="ruby">Ruby</option>
          </select>
        </div>

        <div className="toolbar-right">
          <div className="font-size-control">
            <button
              className="font-btn"
              onClick={() => setFontSize(Math.max(10, fontSize - 2))}
              title="Decrease font size"
            >
              −
            </button>
            <span className="font-size-display">{fontSize}px</span>
            <button
              className="font-btn"
              onClick={() => setFontSize(Math.min(32, fontSize + 2))}
              title="Increase font size"
            >
              +
            </button>
          </div>

          <button
            className="btn-icon"
            onClick={handleClearCode}
            title="Clear code"
          >
            🗑️
          </button>

          <button
            className={`btn-execute ${!canExecute ? "disabled" : ""}`}
            onClick={handleExecuteCode}
            disabled={isExecuting || !canExecute}
            title={canExecute ? "Run code (Ctrl+Enter)" : "No permission to execute"}
          >
            {isExecuting ? "▶️ Running..." : "▶️ Execute"}
          </button>
        </div>
      </div>

      {/* Editor and Output */}
      <div className="editor-content">
        {/* Code Editor */}
        <div className="editor-panel">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            className="code-textarea"
            style={{ fontSize: `${fontSize}px` }}
            placeholder="Write code here..."
            spellCheck="false"
          />
        </div>

        {/* Output Panel */}
        <div className="output-panel">
          <div className="output-header">
            <h4>Output</h4>
            {(output || error) && (
              <button
                className="clear-output-btn"
                onClick={handleClearOutput}
                title="Clear output"
              >
                ✕
              </button>
            )}
          </div>

          <div className={`output-content ${error ? "error" : "success"}`}>
            {error ? (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            ) : output ? (
              <pre className="output-text">{output}</pre>
            ) : (
              <div className="empty-output">
                <span>Output will appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
