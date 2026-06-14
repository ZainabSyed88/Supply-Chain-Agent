"""
Supplier Health Monitor Agent
Monitors vendor performance and delays in real-time
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class SupplierMonitorAgent:
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.agent_name = "Supplier Health Monitor"
    
    def load_suppliers(self, filepath: str) -> List[Dict]:
        """Load supplier data from JSON file"""
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
                return data.get('suppliers', [])
        except FileNotFoundError:
            logger.error(f"Suppliers file not found: {filepath}")
            return []
    
    def analyze_supplier_health(self, suppliers: List[Dict]) -> Dict:
        """
        Analyze health of all suppliers using OpenAI
        Returns supplier status and recommendations
        """
        
        supplier_summary = json.dumps(suppliers, indent=2)
        
        system_prompt = """You are a Supply Chain Analyst Agent. 
        Analyze supplier performance data and identify:
        1. Healthy suppliers (on_time_rate > 0.90)
        2. At-risk suppliers (on_time_rate < 0.90 or risk_score > 0.5)
        3. Critical concerns
        
        Provide concise analysis with actionable insights."""
        
        user_message = f"""Analyze this supplier data and provide health assessment:
        {supplier_summary}
        
        Focus on: performance trends, risk factors, and recommendations."""
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            return {
                "status": "success",
                "agent": self.agent_name,
                "analysis": response.choices[0].message.content,
                "supplier_count": len(suppliers),
                "raw_data": suppliers
            }
        except Exception as e:
            logger.error(f"Error in supplier analysis: {str(e)}")
            return {
                "status": "error",
                "agent": self.agent_name,
                "error": str(e)
            }
    
    def monitor_performance(self, suppliers: List[Dict]) -> Dict:
        """Real-time monitoring of supplier performance"""
        
        metrics = {
            "total_suppliers": len(suppliers),
            "healthy": sum(1 for s in suppliers if s.get('on_time_rate', 0) > 0.90),
            "at_risk": sum(1 for s in suppliers if s.get('on_time_rate', 0) <= 0.90),
            "high_risk": sum(1 for s in suppliers if s.get('risk_score', 0) > 0.5),
            "average_on_time_rate": sum(s.get('on_time_rate', 0) for s in suppliers) / len(suppliers) if suppliers else 0
        }
        
        return {
            "status": "success",
            "agent": self.agent_name,
            "metrics": metrics,
            "timestamp": "2026-06-14T14:00:00Z"
        }
    
    def execute(self, data_source: str) -> Dict:
        """Main execution method"""
        suppliers = self.load_suppliers(data_source)
        health_analysis = self.analyze_supplier_health(suppliers)
        performance = self.monitor_performance(suppliers)
        
        return {
            "agent": self.agent_name,
            "health_analysis": health_analysis,
            "performance_metrics": performance
        }
