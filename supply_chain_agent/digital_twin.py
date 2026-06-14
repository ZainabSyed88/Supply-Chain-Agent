"""
Digital Twin Simulation
Simulate supply chain scenarios and predict outcomes
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class DigitalTwinSimulation:
    """Simulate supply chain scenarios"""
    
    def __init__(self):
        self.agent_name = "Digital Twin Simulation"
    
    def simulate_supplier_failure(self, supplier_name: str, suppliers: List[Dict], shipments: List[Dict]) -> Dict:
        """
        Simulate: What happens if Supplier A fails?
        """
        
        affected_shipments = [s for s in shipments if s.get('supplier_id') == 'SUP001']
        total_value_impact = sum(s.get('value', 0) for s in affected_shipments)
        
        return {
            "scenario": f"{supplier_name} Complete Failure",
            "affected_shipments": len(affected_shipments),
            "value_at_risk": total_value_impact,
            "potential_outcomes": [
                {
                    "outcome": "Without backup supplier",
                    "delivery_delay_days": 14,
                    "customer_impact": "High - Critical orders miss deadline",
                    "financial_loss": total_value_impact * 0.25,
                    "probability": "100%"
                },
                {
                    "outcome": "With backup supplier activated",
                    "delivery_delay_days": 3,
                    "customer_impact": "Low - Minor delays manageable",
                    "financial_loss": total_value_impact * 0.05,
                    "probability": "95%"
                }
            ],
            "recommended_mitigation": "Have Supplier C on standby with capacity for 40% volume shift"
        }
    
    def simulate_demand_surge(self, surge_percentage: int) -> Dict:
        """
        Simulate: What happens with +30% demand surge?
        """
        
        base_demand = 100000
        surged_demand = base_demand * (1 + surge_percentage / 100)
        
        current_inventory = 45000
        inventory_shortfall = surged_demand - current_inventory
        
        return {
            "scenario": f"Demand Surge +{surge_percentage}%",
            "base_demand": base_demand,
            "surged_demand": int(surged_demand),
            "current_inventory": current_inventory,
            "inventory_shortfall": int(inventory_shortfall) if inventory_shortfall > 0 else 0,
            "days_to_stockout": 2 if surge_percentage > 25 else 5,
            "potential_outcomes": [
                {
                    "outcome": "Without emergency reorder",
                    "stockout_duration_days": 7,
                    "lost_sales": int(surged_demand * 0.3),
                    "revenue_impact": int(surged_demand * 0.3 * 500),
                    "customer_satisfaction": "Severely impacted"
                },
                {
                    "outcome": "With emergency reorder activated",
                    "stockout_duration_days": 1,
                    "lost_sales": int(surged_demand * 0.05),
                    "revenue_impact": int(surged_demand * 0.05 * 500),
                    "customer_satisfaction": "Minimally impacted"
                }
            ]
        }
    
    def simulate_route_disruption(self, delay_days: int) -> Dict:
        """
        Simulate: What happens with 5-day route delay?
        """
        
        shipments_affected = 4
        total_value = 295000
        
        return {
            "scenario": f"Route Disruption - {delay_days} Days Delay",
            "shipments_affected": shipments_affected,
            "total_value_affected": total_value,
            "ripple_effects": [
                {
                    "level": 1,
                    "effect": "Direct delivery delays",
                    "impact": f"{shipments_affected} shipments delayed {delay_days} days"
                },
                {
                    "level": 2,
                    "effect": "Warehouse stockouts",
                    "impact": "2 warehouse locations critical stock levels"
                },
                {
                    "level": 3,
                    "effect": "Production line stoppages",
                    "impact": "Manufacturing pauses for 3+ days"
                },
                {
                    "level": 4,
                    "effect": "Customer dissatisfaction",
                    "impact": "Late deliveries to 5+ key customers"
                }
            ],
            "mitigation_scenarios": [
                {
                    "mitigation": "Air freight for critical items",
                    "cost": 15000,
                    "delay_reduction": delay_days - 1,
                    "effectiveness": "80%"
                },
                {
                    "mitigation": "Alternate logistics partner",
                    "cost": 8000,
                    "delay_reduction": delay_days - 3,
                    "effectiveness": "60%"
                }
            ]
        }
    
    def simulate_port_strike(self) -> Dict:
        """
        Simulate: What happens if Rotterdam port strikes for 48 hours?
        """
        
        affected_shipments = 2
        total_value = 145000
        
        return {
            "scenario": "Rotterdam Port Strike - 48 Hour Disruption",
            "affected_shipments": affected_shipments,
            "value_at_risk": total_value,
            "timeline": {
                "hour_0": "Strike begins - operations halt",
                "hour_24": "Alternative port routing discussed",
                "hour_36": "Ships diverted to Hamburg (additional 8 hours)",
                "hour_48": "Strike ends - backlog processing begins"
            },
            "cumulative_delays": [
                {"checkpoint": "Hour 12", "total_delay_hours": 12},
                {"checkpoint": "Hour 24", "total_delay_hours": 24},
                {"checkpoint": "Hour 36", "total_delay_hours": 32},
                {"checkpoint": "Hour 48", "total_delay_hours": 28}
            ],
            "financial_impact": {
                "without_action": {"delay_hours": 48, "estimated_loss": 36000},
                "with_rerouting": {"delay_hours": 8, "estimated_loss": 6000, "mitigation_cost": 8000}
            },
            "recommended_action": "Immediate rerouting to Hamburg - net benefit: ₹22,000"
        }
    
    def execute_simulation(self, scenario: str, **kwargs) -> Dict:
        """Execute specific simulation"""
        
        simulations = {
            "supplier_failure": lambda: self.simulate_supplier_failure("Supplier A", [], []),
            "demand_surge": lambda: self.simulate_demand_surge(30),
            "route_disruption": lambda: self.simulate_route_disruption(5),
            "port_strike": lambda: self.simulate_port_strike()
        }
        
        if scenario in simulations:
            result = simulations[scenario]()
            return {
                "agent": self.agent_name,
                "simulation": result,
                "status": "success"
            }
        else:
            return {
                "agent": self.agent_name,
                "status": "error",
                "error": f"Unknown scenario: {scenario}"
            }
