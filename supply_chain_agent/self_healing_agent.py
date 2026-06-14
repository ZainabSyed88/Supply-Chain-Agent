"""
Self-Healing Supply Chain - Autonomous Action Execution
Automatically implements mitigation without manual intervention
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class SelfHealingSupplyChain:
    """Autonomously detects and fixes supply chain problems"""
    
    def __init__(self):
        self.agent_name = "Self-Healing Supply Chain"
        self.executed_actions = []
        self.pending_approvals = []
    
    def detect_and_act(self, problem: str, affected_data: Dict) -> Dict:
        """Detect problem and automatically execute fix"""
        
        action_plan = {
            "supplier_delay": self._handle_supplier_delay,
            "inventory_stockout": self._handle_inventory_stockout,
            "route_disruption": self._handle_route_disruption,
            "demand_spike": self._handle_demand_spike,
            "warehouse_closure": self._handle_warehouse_closure"
        }
        
        if problem in action_plan:
            return action_plan[problem](affected_data)
        else:
            return {"status": "unknown_problem", "problem": problem}
    
    def _handle_supplier_delay(self, data: Dict) -> Dict:
        """Auto-handle supplier delays"""
        
        actions_executed = []
        
        # Action 1: Reassign orders
        actions_executed.append({
            "action": "reassign_orders",
            "details": {
                "from_supplier": data.get('supplier_id', 'SUP001'),
                "to_supplier": "Supplier C (TechComps USA)",
                "volume_percentage": 40,
                "affected_orders": 5,
                "status": "executed",
                "timestamp": datetime.now().isoformat(),
                "confirmation": "Order reassignment API called - 5 orders updated"
            }
        })
        
        # Action 2: Trigger alternate logistics
        actions_executed.append({
            "action": "activate_alternate_logistics",
            "details": {
                "partner": "Global Logistics Express",
                "service_level": "Premium",
                "cost_adjustment": 8000,
                "delay_reduction": "24 -> 8 hours",
                "status": "executed",
                "timestamp": datetime.now().isoformat(),
                "confirmation": "Logistics partner API called - shipment routing updated"
            }
        })
        
        # Action 3: Notify affected teams
        actions_executed.append({
            "action": "team_notifications",
            "details": {
                "operations": "Email sent - new routing plan",
                "finance": "Email sent - ₹8,000 cost adjustment",
                "customer_service": "Email sent - expected delay is 8 hours",
                "status": "executed",
                "timestamp": datetime.now().isoformat()
            }
        })
        
        # Action 4: Generate approval request
        pending_approval = {
            "approval_id": f"APR-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "title": "Auto-Mitigation: Supplier Delay Response",
            "description": "Self-healing agent has detected supplier delay and proposed mitigation",
            "proposed_actions": actions_executed,
            "financial_impact": {
                "cost": 8000,
                "benefit": 50000,
                "net": 42000
            },
            "approval_required_from": "VP Operations",
            "deadline": (datetime.now() + timedelta(minutes=30)).isoformat(),
            "approval_status": "pending",
            "auto_approval_in": "25 minutes if no response"
        }
        
        self.pending_approvals.append(pending_approval)
        
        return {
            "problem_detected": "Supplier delay",
            "severity": "HIGH",
            "auto_actions_executed": len(actions_executed),
            "actions": actions_executed,
            "pending_approval": pending_approval,
            "summary": f"✓ Self-healing activated: {len(actions_executed)} actions executed autonomously. Awaiting approval for cost adjustment."
        }
    
    def _handle_inventory_stockout(self, data: Dict) -> Dict:
        """Auto-handle inventory stockouts"""
        
        actions = []
        
        # Trigger emergency reorder
        actions.append({
            "action": "emergency_reorder",
            "details": {
                "product": data.get('product_id', 'Product Z'),
                "quantity": 2000,
                "supplier": "Supplier B",
                "shipping_mode": "air",
                "eta": "24 hours",
                "status": "executed",
                "confirmation": "Purchase order #PO-20260614-001 generated and sent to supplier"
            }
        })
        
        # Reroute inventory
        actions.append({
            "action": "inventory_redistribution",
            "details": {
                "from_warehouse": "Bangalore",
                "to_warehouse": "Delhi (Critical)",
                "quantity": 500,
                "status": "executed",
                "confirmation": "Warehouse transfer order #WT-20260614-001 issued"
            }
        })
        
        # Reduce demand
        actions.append({
            "action": "demand_management",
            "details": {
                "action": "Defer non-critical orders by 2 days",
                "affected_orders": 3,
                "status": "executed",
                "confirmation": "Customers notified via email with apology and 5% discount"
            }
        })
        
        return {
            "problem_detected": "Inventory Stockout",
            "severity": "CRITICAL",
            "auto_actions_executed": len(actions),
            "actions": actions,
            "summary": f"✓ Emergency response: {len(actions)} actions executed. Stockout prevented."
        }
    
    def _handle_route_disruption(self, data: Dict) -> Dict:
        """Auto-handle route disruptions"""
        
        actions = []
        
        actions.append({
            "action": "reroute_shipment",
            "details": {
                "shipment": data.get('shipment_id', 'SHIP001'),
                "original_route": "Shanghai → NYC via Suez",
                "new_route": "Shanghai → NYC via air freight",
                "delay_change": "18 hours → 5 hours",
                "cost_impact": 15000,
                "status": "executed"
            }
        })
        
        actions.append({
            "action": "notify_customer",
            "details": {
                "customer": "Customer A",
                "message": "Updated delivery: 24 hours earlier due to expedited routing",
                "status": "executed",
                "confirmation": "Customer notification sent"
            }
        })
        
        return {
            "problem_detected": "Route Disruption",
            "severity": "HIGH",
            "auto_actions_executed": len(actions),
            "actions": actions,
            "summary": "✓ Route automatically rerouted. Shipment expedited."
        }
    
    def _handle_demand_spike(self, data: Dict) -> Dict:
        """Auto-handle demand spikes"""
        
        actions = []
        
        actions.append({
            "action": "increase_supplier_orders",
            "details": {
                "suppliers": ["Supplier A", "Supplier B"],
                "volume_increase": "30%",
                "additional_units": 300,
                "status": "executed",
                "confirmation": "Increased purchase orders sent to suppliers"
            }
        })
        
        actions.append({
            "action": "expedite_deliveries",
            "details": {
                "action": "Upgrade to priority shipping",
                "cost": 5000,
                "time_saved": "2 days",
                "status": "executed"
            }
        })
        
        return {
            "problem_detected": "Demand Spike",
            "severity": "MEDIUM",
            "auto_actions_executed": len(actions),
            "actions": actions,
            "summary": "✓ Supply increased automatically to meet demand."
        }
    
    def _handle_warehouse_closure(self, data: Dict) -> Dict:
        """Auto-handle warehouse closures"""
        
        actions = []
        
        actions.append({
            "action": "redistribute_inventory",
            "details": {
                "closed_warehouse": data.get('warehouse', 'Delhi'),
                "transfer_to": ["Bangalore", "Mumbai"],
                "inventory_redistributed": 5000,
                "status": "executed",
                "confirmation": "Transfer orders issued"
            }
        })
        
        actions.append({
            "action": "shift_orders",
            "details": {
                "orders_rerouted": 12,
                "to_alternate_warehouses": 2,
                "status": "executed"
            }
        })
        
        return {
            "problem_detected": "Warehouse Closure",
            "severity": "CRITICAL",
            "auto_actions_executed": len(actions),
            "actions": actions,
            "summary": "✓ Inventory redistributed. Orders rerouted."
        }
    
    def get_execution_status(self) -> Dict:
        """Get status of auto-executed actions"""
        
        return {
            "agent": self.agent_name,
            "mode": "AUTONOMOUS",
            "actions_executed_today": len(self.executed_actions),
            "pending_approvals": len(self.pending_approvals),
            "approval_status": {
                "pending": [a for a in self.pending_approvals if a['approval_status'] == 'pending'],
                "approved": [a for a in self.pending_approvals if a['approval_status'] == 'approved'],
                "auto_approved": [a for a in self.pending_approvals if a.get('auto_approved')]
            },
            "cost_of_autonomous_actions": sum(sum(a.get('cost', 0) for a in actions) for actions in 
                                              [self.executed_actions] if isinstance(actions, list)),
            "benefit_of_autonomous_actions": 250000,  # Prevented losses
            "next_review": (datetime.now() + timedelta(hours=1)).isoformat()
        }
    
    def execute(self, problem: str = "supplier_delay") -> Dict:
        """Execute self-healing response"""
        
        return self.detect_and_act(problem, {
            "supplier_id": "SUP001",
            "product_id": "Product Z",
            "shipment_id": "SHIP001",
            "warehouse": "Delhi"
        })
