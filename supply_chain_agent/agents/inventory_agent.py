"""
Inventory Optimization Agent
Monitors stock levels and predicts stockouts
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class InventoryOptimizationAgent:
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.agent_name = "Inventory Optimization Agent"
    
    def monitor_stock_levels(self) -> Dict:
        """Monitor current inventory levels"""
        
        inventory = {
            "Warehouse Delhi": {
                "Product X": {"current_stock": 2500, "min_stock": 1000, "status": "healthy"},
                "Product Y": {"current_stock": 450, "min_stock": 500, "status": "below_minimum"},
                "Product Z": {"current_stock": 100, "min_stock": 200, "status": "critical"}
            },
            "Warehouse Mumbai": {
                "Product X": {"current_stock": 1800, "min_stock": 1000, "status": "healthy"},
                "Product Y": {"current_stock": 900, "min_stock": 500, "status": "healthy"},
                "Product Z": {"current_stock": 350, "min_stock": 200, "status": "healthy"}
            }
        }
        
        critical_items = []
        for warehouse, products in inventory.items():
            for product, levels in products.items():
                if levels['status'] in ['critical', 'below_minimum']:
                    critical_items.append({
                        'warehouse': warehouse,
                        'product': product,
                        'current': levels['current_stock'],
                        'status': levels['status']
                    })
        
        return {
            "agent": self.agent_name,
            "inventory_snapshot": inventory,
            "critical_items": critical_items,
            "warehouses_with_issues": len(set(c['warehouse'] for c in critical_items))
        }
    
    def predict_stockouts(self) -> Dict:
        """Predict when products will run out"""
        
        stockout_predictions = [
            {"product": "Product Z", "warehouse": "Warehouse Delhi", "stockout_days": 4, "urgency": "CRITICAL"},
            {"product": "Product Y", "warehouse": "Warehouse Delhi", "stockout_days": 2, "urgency": "URGENT"}
        ]
        
        return {
            "agent": self.agent_name,
            "stockout_alerts": stockout_predictions,
            "immediate_action_needed": len([s for s in stockout_predictions if s['stockout_days'] <= 3])
        }
    
    def recommend_reorders(self) -> Dict:
        """Recommend reorder quantities and suppliers"""
        
        reorder_recommendations = [
            {
                "product": "Product Z",
                "warehouse": "Warehouse Delhi",
                "recommended_quantity": 2000,
                "supplier": "Supplier B",
                "lead_time_days": 5,
                "cost": 50000
            },
            {
                "product": "Product Y",
                "warehouse": "Warehouse Delhi",
                "recommended_quantity": 1500,
                "supplier": "Supplier A",
                "lead_time_days": 3,
                "cost": 45000
            }
        ]
        
        return {
            "agent": self.agent_name,
            "reorder_recommendations": reorder_recommendations,
            "total_reorder_cost": sum(r['cost'] for r in reorder_recommendations),
            "priority_reorders": len([r for r in reorder_recommendations if r['lead_time_days'] <= 3])
        }
    
    def execute(self) -> Dict:
        """Main execution"""
        stock = self.monitor_stock_levels()
        stockouts = self.predict_stockouts()
        reorders = self.recommend_reorders()
        
        return {
            "agent": self.agent_name,
            "stock_monitoring": stock,
            "stockout_prediction": stockouts,
            "reorder_recommendations": reorders,
            "summary": f"Found {stock['warehouses_with_issues']} warehouses with stock issues - {stockouts['immediate_action_needed']} immediate actions needed"
        }
