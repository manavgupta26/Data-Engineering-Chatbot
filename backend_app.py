"""
Data Engineering Chatbot - Flask Backend (Optional)
A simple REST API to handle chatbot interactions with mock responses
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import random

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Knowledge base - same structure as frontend
KNOWLEDGE_BASE = {
    "pipelines": {
        "keywords": ["pipeline", "data pipeline", "build pipeline"],
        "response": "Data pipelines are the backbone of modern data infrastructure. They automate the flow of data from sources to destinations. Key considerations:\n\n• **Orchestration**: Use tools like Apache Airflow, Prefect, or Dagster for scheduling and monitoring\n• **Scalability**: Design for growth - start with batch, evolve to micro-batch or streaming\n• **Idempotency**: Ensure pipeline runs can be safely retried\n• **Monitoring**: Track data quality, latency, and throughput\n\nWhat's your primary use case - analytics, ML, or real-time processing?",
        "quick_replies": ["Analytics pipelines", "ML pipelines", "Real-time processing", "Talk to expert"]
    },
    "etl": {
        "keywords": ["etl", "elt", "transform", "extract", "load"],
        "response": "ETL vs ELT - a fundamental architectural choice:\n\n**ETL (Extract-Transform-Load)**\n• Transform data before loading into warehouse\n• Better for complex transformations\n• Tools: Talend, Informatica, Apache NiFi\n\n**ELT (Extract-Load-Transform)**\n• Load raw data first, transform in warehouse\n• Leverages modern warehouse compute (Snowflake, BigQuery)\n• More flexible for ad-hoc analysis\n• Tools: dbt, Fivetran, Stitch\n\nModern architectures often blend both approaches. What's driving your transformation needs?",
        "quick_replies": ["ETL tools", "ELT best practices", "Cloud warehouses", "dbt guide"]
    },
    "streaming": {
        "keywords": ["streaming", "real-time", "kafka", "kinesis", "real time"],
        "response": "Streaming data processing enables real-time insights and actions:\n\n**Key Technologies**\n• **Apache Kafka**: Industry standard for event streaming\n• **Apache Flink**: Stateful stream processing at scale\n• **Apache Spark Streaming**: Micro-batch processing\n• **AWS Kinesis**: Managed streaming on AWS\n\n**Use Cases**\n• Real-time analytics dashboards\n• Fraud detection\n• IoT sensor processing\n• Change Data Capture (CDC)\n\n**vs Batch**: Streaming for latency-sensitive workloads (<15min), batch for high-volume, cost-effective processing\n\nWhat's your target latency requirement?",
        "quick_replies": ["Kafka setup", "Batch vs streaming", "CDC patterns", "Architecture review"]
    },
    "cloud": {
        "keywords": ["aws", "gcp", "azure", "cloud", "migration", "s3", "redshift", "snowflake", "bigquery"],
        "response": "Cloud data platforms - choose based on your ecosystem:\n\n**AWS Data Stack**\n• Storage: S3 (data lake)\n• Warehouse: Redshift\n• Processing: EMR (Spark), Glue (ETL)\n• Streaming: Kinesis, MSK (Kafka)\n\n**GCP Data Stack**\n• Storage: GCS\n• Warehouse: BigQuery (serverless, columnar)\n• Processing: Dataflow (Apache Beam), Dataproc (Spark)\n• Streaming: Pub/Sub, Dataflow\n\n**Azure Data Stack**\n• Storage: ADLS Gen2\n• Warehouse: Synapse Analytics\n• Processing: Databricks, HDInsight\n• Streaming: Event Hubs\n\n**Cloud-Native Warehouses**: Snowflake (multi-cloud), Databricks (unified analytics)\n\nWhat's your current infrastructure?",
        "quick_replies": ["AWS migration", "Multi-cloud strategy", "Cost optimization", "Expert consultation"]
    },
    "default": {
        "response": "That's an interesting question about data engineering! While I don't have a specific answer for that, our team of experts can definitely help. Would you like to:\n\n• Explore our documentation\n• Browse common topics (pipelines, streaming, cloud)\n• Connect with a data engineer\n\nWhat would be most helpful?",
        "quick_replies": ["Browse topics", "Talk to expert", "Documentation"]
    }
}

# Conversation state tracking (in production, use Redis or database)
user_sessions = {}


def find_knowledge_match(message):
    """Find matching knowledge base entry"""
    message_lower = message.lower()
    for key, value in KNOWLEDGE_BASE.items():
        if key != "default":
            if any(keyword in message_lower for keyword in value["keywords"]):
                return value
    return KNOWLEDGE_BASE["default"]


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Data Engineering Chatbot API",
        "version": "1.0.0"
    })


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint
    Expected payload:
    {
        "message": "user message",
        "session_id": "unique_session_id",
        "user_info": {
            "name": "optional",
            "company": "optional",
            "role": "optional"
        }
    }
    """
    data = request.json
    
    if not data or 'message' not in data:
        return jsonify({"error": "Message is required"}), 400
    
    user_message = data['message']
    session_id = data.get('session_id', 'default')
    user_info = data.get('user_info', {})
    
    # Simulate thinking time (realistic response delay)
    time.sleep(random.uniform(0.5, 1.2))
    
    # Find matching response
    knowledge_match = find_knowledge_match(user_message)
    
    # Personalize response if user info is available
    response_text = knowledge_match["response"]
    if user_info.get('name'):
        response_text = f"Great question, {user_info['name']}! " + response_text
    
    # Build response
    response = {
        "message": response_text,
        "quick_replies": knowledge_match.get("quick_replies", []),
        "timestamp": time.time(),
        "session_id": session_id
    }
    
    return jsonify(response)


@app.route('/api/topics', methods=['GET'])
def get_topics():
    """Get all available topics"""
    topics = []
    for key, value in KNOWLEDGE_BASE.items():
        if key != "default":
            topics.append({
                "id": key,
                "keywords": value["keywords"],
                "preview": value["response"][:100] + "..."
            })
    
    return jsonify({
        "topics": topics,
        "count": len(topics)
    })


@app.route('/api/suggest', methods=['POST'])
def suggest_questions():
    """Suggest relevant follow-up questions based on context"""
    data = request.json
    context = data.get('context', '').lower()
    
    suggestions = []
    
    if 'pipeline' in context:
        suggestions = [
            "How do I monitor pipeline failures?",
            "What's the best way to handle late-arriving data?",
            "How do I implement incremental processing?"
        ]
    elif 'streaming' in context or 'kafka' in context:
        suggestions = [
            "How do I handle out-of-order events?",
            "What's the difference between at-least-once and exactly-once delivery?",
            "How do I scale Kafka consumers?"
        ]
    elif 'cloud' in context or 'aws' in context or 'gcp' in context:
        suggestions = [
            "What are best practices for cloud cost optimization?",
            "How do I set up disaster recovery?",
            "What's the right warehouse for my use case?"
        ]
    else:
        suggestions = [
            "Tell me about data pipelines",
            "What's the difference between batch and streaming?",
            "How do I choose a cloud platform?"
        ]
    
    return jsonify({
        "suggestions": suggestions
    })


@app.route('/api/contact', methods=['POST'])
def submit_contact():
    """Handle contact form submissions"""
    data = request.json
    
    required_fields = ['name', 'email', 'company', 'message']
    if not all(field in data for field in required_fields):
        return jsonify({
            "error": "Missing required fields",
            "required": required_fields
        }), 400
    
    # In production, this would:
    # - Save to database
    # - Send notification to sales team
    # - Trigger email confirmation
    # - Create CRM lead
    
    print(f"\n🔔 New Contact Submission:")
    print(f"   Name: {data['name']}")
    print(f"   Email: {data['email']}")
    print(f"   Company: {data['company']}")
    print(f"   Message: {data['message']}")
    print(f"   Use Case: {data.get('use_case', 'Not specified')}\n")
    
    return jsonify({
        "success": True,
        "message": "Thank you! Our team will reach out within 24 hours.",
        "ticket_id": f"DE-{int(time.time())}"
    })


@app.route('/api/analytics', methods=['POST'])
def track_analytics():
    """Track chatbot usage analytics"""
    data = request.json
    
    # In production, send to analytics service (Segment, Mixpanel, etc.)
    event_type = data.get('event_type')
    print(f"📊 Analytics Event: {event_type}")
    
    return jsonify({"tracked": True})


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Data Engineering Chatbot API Server")
    print("="*60)
    print("\nAvailable endpoints:")
    print("  GET  /api/health          - Health check")
    print("  POST /api/chat            - Send message")
    print("  GET  /api/topics          - Get all topics")
    print("  POST /api/suggest         - Get question suggestions")
    print("  POST /api/contact         - Submit contact form")
    print("  POST /api/analytics       - Track analytics")
    print("\n" + "="*60)
    print("\nStarting server on http://localhost:5000")
    print("Press CTRL+C to stop\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)