"""
Demo Mode Orchestrator - No API Key Required
Perfect for testing and presentations
"""

import json
import logging
from typing import Dict, List
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DemoSupplierMonitor:
    """Demo version - no API calls"""
    
    def execute(self, data_source: str) -> Dict:
        try:
            with open(data_source, 'r') as f:
                suppliers = json.load(f).get('suppliers', [])
            
            healthy = sum(1 for s in suppliers if s.get('on_time_rate', 0) > 0.90)
            at_risk = len(suppliers) - healthy
            
            return {
                "agent": "Supplier Health Monitor",
                "status": "success",
                "summary": f"Analyzed {len(suppliers)} suppliers: {healthy} healthy, {at_risk} at-risk",
                "metrics": {
                    "total": len(suppliers),
                    "healthy": healthy,
                    "at_risk": at_risk,
                    "avg_on_time_rate": sum(s.get('on_time_rate', 0) for s in suppliers) / len(suppliers)
                }
            }
        except Exception as e:
            return {"agent": "Supplier Monitor", "status": "error", "error": str(e)}


class DemoDisruptionDetector:
    """Demo version - analyzes mock data"""
    
    def execute(self, disruptions_file: str) -> Dict:
        try:
            with open(disruptions_file, 'r') as f:
                disruptions = json.load(f).get('active_disruptions', [])
            
            high_severity = sum(1 for d in disruptions if d.get('severity') == 'high')
            total_delay = sum(d.get('estimated_delay_hours', 0) for d in disruptions)
            
            return {
                "agent": "Disruption Detection Agent",
                "status": "success",
                "summary": f"Detected {len(disruptions)} disruptions affecting supply chain",
                "disruption_breakdown": {
                    "total": len(disruptions),
                    "critical": high_severity,
                    "total_delay_hours": total_delay,
                    "types": list(set(d.get('type') for d in disruptions))
                }
            }
        except Exception as e:
            return {"agent": "Disruption Detector", "status": "error", "error": str(e)}


class DemoRiskAssessment:
    """Demo version - calculates risk scores"""
    
    def execute(self, shipments_file: str, disruptions_data: List[Dict]) -> Dict:
        try:
            with open(shipments_file, 'r') as f:
                shipments = json.load(f).get('shipments', [])
            
            at_risk = []
            for ship in shipments:
                risk_score = 0.6 if ship.get('priority') == 'critical' else 0.4
                at_risk.append({
                    "shipment_id": ship.get('id'),
                    "risk_score": risk_score,
                    "priority": ship.get('priority'),
                    "value": ship.get('value')
                })
            
            at_risk.sort(key=lambda x: x['risk_score'], reverse=True)
            
            return {
                "agent": "Risk Assessment Agent",
                "status": "success",
                "summary": f"Assessed {len(shipments)} shipments for risk",
                "at_risk_count": len(at_risk),
                "top_5_at_risk": at_risk[:5],
                "total_at_risk_value": sum(s['value'] for s in at_risk)
            }
        except Exception as e:
            return {"agent": "Risk Assessment", "status": "error", "error": str(e)}


class DemoMitigation:
    """Demo version - generates recommendations"""
    
    def execute(self, suppliers_file: str, at_risk_shipments: List[Dict]) -> Dict:
        try:
            with open(suppliers_file, 'r') as f:
                suppliers = json.load(f).get('suppliers', [])
            
            total_value = sum(s['value'] for s in at_risk_shipments)
            
            return {
                "agent": "Mitigation Agent",
                "status": "success",
                "summary": f"Generated mitigation strategies for {len(at_risk_shipments)} shipments",
                "recommendations": {
                    "use_alternative_suppliers": [s.get('name') for s in suppliers[:2]],
                    "expedite_shipments": len(at_risk_shipments),
                    "reroute_via": ["Air freight", "Express courier"]
                },
                "cost_analysis": {
                    "at_risk_value": total_value,
                    "expedited_cost": total_value * 0.05,
                    "alternative_supplier_cost": total_value * 0.03,
                    "rerouting_cost": total_value * 0.02,
                    "total_mitigation_cost": total_value * 0.10,
                    "roi": "Proceed - 2x ROI"
                }
            }
        except Exception as e:
            return {"agent": "Mitigation", "status": "error", "error": str(e)}


class DemoStakeholderNotification:
    """Demo version - generates alerts"""
    
    def execute(self, analysis_data: Dict) -> Dict:
        return {
            "agent": "Stakeholder Notification Agent",
            "status": "success",
            "alerts_generated": 3,
            "distribution": {
                "operations_team": "URGENT - Alternative suppliers activated",
                "finance_team": f"Review mitigation costs: ${analysis_data.get('total_cost', 0):,.0f}",
                "customer_service": "Prepare proactive customer communication"
            },
            "executive_summary": f"""
╔════════════════════════════════════════════════════════════════╗
║                 SUPPLY CHAIN ALERT SUMMARY                    ║
║                   Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}                      ║
╚════════════════════════════════════════════════════════════════╝

CRITICAL METRICS:
• At-Risk Shipments: {analysis_data.get('at_risk_count', 0)}
• Total Value at Risk: ${analysis_data.get('at_risk_value', 0):,.0f}
• Mitigation Cost: ${analysis_data.get('mitigation_cost', 0):,.0f}
• Recommended Action: PROCEED with mitigation

STATUS:
✓ Risk assessment complete
✓ Alternative suppliers identified
✓ Cost-benefit analysis positive
✓ Executive approval recommended

NEXT STEPS:
1. Operations: Activate alternative suppliers
2. Finance: Approve mitigation budget
3. Customer Service: Prepare communications
4. Executive: Review and approve action plan
            """
        }


class DemoPipeline:
    """Demo pipeline - runs without OpenAI API"""
    
    def __init__(self):
        self.suppliers = []
        self.disruptions = []
        self.shipments = []
        self.results = {}
    
    def load_data(self):
        """Load mock data"""
        logger.info("Loading mock data...")
        try:
            with open('data/suppliers.json', 'r') as f:
                self.suppliers = json.load(f).get('suppliers', [])
            with open('data/disruptions.json', 'r') as f:
                self.disruptions = json.load(f).get('active_disruptions', [])
            with open('data/shipments.json', 'r') as f:
                self.shipments = json.load(f).get('shipments', [])
            logger.info(f"Loaded {len(self.suppliers)} suppliers, {len(self.disruptions)} disruptions, {len(self.shipments)} shipments")
        except FileNotFoundError as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def run(self):
        """Run demo pipeline"""
        logger.info("=" * 60)
        logger.info("DEMO MODE - Supply Chain Disruption Agent (No API Key Required)")
        logger.info("=" * 60)
        
        self.load_data()
        
        logger.info("\n[1/5] Supplier Health Monitor...")
        result1 = DemoSupplierMonitor().execute('data/suppliers.json')
        self.results['supplier_monitor'] = result1
        print(f"  ✓ {result1['summary']}")
        
        logger.info("\n[2/5] Disruption Detection Agent...")
        result2 = DemoDisruptionDetector().execute('data/disruptions.json')
        self.results['disruption_detector'] = result2
        print(f"  ✓ {result2['summary']}")
        
        logger.info("\n[3/5] Risk Assessment Agent...")
        result3 = DemoRiskAssessment().execute('data/shipments.json', self.disruptions)
        self.results['risk_assessment'] = result3
        print(f"  ✓ {result3['summary']}")
        print(f"    - Top at-risk shipment value: ${result3['top_5_at_risk'][0]['value']:,.0f}")
        
        logger.info("\n[4/5] Mitigation Agent...")
        result4 = DemoMitigation().execute('data/suppliers.json', result3['top_5_at_risk'])
        self.results['mitigation'] = result4
        print(f"  ✓ {result4['summary']}")
        print(f"    - Total mitigation cost: ${result4['cost_analysis']['total_mitigation_cost']:,.0f}")
        
        logger.info("\n[5/5] Stakeholder Notification Agent...")
        analysis_data = {
            'at_risk_count': result3['at_risk_count'],
            'at_risk_value': result3['total_at_risk_value'],
            'mitigation_cost': result4['cost_analysis']['total_mitigation_cost']
        }
        result5 = DemoStakeholderNotification().execute(analysis_data)
        self.results['stakeholder_notification'] = result5
        print(f"  ✓ {result5['alerts_generated']} stakeholder alerts generated")
        
        # Print executive summary
        print("\n" + result5['executive_summary'])
        
        # Save results
        logger.info("\nSaving results to output/demo_results.json...")
        with open('output/demo_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        logger.info("\n" + "=" * 60)
        logger.info("DEMO PIPELINE COMPLETE - No API charges!")
        logger.info("=" * 60)
        
        return self.results


def main():
    try:
        pipeline = DemoPipeline()
        pipeline.run()
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        raise


if __name__ == "__main__":
    main()
