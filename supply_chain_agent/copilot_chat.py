"""
EXECUTIVE COPILOT CHAT
Conversational AI interface for supply chain decision support

Use case: CEOs, Operations VPs ask questions, get instant answers
"""

import streamlit as st
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
import re
import requests

# ============================================
# PAGE CONFIG
# ============================================

st.set_page_config(
    page_title="Supply Chain Copilot",
    page_icon="🤖",
    layout="wide"
)

st.title("🤖 Executive Supply Chain Copilot")
st.markdown("Ask questions about your supply chain. Get instant answers powered by AI.")

# ============================================
# LOAD DATA & SETUP
# ============================================

@st.cache_data
def load_knowledge_base():
    """Load supply chain data for RAG (Retrieval-Augmented Generation)"""
    kb = {}
    
    try:
        with open('data/suppliers.json') as f:
            kb['suppliers'] = json.load(f)['suppliers']
    except:
        kb['suppliers'] = []
    
    try:
        with open('data/disruptions.json') as f:
            kb['disruptions'] = json.load(f)['active_disruptions']
    except:
        kb['disruptions'] = []
    
    try:
        with open('data/shipments.json') as f:
            kb['shipments'] = json.load(f)['shipments']
    except:
        kb['shipments'] = []
    
    return kb

kb = load_knowledge_base()

# ============================================
# QUERY HANDLERS - Business Logic
# ============================================

class SupplyChainCopilot:
    """AI copilot for supply chain queries"""
    
    def __init__(self, knowledge_base):
        self.kb = knowledge_base
        self.ai_enabled = True
    
    def nvidia_ask(self, question: str) -> str:
        """Ask NVIDIA GenAI a question using conversational AI"""
        try:
            import httpx
            import os

            nvidia_api_key = os.getenv("NVIDIA_API_KEY")
            nvidia_model = os.getenv("NVIDIA_MODEL", "nvidia/omni-gpt")
            nvidia_base_url = os.getenv("NVIDIA_BASE_URL", "https://api.nvidia.ai")

            if not nvidia_api_key:
                return None

            system_prompt = "You are an expert supply chain consultant. Provide concise, actionable advice. Be specific and data-focused."
            prompt = f"{system_prompt}\n\nQuestion: {question}\n\nAnswer:"
            url = f"{nvidia_base_url}/v1/models/{nvidia_model}:predict"

            response = httpx.post(
                url,
                headers={
                    "Authorization": f"Bearer {nvidia_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "input": prompt,
                    "temperature": 0.7,
                    "max_tokens": 500
                },
                timeout=30.0
            )

            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict):
                    return data.get("output", "").strip() or data.get("response", "").strip()
        except Exception:
            pass

        return None
    
    def find_highest_risk_supplier(self) -> Dict[str, Any]:
        """Find supplier with highest risk"""
        if not self.kb['suppliers']:
            return {"error": "No suppliers found"}
        
        supplier = min(self.kb['suppliers'], key=lambda x: x.get('on_time_rate', 0))
        
        return {
            "supplier": supplier['name'],
            "on_time_rate": f"{supplier.get('on_time_rate', 0)*100:.1f}%",
            "risk_score": supplier.get('risk_score', 'N/A'),
            "location": supplier.get('location', 'N/A'),
            "recommendation": "Consider adding backup supplier or increasing safety stock"
        }
    
    def find_delayed_shipments(self) -> Dict[str, Any]:
        """Find all delayed shipments"""
        delayed = [s for s in self.kb['shipments'] if s.get('status') == 'delayed']
        
        if not delayed:
            return {"message": "✓ No delayed shipments", "count": 0}
        
        total_value = len(delayed) * 450000  # Assume $450k per shipment
        
        return {
            "count": len(delayed),
            "shipments": [
                {
                    "id": s['id'],
                    "from": s.get('origin', 'N/A'),
                    "to": s.get('destination', 'N/A'),
                    "eta": s.get('eta', 'N/A')
                }
                for s in delayed[:5]
            ],
            "total_revenue_at_risk": f"${total_value / 1_000_000:.2f}M",
            "recommendation": f"Activate backup suppliers for {len(delayed)} shipments"
        }
    
    def calculate_revenue_at_risk(self) -> Dict[str, Any]:
        """Calculate total revenue at risk"""
        delayed = [s for s in self.kb['shipments'] if s.get('status') == 'delayed']
        critical_disruptions = [d for d in self.kb['disruptions'] if d.get('severity') == 'high']
        
        delayed_value = len(delayed) * 450000
        disruption_impact = len(critical_disruptions) * 350000
        
        total_at_risk = delayed_value + disruption_impact
        
        return {
            "from_delayed_shipments": f"${delayed_value / 1_000_000:.2f}M",
            "from_disruptions": f"${disruption_impact / 1_000_000:.2f}M",
            "total_revenue_at_risk": f"${total_at_risk / 1_000_000:.2f}M",
            "percentage_of_total": f"{(total_at_risk / (len(self.kb['shipments']) * 450000 + len(self.kb['disruptions']) * 350000) * 100) if (len(self.kb['shipments']) + len(self.kb['disruptions'])) > 0 else 0:.1f}%",
            "recommended_action": "Activate mitigation plan immediately"
        }
    
    def get_critical_alerts(self) -> Dict[str, Any]:
        """Get critical alerts"""
        critical_disruptions = [d for d in self.kb['disruptions'] if d.get('severity') == 'high']
        at_risk_suppliers = [s for s in self.kb['suppliers'] if s.get('on_time_rate', 0) < 0.75]
        
        alerts = []
        
        for d in critical_disruptions:
            alerts.append({
                "type": "CRITICAL DISRUPTION",
                "message": f"{d['type']} in {d['location']}",
                "impact": f"Est. {d.get('estimated_delay_hours', 0)} hour delay",
                "severity": "🔴 CRITICAL"
            })
        
        for s in at_risk_suppliers:
            alerts.append({
                "type": "SUPPLIER ALERT",
                "message": f"{s['name']} performance degrading",
                "impact": f"On-time rate: {s.get('on_time_rate', 0)*100:.0f}%",
                "severity": "🔴 HIGH RISK"
            })
        
        return {
            "total_alerts": len(alerts),
            "critical_count": len([a for a in alerts if a["severity"].startswith("🔴")]),
            "alerts": alerts[:5],
            "action": "Review alerts and activate mitigation protocols"
        }
    
    def recommend_action(self) -> Dict[str, Any]:
        """Get recommended actions for today"""
        actions = []
        
        # Check for critical disruptions
        critical = [d for d in self.kb['disruptions'] if d.get('severity') == 'high']
        if critical:
            actions.append({
                "priority": "🔴 URGENT",
                "action": "Activate Crisis War Room",
                "reason": f"{len(critical)} critical disruptions detected",
                "timeline": "Now"
            })
        
        # Check for at-risk suppliers
        at_risk = [s for s in self.kb['suppliers'] if s.get('on_time_rate', 0) < 0.80]
        if at_risk:
            actions.append({
                "priority": "🟡 HIGH",
                "action": "Contact at-risk suppliers",
                "reason": f"{len(at_risk)} suppliers below 80% on-time rate",
                "timeline": "Next 2 hours"
            })
        
        # Check for delayed shipments
        delayed = [s for s in self.kb['shipments'] if s.get('status') == 'delayed']
        if delayed:
            actions.append({
                "priority": "🟡 HIGH",
                "action": "Activate backup suppliers",
                "reason": f"{len(delayed)} shipments delayed",
                "timeline": "Next 4 hours"
            })
        
        # Default action
        if not actions:
            actions.append({
                "priority": "🟢 MONITOR",
                "action": "Continue monitoring",
                "reason": "Supply chain operating normally",
                "timeline": "Ongoing"
            })
        
        return {
            "recommendations": actions,
            "executive_summary": f"{len([a for a in actions if '🔴' in a['priority']])} urgent actions required"
        }
    
    def get_supplier_details(self, supplier_name: str) -> Dict[str, Any]:
        """Get details about a specific supplier"""
        supplier = next((s for s in self.kb['suppliers'] if supplier_name.lower() in s['name'].lower()), None)
        
        if not supplier:
            return {"error": f"Supplier '{supplier_name}' not found"}
        
        affected_disruptions = [
            d for d in self.kb['disruptions'] 
            if supplier['name'] in d.get('affected_suppliers', [])
        ]
        
        return {
            "name": supplier['name'],
            "location": supplier.get('location', 'N/A'),
            "on_time_rate": f"{supplier.get('on_time_rate', 0)*100:.1f}%",
            "risk_score": supplier.get('risk_score', 'N/A'),
            "current_disruptions": len(affected_disruptions),
            "recommendation": "At risk - consider reducing dependency" if supplier.get('on_time_rate', 0) < 0.80 else "Stable"
        }
    
    def answer_question(self, question: str) -> str:
        """Process natural language question and return answer
        
        Uses fast rule-based responses for specific queries,
        asks NVIDIA GenAI for open-ended questions.
        """
        q_lower = question.lower()
        result = None
        
        # Fast rule-based responses for specific queries
        if any(word in q_lower for word in ['highest risk', 'worst', 'most risky', 'biggest problem']):
            result = self.find_highest_risk_supplier()
        
        elif any(word in q_lower for word in ['delayed', 'late', 'which shipment']):
            result = self.find_delayed_shipments()
        
        elif any(word in q_lower for word in ['revenue', 'money at risk', 'loss', 'financial']):
            result = self.calculate_revenue_at_risk()
        
        elif any(word in q_lower for word in ['alert', 'critical', 'urgent', 'emergency']):
            result = self.get_critical_alerts()
        
        elif any(word in q_lower for word in ['what should i do', 'recommendation', 'action plan', 'what do i do']):
            result = self.recommend_action()
        
        elif any(word in q_lower for word in ['details', 'tell me about', 'info']):
            # Extract supplier name
            for supplier in self.kb['suppliers']:
                if supplier['name'].lower() in q_lower:
                    result = self.get_supplier_details(supplier['name'])
                    break
            else:
                result = {"error": "Could not find supplier details"}
        
        # If no rule-based match, ask NVIDIA GenAI
        if result is None:
            ai_response = self.nvidia_ask(question)
            if ai_response:
                result = {"message": ai_response, "source": "🤖 AI"}
            else:
                result = {
                    "message": "⚠️ AI answer unavailable. Check NVIDIA_API_KEY and model settings.\n\nI can help with: Which suppliers are risky? What shipments are delayed? How much revenue is at risk? What alerts are critical? What should I do today?"
                }
        
        return result

# ============================================
# CHAT INTERFACE
# ============================================

copilot = SupplyChainCopilot(kb)

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": """👋 Hi! I'm your Supply Chain Copilot. I can help you with:

**Common Questions:**
- "Which supplier is highest risk?"
- "What shipments are delayed?"
- "How much revenue is at risk?"
- "What alerts are critical?"
- "What should I do today?"
- "Tell me about Supplier ABC"

**What I can do:**
✓ Analyze supplier performance
✓ Track delayed shipments
✓ Calculate revenue impact
✓ Recommend actions
✓ Alert priority assessment

Ask me anything about your supply chain!"""
        }
    ]

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat input
if user_question := st.chat_input("Ask about your supply chain..."):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": user_question})
    with st.chat_message("user"):
        st.markdown(user_question)
    
    # Get copilot response
    with st.chat_message("assistant"):
        result = copilot.answer_question(user_question)
        
        if isinstance(result, dict):
            if "error" in result:
                response = f"❌ {result['error']}"
            else:
                # Format response
                response = "**Supply Chain Analysis:**\n\n"
                for key, value in result.items():
                    if key == "recommendation" or key == "recommended_action" or key == "action":
                        response += f"\n💡 **{key.title()}:**\n{value}\n"
                    elif key == "recommendations" or key == "alerts":
                        response += f"\n📋 **{key.title()}:**\n"
                        if isinstance(value, list):
                            for item in value:
                                if isinstance(item, dict):
                                    response += f"\n{item}\n"
                                else:
                                    response += f"• {item}\n"
                    elif isinstance(value, list) and len(value) > 0 and isinstance(value[0], dict):
                        response += f"\n**{key.title()}:**\n"
                        for item in value[:3]:
                            response += f"\n{item}\n"
                    else:
                        response += f"• **{key.replace('_', ' ').title()}:** {value}\n"
        else:
            response = str(result)
        
        st.markdown(response)
        st.session_state.messages.append({"role": "assistant", "content": response})

# ============================================
# SIDEBAR - QUICK ACCESS
# ============================================

with st.sidebar:
    st.header("Quick Commands")
    
    # Show AI status
    if os.getenv("NVIDIA_API_KEY"):
        st.success("✅ NVIDIA GenAI configured - AI mode enabled")
    else:
        st.warning("⚠️ NVIDIA GenAI not configured")
        st.info("""
        **To enable AI responses:**
        
        1. Open your `.env` file
        2. Set `NVIDIA_API_KEY`
        3. Restart this app
        
        Then ask open-ended questions!
        """)
    
    st.divider()
    
    if st.button("📊 Highest Risk Supplier"):
        st.session_state.messages.append({"role": "user", "content": "Which supplier is highest risk?"})
        st.rerun()
    
    if st.button("⏱️ Delayed Shipments"):
        st.session_state.messages.append({"role": "user", "content": "What shipments are delayed?"})
        st.rerun()
    
    if st.button("💰 Revenue at Risk"):
        st.session_state.messages.append({"role": "user", "content": "How much revenue is at risk?"})
        st.rerun()
    
    if st.button("🚨 Critical Alerts"):
        st.session_state.messages.append({"role": "user", "content": "What are the critical alerts?"})
        st.rerun()
    
    if st.button("📋 Action Plan"):
        st.session_state.messages.append({"role": "user", "content": "What should I do today?"})
        st.rerun()
    
    st.divider()
    
    st.header("Knowledge Base")
    st.metric("Suppliers", len(kb['suppliers']))
    st.metric("Active Disruptions", len(kb['disruptions']))
    st.metric("Shipments", len(kb['shipments']))
    
    st.divider()
    
    if st.button("🔄 Clear Chat"):
        st.session_state.messages = [st.session_state.messages[0]]
        st.rerun()
