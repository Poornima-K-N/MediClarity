import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  MessageSquare,
  Send,
  Loader2,
  Quote,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

export const AskYourReport = () => {
  const {
    chatMessages,
    askQuestion,
    isAskingQuestion,
    extractionResult,
    clearChat,
  } = useAppState();

  const [inputQuestion, setInputQuestion] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAskingQuestion]);

  if (!extractionResult) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isAskingQuestion) return;
    const q = inputQuestion.trim();
    setInputQuestion('');
    askQuestion(q);
  };

  const handleSuggestionClick = (suggestedText) => {
    if (isAskingQuestion) return;
    askQuestion(suggestedText);
  };

  const suggestions = [
    'Are any of my test values marked high or low?',
    'What medications or directions are listed?',
    'What does this report conclude?',
    'What is my hemoglobin or blood count?'
  ];

  return (
    <section className="structured-dashboard-card ask-report-card" aria-label="Ask Your Report Q&A">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-ai-pulse">
              <MessageSquare size={13} />
              <span>Module 5 • Ask Your Report</span>
            </span>
          </div>
          <h3 className="structured-main-title">
            Ask Questions About This Report
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Get instant answers strictly grounded in your uploaded document text.
          </p>
        </div>

        <button
          onClick={clearChat}
          className="btn-ghost"
          style={{ fontSize: '0.8rem', padding: '6px 10px', minHeight: '34px' }}
          title="Reset chat conversation"
        >
          <RotateCcw size={14} />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="qa-suggestions-bar">
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
          Suggested:
        </span>
        <div className="qa-chips-wrapper">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isAskingQuestion}
              onClick={() => handleSuggestionClick(s)}
              className="qa-chip"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Message Thread */}
      <div className="chat-thread-container">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble-row ${msg.sender === 'user' ? 'row-user' : 'row-assistant'}`}
          >
            <div className={`chat-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-assistant'} ${msg.isError ? 'bubble-error' : ''}`}>
              <div className="bubble-text">{msg.text}</div>

              {/* Quoted Document Evidence */}
              {msg.evidence && (
                <div className="bubble-evidence-quote">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px', fontWeight: '600', fontSize: '0.725rem' }}>
                    <Quote size={12} />
                    <span>Report Evidence:</span>
                  </div>
                  <em>"{msg.evidence}"</em>
                </div>
              )}

              <div className="bubble-timestamp">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {isAskingQuestion && (
          <div className="chat-bubble-row row-assistant">
            <div className="chat-bubble bubble-assistant" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} className="spinner-icon" />
              <span style={{ fontSize: '0.85rem' }}>Reviewing your report text...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="chat-input-bar">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Ask a question about this report (e.g., 'What is my platelet count?')"
          disabled={isAskingQuestion}
          className="chat-input-field"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isAskingQuestion}
          className="btn-primary"
          style={{ minHeight: '44px', padding: '0 18px', flexShrink: 0 }}
          aria-label="Send question"
        >
          {isAskingQuestion ? <Loader2 size={18} className="spinner-icon" /> : <Send size={18} />}
        </button>
      </form>

      {/* Safety Grounding Footer */}
      <div className="qa-safety-footer">
        <ShieldAlert size={15} style={{ color: '#D97706', flexShrink: 0 }} />
        <span>
          Answers are strictly limited to facts in your document. MediClarity AI never invents unlisted values and cannot diagnose or prescribe treatments.
        </span>
      </div>
    </section>
  );
};
