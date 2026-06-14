"""
Customer Impact Predictor
Predicts which customers are affected and churn risk
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class CustomerImpactPredictor:
    """Predict customer-level impact of supply chain disruptions"""
    
    def __init__(self):
        self.agent_name = "Customer Impact Predictor"
        self.customers = [
            {
                "id": "CUST001",
                "name": "Customer A",
                "annual_value": 500000,
                "relationship_years": 5,
                "churn_sensitivity": "High",
                "inventory_model": "Just-In-Time"
            },
            {
                "id": "CUST002",
                "name": "Customer B",
                "annual_value": 350000,
                "relationship_years": 3,
                "churn_sensitivity": "Medium",
                "inventory_model": "Weekly stock"
            },
            {
                "id": "CUST003",
                "name": "Customer C",
                "annual_value": 250000,
                "relationship_years": 2,
                "churn_sensitivity": "Low",
                "inventory_model": "Monthly stock"
            },
            {
                "id": "CUST004",
                "name": "Customer D",
                "annual_value": 180000,
                "relationship_years": 1,
                "churn_sensitivity": "High",
                "inventory_model": "Just-In-Time"
            }
        ]
    
    def predict_affected_customers(self, disruption_type: str, affected_suppliers: List[str]) -> Dict:
        """Predict which customers will be affected by disruption"""
        
        # Map suppliers to customers (mock data)
        supplier_customer_map = {
            "Supplier A": ["CUST001", "CUST002"],
            "Supplier B": ["CUST001", "CUST003", "CUST004"],
            "Supplier C": ["CUST002"],
            "Supplier D": ["CUST003", "CUST004"]
        }
        
        # Find affected customers
        affected_customer_ids = set()
        for supplier in affected_suppliers:
            affected_customer_ids.update(supplier_customer_map.get(supplier, []))
        
        affected_customers = [c for c in self.customers if c['id'] in affected_customer_ids]
        
        customer_impacts = []
        for customer in affected_customers:
            impact = self._calculate_customer_impact(customer, disruption_type)
            customer_impacts.append(impact)
        
        return {
            "disruption_type": disruption_type,
            "affected_suppliers": affected_suppliers,
            "total_customers": len(self.customers),
            "affected_customers": len(affected_customers),
            "total_annual_value_at_risk": sum(c['annual_value'] for c in affected_customers),
            "customer_impacts": customer_impacts,
            "high_risk_customers": [c for c in customer_impacts if c['churn_risk'] == "High"],
            "critical_actions": self._generate_customer_actions(customer_impacts)
        }
    
    def _calculate_customer_impact(self, customer: Dict, disruption_type: str) -> Dict:
        """Calculate impact for specific customer"""
        
        # Determine delay based on inventory model
        delays = {
            "Just-In-Time": 5,  # Very sensitive
            "Weekly stock": 3,
            "Monthly stock": 1
        }
        
        expected_delay_days = delays.get(customer.get('inventory_model'), 2)
        
        # Churn risk based on sensitivity and relationship strength
        base_churn_risk = {"High": 35, "Medium": 15, "Low": 5}[customer.get('churn_sensitivity')]
        relationship_factor = max(0, 20 - customer.get('relationship_years', 0) * 3)
        delay_factor = expected_delay_days * 5
        
        total_churn_risk = min(95, base_churn_risk + relationship_factor + delay_factor)
        
        return {
            "customer_id": customer['id'],
            "customer_name": customer['name'],
            "annual_value": customer['annual_value'],
            
            "impact_analysis": {
                "order_fulfillment_impact": {
                    "affected_orders": 3 if customer.get('churn_sensitivity') == 'High' else 2,
                    "expected_delay_days": expected_delay_days,
                    "business_continuity_impact": "Severe" if expected_delay_days > 5 else "Moderate"
                },
                
                "financial_impact": {
                    "lost_sales_if_no_mitigation": int(customer['annual_value'] * 0.05 * expected_delay_days / 30),
                    "emergency_sourcing_cost_customer_absorbs": 0,
                    "potential_penalty_charges": 1000 if expected_delay_days > 3 else 0
                },
                
                "churn_risk": {
                    "base_churn_risk": f"{base_churn_risk}%",
                    "relationship_strength_factor": f"+{relationship_factor}%",
                    "delay_impact": f"+{delay_factor}%",
                    "total_churn_risk": f"{total_churn_risk}%",
                    "churn_risk_level": "High" if total_churn_risk > 30 else "Medium" if total_churn_risk > 15 else "Low"
                }
            },
            
            "communication_priority": "URGENT" if total_churn_risk > 50 else "HIGH" if total_churn_risk > 25 else "NORMAL",
            "recommended_retention_action": self._get_retention_action(total_churn_risk, customer),
            "churn_risk": "High" if total_churn_risk > 30 else "Medium" if total_churn_risk > 15 else "Low"
        }
    
    def _get_retention_action(self, churn_risk: float, customer: Dict) -> str:
        """Get appropriate retention action"""
        
        if churn_risk > 70:
            return f"CRITICAL: CEO/VP call to {customer['name']} + 10% discount + expedited shipping"
        elif churn_risk > 50:
            return f"HIGH: Account manager call + 5% discount + priority handling"
        elif churn_risk > 25:
            return f"MEDIUM: Director-level call + 2% discount + communication plan"
        else:
            return f"Standard: Email notification + tracking portal access"
    
    def _generate_customer_actions(self, customer_impacts: List[Dict]) -> List[Dict]:
        """Generate priority actions for customer retention"""
        
        critical = [c for c in customer_impacts if c['impact_analysis']['churn_risk']['total_churn_risk'] > 50]
        high = [c for c in customer_impacts if 25 < c['impact_analysis']['churn_risk']['total_churn_risk'] <= 50]
        
        actions = []
        
        for customer in critical:
            actions.append({
                "priority": "CRITICAL",
                "customer": customer['customer_name'],
                "action": "VP-level retention call",
                "timeline": "Within 1 hour",
                "talking_points": [
                    f"We're providing {customer['impact_analysis']['order_fulfillment_impact']['expected_delay_days']}-day delay",
                    "We're offering 10% discount on this order",
                    "Expedited shipping at our cost",
                    "Dedicated account support during recovery"
                ]
            })
        
        for customer in high:
            actions.append({
                "priority": "HIGH",
                "customer": customer['customer_name'],
                "action": "Account manager call",
                "timeline": "Within 4 hours"
            })
        
        return actions
    
    def predict_order_impact(self, order_id: str, customer_id: str) -> Dict:
        """Predict impact on specific order"""
        
        return {
            "order_id": order_id,
            "customer_id": customer_id,
            "delay_expected": "5 days",
            "customer_impact": {
                "missed_commitment": "Yes",
                "production_delay": "3 days",
                "revenue_impact": 25000,
                "churn_risk": "35%"
            },
            "mitigation_options": [
                {
                    "option": "Expedite via air freight",
                    "new_delivery": "2 days",
                    "cost": 8000,
                    "churn_risk_reduction": "80%",
                    "recommendation": "YES - Worth the cost"
                }
            ]
        }
    
    def predict_demand_rebound(self, disruption_recovery_days: int) -> Dict:
        """Predict customer demand rebound after disruption"""
        
        return {
            "scenario": f"Disruption resolved in {disruption_recovery_days} days",
            "demand_rebound": {
                "pent_up_demand": "150% of normal for 5 days",
                "total_additional_revenue": 250000,
                "inventory_shortage_risk": "High",
                "recommended_preparation": "Pre-position inventory before disruption resolves"
            }
        }
    
    def generate_customer_communications(self, customer_impacts: List[Dict]) -> Dict:
        """Generate communications for affected customers"""
        
        communications = {}
        
        for customer in customer_impacts:
            churn_risk = float(customer['impact_analysis']['churn_risk']['total_churn_risk'])
            
            if churn_risk > 50:
                template = "vip_apology_plus_offer"
            elif churn_risk > 25:
                template = "professional_notification"
            else:
                template = "standard_update"
            
            communications[customer['customer_id']] = {
                "customer_name": customer['customer_name'],
                "template": template,
                "subject": self._get_email_subject(churn_risk),
                "body_preview": self._get_email_body(customer, churn_risk)
            }
        
        return communications
    
    def _get_email_subject(self, churn_risk: float) -> str:
        """Generate email subject based on risk"""
        
        if churn_risk > 50:
            return "🚨 Order Update & Special Offer - Your Shipment"
        elif churn_risk > 25:
            return "📦 Shipment Status Update - We're Here to Help"
        else:
            return "📦 Shipment Status Update"
    
    def _get_email_body(self, customer: Dict, churn_risk: float) -> str:
        """Generate email body"""
        
        delay_days = customer['impact_analysis']['order_fulfillment_impact']['expected_delay_days']
        
        base = f"Dear {customer['customer_name']},\n\nWe wanted to notify you about a brief delay in your order.\n"
        
        if churn_risk > 50:
            return base + f"\nExpected delay: {delay_days} days\n\nWe're offering:\n- 10% discount on this order\n- Free expedited shipping\n- Dedicated support team\n\nWe value your partnership."
        elif churn_risk > 25:
            return base + f"\nExpected delay: {delay_days} days\n\nWe're providing:\n- Real-time tracking\n- 5% discount\n- Priority handling\n\nThank you for your patience."
        else:
            return base + f"\nExpected delay: {delay_days} days\n\nTracking: [link]"
    
    def execute(self, action: str = "predict_affected") -> Dict:
        """Execute prediction"""
        
        if action == "predict_affected":
            return self.predict_affected_customers("supplier_delay", ["Supplier B", "Supplier D"])
        elif action == "predict_orders":
            return self.predict_order_impact("ORD-001", "CUST001")
        elif action == "predict_rebound":
            return self.predict_demand_rebound(3)
        elif action == "generate_communications":
            impacts = self.predict_affected_customers("supplier_delay", ["Supplier B"])['customer_impacts']
            return self.generate_customer_communications(impacts)
