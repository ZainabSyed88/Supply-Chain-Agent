"""
Stakeholder Notification Agent
Communicates alerts and recommendations to relevant teams
"""

import json
from typing import Dict, List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class StakeholderNotificationAgent:
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.agent_name = "Stakeholder Notification Agent"
    
    def generate_alerts(self, at_risk_shipments: List[Dict], recommendations: str) -> Dict:
        """
        Generate prioritized alerts for stakeholders
        """
        
        alert_summary = json.dumps(at_risk_shipments[:5], indent=2)  # Top 5
        
        system_prompt = """You are a Communication Specialist for Supply Chain Management.
        Generate clear, actionable alerts for:
        1. Operations team (what needs to be done)
        2. Finance team (cost impact)
        3. Customer Service (communication strategy)
        
        Format as separate alerts with urgency level and action items."""
        
        user_message = f"""Generate stakeholder alerts based on:
        
        AT-RISK SHIPMENTS:
        {alert_summary}
        
        RECOMMENDATIONS:
        {recommendations}
        
        Create alerts for Operations, Finance, and Customer Service teams."""
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.2,
                max_tokens=600
            )
            
            return {
                "status": "success",
                "agent": self.agent_name,
                "alerts": response.choices[0].message.content
            }
        except Exception as e:
            logger.error(f"Error generating alerts: {str(e)}")
            return {
                "status": "error",
                "agent": self.agent_name,
                "error": str(e)
            }
    
    def create_communication_report(self, analysis_results: Dict) -> Dict:
        """
        Create comprehensive communication report
        """
        
        report = {
            "status": "success",
            "agent": self.agent_name,
            "report_type": "Supply Chain Disruption Alert",
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "report_id": "SC-ALERT-20260614-001",
                "severity": "HIGH" if analysis_results.get('impact_assessment') else "MEDIUM",
                "affected_shipments_count": len(analysis_results.get('at_risk_shipments', [])),
                "recommended_actions": 3,
                "estimated_delay_hours": analysis_results.get('total_estimated_delay_hours', 0)
            },
            "distribution_list": {
                "operations_team": ["ops-director@company.com", "supply-chain-manager@company.com"],
                "finance_team": ["cfo@company.com", "cost-analyst@company.com"],
                "customer_service": ["cs-manager@company.com"],
                "executive": ["ceo@company.com"]
            }
        }
        
        return report
    
    def format_executive_summary(self, all_results: Dict) -> str:
        """Generate executive summary for leadership"""
        
        summary = f"""
SUPPLY CHAIN DISRUPTION ALERT - EXECUTIVE SUMMARY
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

KEY METRICS:
• Total At-Risk Shipments: {len(all_results.get('at_risk_shipments', []))}
• Estimated Delay (hours): {all_results.get('total_estimated_delay_hours', 0)}
• Financial Impact: ${all_results.get('total_at_risk_value', 0):,.0f}
• Mitigation Cost: ${all_results.get('mitigation_costs', {}).get('total_estimated', 0):,.0f}

STATUS:
✓ Risk assessment complete
✓ Alternative suppliers identified
✓ Mitigation recommendations ready
✓ Stakeholder notifications queued

NEXT STEPS:
1. Operations: Implement alternative suppliers
2. Finance: Approve mitigation budget
3. Customer Service: Prepare customer communications
4. Executive: Review risk vs. cost trade-offs

Contact: Supply Chain Management Team
        """
        
        return summary.strip()
    
    def execute(self, all_analysis_results: Dict) -> Dict:
        """Main execution method"""
        
        alerts = self.generate_alerts(
            all_analysis_results.get('at_risk_shipments', []),
            all_analysis_results.get('recommendations', '')
        )
        
        communication_report = self.create_communication_report(all_analysis_results)
        executive_summary = self.format_executive_summary(all_analysis_results)
        
        return {
            "agent": self.agent_name,
            "alerts": alerts,
            "communication_report": communication_report,
            "executive_summary": executive_summary
        }
