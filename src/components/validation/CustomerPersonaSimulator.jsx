import React, { useState, useEffect, useRef } from 'react';
import { sendPersonaMessage } from '../../services/personaSimulator';
import './CustomerPersonaSimulator.css';

let messageCounter = 0;
function createMessageId(prefix) {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

function getCurrentTimeLabel() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function CustomerPersonaSimulator({ customerPersonas, startupOverview }) {
  const personas = customerPersonas?.personas || [];
  const [selectedPersonaId, setSelectedPersonaId] = useState(personas[0]?.id || null);
  const [activeTabByPersona, setActiveTabByPersona] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [chatPanelOpen, setChatPanelOpen] = useState(true);

  // Initialize conversations with persona greetings cleanly without effect
  const [conversationByPersona, setConversationByPersona] = useState(() => {
    const initial = {};
    (customerPersonas?.personas || []).forEach((p) => {
      initial[p.id] = [
        {
          id: `init-${p.id}`,
          sender: 'persona',
          text: p.greeting || `Hello! I am ${p.name}, working as ${p.role}. What would you like to ask me about my routine, frustrations, or pricing expectations?`,
          timestamp: 'Just now',
        },
      ];
    });
    return initial;
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const selectedPersona = personas.find((p) => p.id === selectedPersonaId) || personas[0];

  // Auto-scroll chat feed to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationByPersona, selectedPersonaId, isLoading]);

  const handleSelectPersona = (personaId) => {
    setSelectedPersonaId(personaId);
    setChatPanelOpen(true);
  };

  const handleTabChange = (personaId, tabKey) => {
    setActiveTabByPersona((prev) => ({
      ...prev,
      [personaId]: tabKey,
    }));
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading || !selectedPersona) return;

    const timeLabel = getCurrentTimeLabel();
    const userMessageObj = {
      id: createMessageId('user'),
      sender: 'user',
      text,
      timestamp: timeLabel,
    };

    const currentHistory = conversationByPersona[selectedPersona.id] || [];
    const updatedHistory = [...currentHistory, userMessageObj];

    setConversationByPersona((prev) => ({
      ...prev,
      [selectedPersona.id]: updatedHistory,
    }));

    setInputMessage('');
    setIsLoading(true);

    try {
      const result = await sendPersonaMessage({
        persona: selectedPersona,
        userMessage: text,
        history: updatedHistory,
        startupContext: startupOverview || {},
      });

      setIsDemoMode(Boolean(result.isDemo));

      const personaReplyObj = {
        id: createMessageId('persona'),
        sender: 'persona',
        text: result.reply,
        timestamp: getCurrentTimeLabel(),
        isDemo: result.isDemo,
      };

      setConversationByPersona((prev) => ({
        ...prev,
        [selectedPersona.id]: [...(prev[selectedPersona.id] || []), personaReplyObj],
      }));
    } catch {
      const fallbackReply = {
        id: createMessageId('err'),
        sender: 'persona',
        text: `As ${selectedPersona.name}, my primary daily focus is on avoiding operational waste. Could you clarify how ${startupOverview?.name || 'your solution'} integrates with our daily routine?`,
        timestamp: 'Just now',
        isDemo: true,
      };

      setConversationByPersona((prev) => ({
        ...prev,
        [selectedPersona.id]: [...(prev[selectedPersona.id] || []), fallbackReply],
      }));
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (!selectedPersona) return;
    setConversationByPersona((prev) => ({
      ...prev,
      [selectedPersona.id]: [
        {
          id: createMessageId('reset'),
          sender: 'persona',
          text: selectedPersona.greeting || `Conversation reset. Feel free to ask another validation question!`,
          timestamp: 'Just now',
        },
      ],
    }));
  };

  const currentMessages = selectedPersona ? conversationByPersona[selectedPersona.id] || [] : [];

  return (
    <div className="persona-simulator-container">
      {/* 3 Personas Showcase Cards */}
      <div className="personas-cards-grid">
        {personas.map((persona) => {
          const isSelected = selectedPersona?.id === persona.id;
          const activeTab = activeTabByPersona[persona.id] || 'goals';

          return (
            <div
              key={persona.id}
              className={`persona-card persona-card--${persona.colorTheme} ${
                isSelected ? 'persona-card--selected' : ''
              }`}
            >
              <div className="persona-card__header">
                <div className={`persona-avatar persona-avatar--${persona.colorTheme}`}>
                  {persona.avatarInitials || persona.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="persona-card__identity">
                  <div className="persona-card__name-row">
                    <h4 className="persona-card__name">{persona.name}</h4>
                    <span className="persona-badge-tag">{persona.badge}</span>
                  </div>
                  <span className="persona-card__role">{persona.role}</span>
                </div>
              </div>

              {/* 4 Vector Tabs: Goals, Pain Points, Objections, Buying Motivations */}
              <div className="persona-tabs-bar" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'goals'}
                  className={`persona-tab-btn ${activeTab === 'goals' ? 'persona-tab-btn--active' : ''}`}
                  onClick={() => handleTabChange(persona.id, 'goals')}
                >
                  🎯 Goals
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'pains'}
                  className={`persona-tab-btn ${activeTab === 'pains' ? 'persona-tab-btn--active' : ''}`}
                  onClick={() => handleTabChange(persona.id, 'pains')}
                >
                  ⚡ Pains
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'objections'}
                  className={`persona-tab-btn ${activeTab === 'objections' ? 'persona-tab-btn--active' : ''}`}
                  onClick={() => handleTabChange(persona.id, 'objections')}
                >
                  🛡️ Objections
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'motivations'}
                  className={`persona-tab-btn ${activeTab === 'motivations' ? 'persona-tab-btn--active' : ''}`}
                  onClick={() => handleTabChange(persona.id, 'motivations')}
                >
                  💡 Motivations
                </button>
              </div>

              {/* Tab Content Display */}
              <div className="persona-tab-content">
                {activeTab === 'goals' && (
                  <div className="persona-vector-box">
                    <strong className="vector-label">Core Objectives:</strong>
                    <ul className="persona-list">
                      {persona.goals?.map((goal, idx) => (
                        <li key={idx}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'pains' && (
                  <div className="persona-vector-box">
                    <strong className="vector-label">Primary Frustrations:</strong>
                    <ul className="persona-list persona-list--pains">
                      {persona.painPoints?.map((pain, idx) => (
                        <li key={idx}>{pain}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'objections' && (
                  <div className="persona-vector-box">
                    <strong className="vector-label">Buying Objections & Skepticism:</strong>
                    <ul className="persona-list persona-list--objections">
                      {persona.objections?.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'motivations' && (
                  <div className="persona-vector-box">
                    <strong className="vector-label">Purchase Triggers:</strong>
                    <ul className="persona-list persona-list--motivations">
                      {persona.buyingMotivations?.map((mot, idx) => (
                        <li key={idx}>{mot}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Willingness To Pay Footer */}
              <div className="persona-wtp-bar">
                <span className="persona-wtp-label">Willingness to Pay:</span>
                <span className="persona-wtp-value">{persona.willingnessToPay}</span>
              </div>

              {/* Interview Action Button */}
              <button
                type="button"
                className={`btn-interview-persona ${isSelected ? 'btn-interview-persona--active' : ''}`}
                onClick={() => handleSelectPersona(persona.id)}
              >
                {isSelected ? '✓ Interviewing Now' : `💬 Interview ${persona.name.split(' ')[0]} →`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Interactive AI Persona Interview Chat Panel */}
      {chatPanelOpen && selectedPersona && (
        <div className="persona-chat-panel" id="persona-chat-console">
          {/* Chat Panel Header */}
          <div className="chat-panel__header">
            <div className="chat-panel__target">
              <div className={`persona-avatar persona-avatar--sm persona-avatar--${selectedPersona.colorTheme}`}>
                {selectedPersona.avatarInitials}
              </div>
              <div>
                <div className="chat-target-name-row">
                  <h3 className="chat-target-name">Interviewing {selectedPersona.name}</h3>
                  <span className="chat-target-badge">{selectedPersona.badge}</span>
                </div>
                <p className="chat-target-role">{selectedPersona.role}</p>
              </div>
            </div>

            {/* Quick Switch Persona Tabs inside chat */}
            <div className="chat-switch-pills">
              {personas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`chat-switch-btn ${p.id === selectedPersona.id ? 'chat-switch-btn--active' : ''}`}
                  onClick={() => handleSelectPersona(p.id)}
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                className="btn-chat-action"
                onClick={handleClearChat}
                title="Restart this interview"
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Simulation Disclaimer Banner */}
          <div className="chat-disclaimer-banner">
            <span className="disclaimer-dot" />
            <p>
              <strong>AI Persona Simulation {isDemoMode ? '(Demo Mode)' : '(Live AI)'}:</strong>{' '}
              Responses are generated by structural customer archetype models to evaluate objection handling.
              This simulates customer reactions and does not represent a real human call recording.
            </p>
          </div>

          {/* Messages Feed */}
          <div className="chat-messages-viewport" role="log" aria-live="polite">
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message-row chat-message-row--${msg.sender}`}
              >
                {msg.sender === 'persona' && (
                  <div className={`persona-avatar persona-avatar--xs persona-avatar--${selectedPersona.colorTheme}`}>
                    {selectedPersona.avatarInitials}
                  </div>
                )}

                <div className="chat-bubble-wrap">
                  <div className={`chat-bubble chat-bubble--${msg.sender}`}>
                    <p className="chat-bubble-text">{msg.text}</p>
                    {msg.sender === 'persona' && (
                      <span className="chat-bubble-tag">
                        {isDemoMode ? 'Simulated Response • Demo' : 'Live AI Response'}
                      </span>
                    )}
                  </div>
                  <span className="chat-bubble-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-message-row chat-message-row--persona">
                <div className={`persona-avatar persona-avatar--xs persona-avatar--${selectedPersona.colorTheme}`}>
                  {selectedPersona.avatarInitials}
                </div>
                <div className="chat-bubble chat-bubble--persona chat-bubble--typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Discovery Questions */}
          <div className="chat-suggested-section">
            <span className="suggested-label">Suggested Discovery Questions:</span>
            <div className="suggested-chips-wrap">
              {selectedPersona.suggestedQuestions?.map((question, qIdx) => (
                <button
                  key={qIdx}
                  type="button"
                  className="suggested-chip"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(question)}
                >
                  "{question}"
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Box */}
          <form
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="chat-text-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${selectedPersona.name.split(' ')[0]} about their objections, pricing, daily routine...`}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={isLoading || !inputMessage.trim()}
              aria-label="Send Question"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CustomerPersonaSimulator;
