import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Minimize2, Maximize2, ChevronRight } from 'lucide-react';
import './App.css';

// Knowledge base for Data Engineering responses
const KNOWLEDGE_BASE = {
  pipelines: {
    keywords: ['pipeline', 'data pipeline', 'build pipeline'],
    response: "Data pipelines are the backbone of modern data infrastructure. They automate the flow of data from sources to destinations. Key considerations:\n\n• **Orchestration**: Use tools like Apache Airflow, Prefect, or Dagster for scheduling and monitoring\n• **Scalability**: Design for growth - start with batch, evolve to micro-batch or streaming\n• **Idempotency**: Ensure pipeline runs can be safely retried\n• **Monitoring**: Track data quality, latency, and throughput\n\nWhat's your primary use case - analytics, ML, or real-time processing?",
    quickReplies: ['Analytics pipelines', 'ML pipelines', 'Real-time processing', 'Talk to expert']
  },
  etl: {
    keywords: ['etl', 'elt', 'transform', 'extract', 'load'],
    response: "ETL vs ELT - a fundamental architectural choice:\n\n**ETL (Extract-Transform-Load)**\n• Transform data before loading into warehouse\n• Better for complex transformations\n• Tools: Talend, Informatica, Apache NiFi\n\n**ELT (Extract-Load-Transform)**\n• Load raw data first, transform in warehouse\n• Leverages modern warehouse compute (Snowflake, BigQuery)\n• More flexible for ad-hoc analysis\n• Tools: dbt, Fivetran, Stitch\n\nModern architectures often blend both approaches. What's driving your transformation needs?",
    quickReplies: ['ETL tools', 'ELT best practices', 'Cloud warehouses', 'dbt guide']
  },
  streaming: {
    keywords: ['streaming', 'real-time', 'kafka', 'kinesis', 'real time', 'batch'],
    response: "Streaming data processing enables real-time insights and actions:\n\n**Key Technologies**\n• **Apache Kafka**: Industry standard for event streaming\n• **Apache Flink**: Stateful stream processing at scale\n• **Apache Spark Streaming**: Micro-batch processing\n• **AWS Kinesis**: Managed streaming on AWS\n\n**Use Cases**\n• Real-time analytics dashboards\n• Fraud detection\n• IoT sensor processing\n• Change Data Capture (CDC)\n\n**vs Batch**: Streaming for latency-sensitive workloads (<15min), batch for high-volume, cost-effective processing\n\nWhat's your target latency requirement?",
    quickReplies: ['Kafka setup', 'Batch vs streaming', 'CDC patterns', 'Architecture review']
  },
  cloud: {
    keywords: ['aws', 'gcp', 'azure', 'cloud', 'migration', 's3', 'redshift', 'snowflake', 'bigquery'],
    response: "Cloud data platforms - choose based on your ecosystem:\n\n**AWS Data Stack**\n• Storage: S3 (data lake)\n• Warehouse: Redshift\n• Processing: EMR (Spark), Glue (ETL)\n• Streaming: Kinesis, MSK (Kafka)\n\n**GCP Data Stack**\n• Storage: GCS\n• Warehouse: BigQuery (serverless, columnar)\n• Processing: Dataflow (Apache Beam), Dataproc (Spark)\n• Streaming: Pub/Sub, Dataflow\n\n**Azure Data Stack**\n• Storage: ADLS Gen2\n• Warehouse: Synapse Analytics\n• Processing: Databricks, HDInsight\n• Streaming: Event Hubs\n\n**Cloud-Native Warehouses**: Snowflake (multi-cloud), Databricks (unified analytics)\n\nWhat's your current infrastructure?",
    quickReplies: ['AWS migration', 'Multi-cloud strategy', 'Cost optimization', 'Expert consultation']
  },
  sql: {
    keywords: ['sql', 'query', 'database', 'optimization', 'optimize'],
    response: "SQL optimization - the foundation of fast analytics:\n\n**Query Optimization**\n• Use EXPLAIN/EXPLAIN ANALYZE to understand plans\n• Filter early (WHERE before JOIN)\n• Index strategically (balance read vs write)\n• Avoid SELECT * in production\n• Use CTEs for readability, subqueries for performance\n\n**Advanced Techniques**\n• Window functions for analytics\n• Partitioning for time-series data\n• Materialized views for repeated aggregations\n• Query result caching\n\n**Modern SQL Features**\n• JSON/array functions (semi-structured data)\n• Approximate aggregations (HyperLogLog)\n• User-defined functions (UDFs)\n\nWhat database engine are you optimizing for?",
    quickReplies: ['PostgreSQL tips', 'Snowflake SQL', 'Query debugging', 'Performance audit']
  },
  airflow: {
    keywords: ['airflow', 'orchestration', 'workflow', 'scheduler'],
    response: "Apache Airflow - the de facto orchestration standard:\n\n**Why Airflow?**\n• DAG-based workflow definition (Python)\n• Rich operator ecosystem (AWS, GCP, Snowflake...)\n• Strong monitoring & alerting\n• Dynamic pipeline generation\n• Active community & support\n\n**Architecture**\n• Scheduler: Triggers tasks based on schedule/dependencies\n• Executor: Runs tasks (Local, Celery, Kubernetes)\n• Metadata DB: Stores state (Postgres recommended)\n• Web UI: Monitor & troubleshoot\n\n**Alternatives**: Prefect (modern Python), Dagster (data-aware), Temporal (workflow engine)\n\nNeed help setting up Airflow or migrating to Astronomer?",
    quickReplies: ['Airflow setup', 'Best practices', 'Alternatives', 'Migration help']
  }
};

const CONVERSATION_STATES = {
  GREETING: 'greeting',
  COLLECTING_INFO: 'collecting_info',
  DISCUSSING_USECASE: 'discussing_usecase',
  ANSWERING: 'answering'
};

function DataEngineeringChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', company: '', role: '', useCase: '' });
  const [conversationState, setConversationState] = useState(CONVERSATION_STATES.GREETING);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          "👋 Hey there! I'm your Data Engineering Assistant.\n\nI can help you with pipelines, ETL/ELT, streaming architectures, cloud platforms, and data tooling. First, let me get to know you a bit.",
          ['Get started', 'Browse topics', 'Talk to expert']
        );
      }, 500);
    }
  }, [isOpen]);

  const simulateTyping = async (duration = 1000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsTyping(false);
  };

  const addBotMessage = (text, quickReplies = null) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'bot',
      text,
      quickReplies,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text,
      timestamp: new Date()
    }]);
  };

  const findKnowledgeMatch = (input) => {
    const lowerInput = input.toLowerCase();
    for (const [key, value] of Object.entries(KNOWLEDGE_BASE)) {
      if (value.keywords.some(keyword => lowerInput.includes(keyword))) {
        return value;
      }
    }
    return null;
  };

  const handleConversationFlow = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    const knowledgeMatch = findKnowledgeMatch(userMessage);
    
    if (knowledgeMatch) {
      await simulateTyping(1200);
      addBotMessage(knowledgeMatch.response, knowledgeMatch.quickReplies);
      return;
    }

    switch (conversationState) {
      case CONVERSATION_STATES.GREETING:
        if (lowerMessage.includes('get started') || lowerMessage.includes('begin') || lowerMessage.includes('yes')) {
          setConversationState(CONVERSATION_STATES.COLLECTING_INFO);
          await simulateTyping(800);
          addBotMessage("Great! Let's start with your name. What should I call you?");
        } else if (lowerMessage.includes('browse') || lowerMessage.includes('topics')) {
          await simulateTyping(800);
          addBotMessage(
            "Here are some areas I can help with:",
            ['Data pipelines', 'Streaming vs batch', 'Cloud platforms', 'ETL/ELT', 'SQL optimization']
          );
        } else if (lowerMessage.includes('expert') || lowerMessage.includes('talk')) {
          await simulateTyping(800);
          addBotMessage(
            "Perfect! I'll connect you with our data engineering team. They'll reach out within 24 hours.\n\nBefore I do, could you share:\n• Your email\n• Company name\n• Brief description of your challenge"
          );
        } else {
          await simulateTyping(600);
          addBotMessage(
            "I can help you with data engineering questions or connect you with our team. What would you like to do?",
            ['Ask a question', 'Talk to expert']
          );
        }
        break;

      case CONVERSATION_STATES.COLLECTING_INFO:
        if (!userInfo.name) {
          setUserInfo(prev => ({ ...prev, name: userMessage }));
          await simulateTyping(800);
          addBotMessage(`Nice to meet you, ${userMessage}! What company are you with?`);
        } else if (!userInfo.company) {
          setUserInfo(prev => ({ ...prev, company: userMessage }));
          await simulateTyping(800);
          addBotMessage("And what's your role there?");
        } else if (!userInfo.role) {
          setUserInfo(prev => ({ ...prev, role: userMessage }));
          setConversationState(CONVERSATION_STATES.DISCUSSING_USECASE);
          await simulateTyping(1000);
          addBotMessage(
            `Perfect! So you're a ${userMessage} at ${userInfo.company}.\n\nWhat brings you here today? What's your main data engineering challenge or use case?`,
            ['Build pipelines', 'Real-time processing', 'Cloud migration', 'Data warehouse', 'Team is struggling']
          );
        }
        break;

      case CONVERSATION_STATES.DISCUSSING_USECASE:
        setUserInfo(prev => ({ ...prev, useCase: userMessage }));
        setConversationState(CONVERSATION_STATES.ANSWERING);
        
        if (lowerMessage.includes('pipeline') || lowerMessage.includes('build')) {
          await simulateTyping(1200);
          addBotMessage(
            `Great question, ${userInfo.name}! Building data pipelines at ${userInfo.company} - let me help.\n\n` + KNOWLEDGE_BASE.pipelines.response,
            KNOWLEDGE_BASE.pipelines.quickReplies
          );
        } else if (lowerMessage.includes('real-time') || lowerMessage.includes('streaming')) {
          await simulateTyping(1200);
          addBotMessage(
            `Real-time processing for ${userInfo.company} - exciting! Here's what you need to know:\n\n` + KNOWLEDGE_BASE.streaming.response,
            KNOWLEDGE_BASE.streaming.quickReplies
          );
        } else if (lowerMessage.includes('cloud') || lowerMessage.includes('migration')) {
          await simulateTyping(1200);
          addBotMessage(
            `Cloud migration is a big step for ${userInfo.company}. Let's explore your options:\n\n` + KNOWLEDGE_BASE.cloud.response,
            KNOWLEDGE_BASE.cloud.quickReplies
          );
        } else {
          await simulateTyping(1000);
          addBotMessage(
            `Thanks for sharing, ${userInfo.name}! I can help you with various aspects of data engineering. What would you like to explore?`,
            ['Data pipelines', 'Streaming solutions', 'Cloud platforms', 'Architecture review']
          );
        }
        break;

      case CONVERSATION_STATES.ANSWERING:
        await simulateTyping(1000);
        addBotMessage(
          "That's a great question! Let me connect you with the right resources or one of our data engineers who can provide detailed guidance.\n\nIn the meantime, you might find these topics helpful:",
          ['Pipeline design', 'Streaming architectures', 'Tool comparison', 'Schedule consultation']
        );
        break;

      default:
        break;
    }
  };

  const handleQuickReply = (reply) => {
  addUserMessage(reply);
  handleConversationFlow(reply);
};


  const handleSend = () => {
  if (!inputValue.trim()) return;

  const userMessage = inputValue;

  addUserMessage(userMessage);
  setInputValue('');

  handleConversationFlow(userMessage);
};



  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="App">
      {/* Demo Landing Page */}
      <div className="landing-page">
        <div className="hero">
          <div className="logo">DE</div>
          <h1>Modern Data Engineering<br/><span className="gradient-text">Platform</span></h1>
          <p className="subtitle">Build scalable data pipelines, streaming architectures, and cloud-native warehouses with our expert team and cutting-edge tools.</p>
          
          <div className="cta-section">
            <div className="cta-box">
              <p className="cta-text">💬 Click the chat button in the bottom-right to get started!</p>
            </div>
          </div>

          <div className="features">
            <h2>Try asking about:</h2>
            <ul>
              <li>📊 "Tell me about data pipelines"</li>
              <li>⚡ "What's the difference between streaming and batch?"</li>
              <li>☁️ "Should I use AWS or GCP?"</li>
              <li>🔧 "How do I optimize SQL queries?"</li>
              <li>🚀 "Explain Apache Kafka"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chatbot Widget */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-button"
          aria-label="Open Data Engineering Assistant"
        >
          <MessageSquare size={28} />
          <span className="pulse-dot"></span>
        </button>
      )}

      {isOpen && (
        <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
          <div className="chat-header">
            <div className="header-content">
              <div className="bot-avatar">DE</div>
              <div className="bot-info">
                <h3>Data Engineering Assistant</h3>
                <div className="status">
                  <span className="status-dot"></span>
                  <span className="status-text">Online • Avg response: 30s</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button onClick={() => setIsMinimized(!isMinimized)} className="icon-button">
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="icon-button">
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="messages-container">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.type}`}>
                    <div className="message-wrapper">
                      {message.type === 'bot' && (
                        <div className="message-meta">
                          <div className="mini-avatar">DE</div>
                          <span className="timestamp">{formatTime(message.timestamp)}</span>
                        </div>
                      )}
                      
                      <div className="message-bubble">
                        <div className="message-text">{message.text}</div>
                        
                        {message.quickReplies && (
                          <div className="quick-replies">
                            {message.quickReplies.map((reply, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleQuickReply(reply)}
                                className="quick-reply-button"
                              >
                                <span>{reply}</span>
                                <ChevronRight size={12} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {message.type === 'user' && (
                        <div className="message-meta user-meta">
                          <span className="timestamp">{formatTime(message.timestamp)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="message bot">
                    <div className="message-wrapper">
                      <div className="message-meta">
                        <div className="mini-avatar">DE</div>
                      </div>
                      <div className="message-bubble">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="input-area">
                <div className="input-wrapper">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about pipelines, streaming, ETL, tools..."
                    className="message-input"
                    rows="1"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="send-button"
                    aria-label="Send message"
                  >
                    <Send size={20} />
                  </button>
                </div>
                <div className="input-footer">
                  Powered by Data Engineering Platform • <span className="ai-badge">AI-assisted</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default DataEngineeringChatbot;