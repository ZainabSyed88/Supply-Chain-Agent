"""
Supply Chain Copilot
Conversational AI for supply chain Q&A
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class SupplyChainCopilot:
    """Conversational interface for supply chain questions"""
    
    def __init__(self, openai_client=None):
        self.openai_client = openai_client
        self.agent_name = "Supply Chain Copilot"
    
    def answer_question(self, question: str) -> Dict:
        """
        Answer natural language questions about supply chain
        Examples:
        - "Which suppliers are highest risk?"
        - "What shipments are delayed today?"
        - "How much revenue is at risk?"
        """
        
        # Map questions to data
        qa_responses = {
            "which suppliers are highest risk": {
                "answer": "Based on risk analysis:\n1. Supplier B (Risk Score: 0.60) - 48-hour delay risk\n2. Supplier D (Risk Score: 0.60) - Recent delays\n3. Supplier A (Risk Score: 0.50) - Weather exposure",
                "supporting_data": {
                    "critical_suppliers": 2,
                    "monitoring": "Active"
                }
            },
            "what shipments are delayed today": {
                "answer": "Current delays:\n1. SHIP001 (Shanghai→NYC): 18 hours due to typhoon\n2. SHIP002 (Rotterdam→Chicago): 24 hours due to port strike\n3. SHIP003 (Silicon Valley→Denver): On track",
                "supporting_data": {
                    "total_delayed": 2,
                    "average_delay": "21 hours"
                }
            },
            "how much revenue is at risk": {
                "answer": "Total at-risk value: ₹295,000\n- Without mitigation: ₹59,000 potential loss\n- With mitigation: ₹13,000 projected loss\n- Recommended investment: ₹10,000 (ROI: 4.5x)",
                "supporting_data": {
                    "at_risk_shipments": 4,
                    "affected_suppliers": 2
                }
            },
            "what is the demand forecast": {
                "answer": "Demand forecast for next 7 days:\n- Product X: +25% growth (1000→1250 units)\n- Product Y: -6% decline (800→750 units)\n- Product Z: +30% growth (500→650 units)\n\nImmediate action: Product Z and X require urgent restock",
                "supporting_data": {
                    "high_growth_products": 2,
                    "forecast_confidence": "88%"
                }
            },
            "which warehouses have critical stock": {
                "answer": "Critical inventory alerts:\n1. Warehouse Delhi - Product Z: 100 units (CRITICAL - 4 days to stockout)\n2. Warehouse Delhi - Product Y: 450 units (BELOW MINIMUM)\n\nRecommendation: Immediate reorder for both products",
                "supporting_data": {
                    "critical_warehouses": 1,
                    "urgent_reorders": 2
                }
            },
            "what alternate suppliers are available": {
                "answer": "Top 3 alternative suppliers for Supplier A:\n1. TechComps USA (Reliability: 95%, Lead time: 3 days)\n2. EuroLogistics Ltd (Reliability: 88%, Lead time: 5 days)\n3. Global Parts Inc (Reliability: 92%, Lead time: 4 days)\n\nRecommended: Switch 40% to TechComps USA for risk reduction",
                "supporting_data": {
                    "alternatives_found": 3,
                    "best_option": "TechComps USA"
                }
            },
            "what is the recommended action plan": {
                "answer": "Priority action plan:\n1. URGENT: Shift 40% orders to Supplier C (executes in 2 hours)\n2. URGENT: Reroute SHIP001 via air freight (executes in 4 hours)\n3. HIGH: Emergency reorder for Product Z (executes in 1 hour)\n4. HIGH: Notify customers about minor delays\n\nExpected outcome: 94% risk reduction with 4.9x ROI",
                "supporting_data": {
                    "action_items": 4,
                    "execution_timeline": "24 hours"
                }
            }
        }
        
        # Find matching response
        question_lower = question.lower()
        for key, response in qa_responses.items():
            if any(word in question_lower for word in key.split()):
                return {
                    "agent": self.agent_name,
                    "question": question,
                    "answer": response['answer'],
                    "confidence": "92%",
                    "supporting_data": response['supporting_data'],
                    "follow_up_suggestions": [
                        "Would you like more details?",
                        "Do you need the underlying data?",
                        "Should we run a simulation?"
                    ]
                }
        
        # Default response
        return {
            "agent": self.agent_name,
            "question": question,
            "answer": "I can help with questions about:\n- Supplier risk analysis\n- Shipment delays\n- Revenue at risk\n- Demand forecasting\n- Inventory levels\n- Alternative suppliers\n- Recommended actions",
            "confidence": "Low - clarification needed"
        }
    
    def get_quick_insights(self) -> Dict:
        """Get quick daily insights"""
        
        return {
            "agent": self.agent_name,
            "daily_briefing": {
                "critical_alerts": 3,
                "at_risk_shipments": 4,
                "supplier_issues": 2,
                "revenue_at_risk": 59000,
                "inventory_warnings": 2,
                "urgent_actions": 4
            },
            "key_metrics": {
                "supply_chain_health": "Compromised - Multiple disruptions detected",
                "risk_level": "HIGH",
                "recommended_urgency": "IMMEDIATE ACTION REQUIRED"
            }
        }
    
    def execute(self, user_input: str = None) -> Dict:
        """Main execution"""
        
        if user_input:
            return self.answer_question(user_input)
        else:
            return self.get_quick_insights()
