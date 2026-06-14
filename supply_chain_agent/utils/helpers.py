"""
Utility functions for Supply Chain Agent
"""

import json
from typing import Dict, List
from datetime import datetime, timedelta


def format_timestamp() -> str:
    """Get current timestamp"""
    return datetime.now().isoformat()


def estimate_delay_impact(delay_hours: int, shipment_priority: str) -> Dict:
    """Calculate impact of delay based on priority"""
    
    priority_multiplier = {
        'critical': 1.5,
        'high': 1.0,
        'medium': 0.7,
        'low': 0.5
    }
    
    impact_score = (delay_hours / 24) * priority_multiplier.get(shipment_priority, 1.0)
    
    return {
        "delay_hours": delay_hours,
        "priority": shipment_priority,
        "impact_score": min(impact_score, 10.0),  # Cap at 10
        "severity": "critical" if impact_score > 7 else "high" if impact_score > 5 else "medium"
    }


def calculate_mitigation_roi(mitigation_cost: float, potential_loss: float) -> Dict:
    """Calculate ROI of mitigation action"""
    
    if mitigation_cost == 0:
        return {"roi": 0, "recommendation": "No cost mitigation"}
    
    net_benefit = potential_loss - mitigation_cost
    roi_percent = (net_benefit / mitigation_cost) * 100 if mitigation_cost > 0 else 0
    
    return {
        "mitigation_cost": mitigation_cost,
        "potential_loss_avoided": net_benefit,
        "roi_percent": roi_percent,
        "recommendation": "Proceed" if roi_percent > 50 else "Reconsider"
    }


def rank_suppliers(suppliers: List[Dict]) -> List[Dict]:
    """Rank suppliers by reliability score"""
    
    scored_suppliers = []
    
    for supplier in suppliers:
        on_time_rate = supplier.get('on_time_rate', 0)
        risk_score = supplier.get('risk_score', 0)
        
        # Composite score: 70% on-time-rate, 30% inverse of risk
        reliability_score = (on_time_rate * 0.7) + ((1 - risk_score) * 0.3)
        
        scored_suppliers.append({
            **supplier,
            "reliability_score": reliability_score
        })
    
    # Sort by reliability score descending
    scored_suppliers.sort(key=lambda x: x['reliability_score'], reverse=True)
    return scored_suppliers


def generate_mitigation_action_plan(at_risk_shipments: List[Dict], suppliers: List[Dict]) -> List[Dict]:
    """Generate specific action plan for each at-risk shipment"""
    
    action_plan = []
    ranked_suppliers = rank_suppliers(suppliers)
    
    for shipment in at_risk_shipments[:10]:  # Top 10 at-risk
        # Find best alternative supplier
        current_supplier_id = None
        alternative_suppliers = [s for s in ranked_suppliers if s.get('id') != current_supplier_id][:3]
        
        action = {
            "shipment_id": shipment.get('shipment_id'),
            "risk_score": shipment.get('risk_score'),
            "current_status": "At Risk",
            "recommended_actions": [
                {
                    "action": "Use alternative supplier",
                    "alternatives": [s.get('name') for s in alternative_suppliers],
                    "estimated_delay_recovery": "6-12 hours"
                },
                {
                    "action": "Expedited shipping",
                    "cost_estimate": shipment.get('value', 0) * 0.05,
                    "time_savings": "24 hours"
                },
                {
                    "action": "Route optimization",
                    "options": ["Air freight", "Express courier"],
                    "lead_time": "Immediate"
                }
            ],
            "decision_deadline": (datetime.now() + timedelta(hours=4)).isoformat()
        }
        
        action_plan.append(action)
    
    return action_plan


def create_report_header(report_type: str) -> str:
    """Create formatted report header"""
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    header = f"""
╔════════════════════════════════════════════════════════════════╗
║           SUPPLY CHAIN MANAGEMENT REPORT                      ║
║           {report_type:<50}║
║           Generated: {timestamp:<36}║
╚════════════════════════════════════════════════════════════════╝
    """
    
    return header


def export_results_to_markdown(results: Dict, filename: str) -> str:
    """Export results to markdown format"""
    
    md_content = f"""# Supply Chain Disruption Analysis Report

Generated: {format_timestamp()}

## Executive Summary

### Key Metrics
- Total At-Risk Shipments: {len(results.get('at_risk_shipments', []))}
- Risk Level: HIGH
- Recommended Actions: {len(results.get('actions', []))}

## Agent Execution Results

### 1. Supplier Health Monitor
{json.dumps(results.get('supplier_monitor'), indent=2)}

### 2. Disruption Detection Agent
{json.dumps(results.get('disruption_detector'), indent=2)}

### 3. Risk Assessment Agent
{json.dumps(results.get('risk_assessor'), indent=2)}

### 4. Mitigation Agent
{json.dumps(results.get('mitigation'), indent=2)}

### 5. Stakeholder Notification Agent
{json.dumps(results.get('stakeholder_notification'), indent=2)}

## Recommendations

- Proceed with alternative supplier activation
- Implement expedited shipping for critical shipments
- Notify customer service for proactive communication

---
*This report was generated by the Supply Chain Disruption Agent*
"""
    
    return md_content
