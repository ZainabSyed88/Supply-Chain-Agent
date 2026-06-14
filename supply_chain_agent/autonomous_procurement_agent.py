"""
Autonomous Procurement Agent
Handles RFQ generation, supplier comparison, and purchase order creation
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class AutonomousProcurementAgent:
    """Autonomous procurement and vendor management"""
    
    def __init__(self):
        self.agent_name = "Autonomous Procurement Agent"
        self.approved_vendors = [
            {
                "id": "V001",
                "name": "TechComps USA",
                "rating": 4.8,
                "avg_delivery_days": 3,
                "avg_price_index": 1.0,
                "last_order_date": "2026-06-10",
                "total_orders": 45,
                "reliability": 0.98
            },
            {
                "id": "V002",
                "name": "EuroLogistics Ltd",
                "rating": 4.5,
                "avg_delivery_days": 5,
                "avg_price_index": 0.95,
                "last_order_date": "2026-06-08",
                "total_orders": 32,
                "reliability": 0.94
            },
            {
                "id": "V003",
                "name": "Global Parts Inc",
                "rating": 4.6,
                "avg_delivery_days": 4,
                "avg_price_index": 0.98,
                "last_order_date": "2026-06-09",
                "total_orders": 28,
                "reliability": 0.96
            }
        ]
        self.historical_pricing = {
            "V001": [{"date": "2026-05-14", "price": 100}, {"date": "2026-06-14", "price": 102}],
            "V002": [{"date": "2026-05-14", "price": 95}, {"date": "2026-06-14", "price": 96}],
            "V003": [{"date": "2026-05-14", "price": 98}, {"date": "2026-06-14", "price": 99}]
        }
    
    def generate_rfq(self, product: str, quantity: int, required_by_date: str, 
                    reason: str = "supply_chain_disruption") -> Dict:
        """Generate RFQ requests for approved vendors"""
        
        rfq_id = f"RFQ-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        rfqs = []
        for vendor in self.approved_vendors:
            rfq = {
                "rfq_id": rfq_id,
                "vendor_id": vendor['id'],
                "vendor_name": vendor['name'],
                "product": product,
                "quantity": quantity,
                "required_by_date": required_by_date,
                "request_date": datetime.now().isoformat(),
                "deadline_for_response": (datetime.now() + timedelta(hours=4)).isoformat(),
                
                "specifications": {
                    "quality_grade": "A",
                    "packaging": "Standard",
                    "delivery_point": "Company warehouse",
                    "incoterms": "FOB"
                },
                
                "vendor_historical_data": {
                    "avg_quote_time": "1.5 hours",
                    "avg_reliability": vendor['reliability'],
                    "avg_lead_time": f"{vendor['avg_delivery_days']} days",
                    "historical_pricing": self.historical_pricing[vendor['id']][-1]['price'] * quantity
                },
                
                "status": "sent",
                "sent_via": "email",
                "sent_timestamp": datetime.now().isoformat()
            }
            rfqs.append(rfq)
        
        return {
            "rfq_id": rfq_id,
            "status": "generated_and_sent",
            "product": product,
            "quantity": quantity,
            "total_rfqs_sent": len(rfqs),
            "vendors_contacted": [v['vendor_name'] for v in self.approved_vendors],
            "rfqs": rfqs,
            "expected_responses_by": (datetime.now() + timedelta(hours=4)).isoformat(),
            "next_action": "Monitor responses and compare quotes automatically"
        }
    
    def compare_vendor_responses(self, rfq_id: str, responses: List[Dict] = None) -> Dict:
        """Compare vendor quotes and select best option"""
        
        # Mock responses if not provided
        if not responses:
            responses = [
                {
                    "vendor_id": "V001",
                    "vendor_name": "TechComps USA",
                    "quote": 102 * 500,  # Quantity assumed 500
                    "delivery_days": 3,
                    "quality_assurance": "ISO 9001",
                    "response_time": "1.2 hours"
                },
                {
                    "vendor_id": "V002",
                    "vendor_name": "EuroLogistics Ltd",
                    "quote": 96 * 500,
                    "delivery_days": 5,
                    "quality_assurance": "ISO 9001",
                    "response_time": "2.1 hours"
                },
                {
                    "vendor_id": "V003",
                    "vendor_name": "Global Parts Inc",
                    "quote": 99 * 500,
                    "delivery_days": 4,
                    "quality_assurance": "ISO 9001",
                    "response_time": "1.8 hours"
                }
            ]
        
        # Scoring: 40% price, 30% delivery, 20% reliability, 10% responsiveness
        scored_responses = []
        for resp in responses:
            price_score = (max(r['quote'] for r in responses) - resp['quote']) / (max(r['quote'] for r in responses) - min(r['quote'] for r in responses)) * 40
            delivery_score = (max(r['delivery_days'] for r in responses) - resp['delivery_days']) / (max(r['delivery_days'] for r in responses) - min(r['delivery_days'] for r in responses)) * 30 if len(set(r['delivery_days'] for r in responses)) > 1 else 30
            
            vendor = next(v for v in self.approved_vendors if v['id'] == resp['vendor_id'])
            reliability_score = vendor['reliability'] * 100 * 0.2
            
            total_score = price_score + delivery_score + reliability_score + 10
            
            scored_responses.append({
                **resp,
                "scores": {
                    "price": round(price_score, 1),
                    "delivery": round(delivery_score, 1),
                    "reliability": round(reliability_score, 1),
                    "responsiveness": 10
                },
                "total_score": round(total_score, 1),
                "rank": 0  # Will be set after sorting
            })
        
        # Sort by total score
        scored_responses.sort(key=lambda x: x['total_score'], reverse=True)
        for i, resp in enumerate(scored_responses, 1):
            resp['rank'] = i
        
        return {
            "rfq_id": rfq_id,
            "status": "responses_compared",
            "responses_received": len(responses),
            "scoring_methodology": "40% price + 30% delivery + 20% reliability + 10% responsiveness",
            "scored_responses": scored_responses,
            "recommendation": {
                "top_vendor": scored_responses[0]['vendor_name'],
                "quote": f"₹{scored_responses[0]['quote']:,.0f}",
                "delivery": f"{scored_responses[0]['delivery_days']} days",
                "score": scored_responses[0]['total_score'],
                "advantages": [
                    f"Best overall score: {scored_responses[0]['total_score']}",
                    f"Fast delivery: {scored_responses[0]['delivery_days']} days",
                    "High reliability: 98%"
                ]
            }
        }
    
    def generate_purchase_order(self, rfq_id: str, selected_vendor_id: str, 
                               product: str, quantity: int, total_cost: float) -> Dict:
        """Generate and send purchase order"""
        
        po_id = f"PO-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        vendor = next(v for v in self.approved_vendors if v['id'] == selected_vendor_id)
        
        po = {
            "purchase_order": {
                "po_id": po_id,
                "po_date": datetime.now().isoformat(),
                "vendor_id": selected_vendor_id,
                "vendor_name": vendor['name'],
                
                "order_details": {
                    "product": product,
                    "quantity": quantity,
                    "unit_price": total_cost / quantity,
                    "total_amount": total_cost,
                    "currency": "INR"
                },
                
                "delivery_terms": {
                    "required_date": (datetime.now() + timedelta(days=3)).isoformat(),
                    "incoterms": "FOB",
                    "delivery_location": "Company Main Warehouse, Delhi",
                    "expected_delivery_date": (datetime.now() + timedelta(days=vendor['avg_delivery_days'])).isoformat()
                },
                
                "payment_terms": {
                    "payment_method": "Bank Transfer",
                    "payment_schedule": "50% advance, 50% on delivery",
                    "due_date_advance": (datetime.now() + timedelta(days=1)).isoformat(),
                    "due_date_balance": (datetime.now() + timedelta(days=vendor['avg_delivery_days'])).isoformat()
                },
                
                "quality_requirements": {
                    "inspection": "Pre-delivery inspection required",
                    "certification": "ISO 9001 certificate required",
                    "return_policy": "30 days for defects"
                },
                
                "special_conditions": {
                    "urgency": "CRITICAL - Supply chain disruption mitigation",
                    "penalty_for_late_delivery": "2% per day (max 10%)",
                    "bonus_for_early_delivery": "1% discount if delivered 1 day early"
                },
                
                "status": "generated",
                "approval_status": "pending_approval"
            },
            
            "automation_actions": [
                {
                    "action": "generate_po_document",
                    "status": "completed",
                    "file": f"{po_id}_purchase_order.pdf"
                },
                {
                    "action": "send_to_vendor",
                    "status": "pending",
                    "recipient": f"{vendor['name']} procurement@{vendor['name'].lower().replace(' ', '')}.com"
                },
                {
                    "action": "notify_finance",
                    "status": "pending",
                    "message": f"PO {po_id} requires approval for ₹{total_cost:,.0f}"
                },
                {
                    "action": "create_receiving_task",
                    "status": "pending",
                    "expected_receipt": (datetime.now() + timedelta(days=vendor['avg_delivery_days'])).isoformat()
                }
            ],
            
            "estimated_savings": {
                "cost_vs_emergency_rate": 5000,
                "delivery_time_saved": "2 days",
                "supplier_diversity_improved": True
            }
        }
        
        return po
    
    def execute(self, action: str = "generate_rfq", **kwargs) -> Dict:
        """Execute procurement action"""
        
        if action == "generate_rfq":
            return self.generate_rfq(
                product=kwargs.get('product', 'Electronics Components'),
                quantity=kwargs.get('quantity', 500),
                required_by_date=(datetime.now() + timedelta(days=3)).isoformat(),
                reason="supply_chain_disruption"
            )
        
        elif action == "compare_responses":
            return self.compare_vendor_responses(kwargs.get('rfq_id', 'RFQ-20260614000000'))
        
        elif action == "generate_po":
            responses = self.compare_vendor_responses(kwargs.get('rfq_id', 'RFQ-20260614000000'))
            top_vendor = responses['scored_responses'][0]
            return self.generate_purchase_order(
                rfq_id=kwargs.get('rfq_id', 'RFQ-20260614000000'),
                selected_vendor_id=top_vendor['vendor_id'],
                product=kwargs.get('product', 'Electronics Components'),
                quantity=kwargs.get('quantity', 500),
                total_cost=top_vendor['quote']
            )
        
        return {"error": "Unknown action"}
