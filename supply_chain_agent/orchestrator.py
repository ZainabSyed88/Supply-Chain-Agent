"""
Main Orchestrator for Supply Chain Disruption Agent
Coordinates all 5 agents in sequence
"""

import json
import logging
from typing import Dict, List
from openai import OpenAI
from config import OPENAI_API_KEY, OPENAI_MODEL
from agents.supplier_monitor_agent import SupplierMonitorAgent
from agents.disruption_detector_agent import DisruptionDetectorAgent
from agents.risk_assessment_agent import RiskAssessmentAgent
from agents.mitigation_agent import MitigationAgent
from agents.stakeholder_notification_agent import StakeholderNotificationAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SupplyChainOrchestrator:
    """Main orchestrator for supply chain disruption management"""
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=OPENAI_API_KEY)
        self.suppliers = []
        self.disruptions = []
        self.at_risk_shipments = []
        self.results = {}
        
        # Initialize agents
        self.supplier_monitor = SupplierMonitorAgent(self.openai_client)
        self.disruption_detector = DisruptionDetectorAgent(self.openai_client)
        self.risk_assessor = RiskAssessmentAgent(self.openai_client)
        self.mitigation = MitigationAgent(self.openai_client)
        self.stakeholder = StakeholderNotificationAgent(self.openai_client)
    
    def load_data(self, suppliers_file: str, shipments_file: str, disruptions_file: str):
        """Load all data files"""
        logger.info("Loading data files...")
        
        try:
            with open(suppliers_file, 'r') as f:
                suppliers_data = json.load(f)
                self.suppliers = suppliers_data.get('suppliers', [])
                logger.info(f"Loaded {len(self.suppliers)} suppliers")
            
            with open(shipments_file, 'r') as f:
                shipments_data = json.load(f)
                self.shipments = shipments_data.get('shipments', [])
                logger.info(f"Loaded {len(self.shipments)} shipments")
            
            with open(disruptions_file, 'r') as f:
                disruptions_data = json.load(f)
                self.disruptions = disruptions_data.get('active_disruptions', [])
                logger.info(f"Loaded {len(self.disruptions)} disruptions")
        
        except FileNotFoundError as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def execute_agent_1_supplier_monitor(self) -> Dict:
        """Step 1: Monitor supplier health"""
        logger.info("Starting Agent 1: Supplier Health Monitor")
        
        result = self.supplier_monitor.execute("data/suppliers.json")
        self.results['supplier_monitor'] = result
        logger.info("Agent 1 complete")
        return result
    
    def execute_agent_2_disruption_detector(self) -> Dict:
        """Step 2: Detect disruptions"""
        logger.info("Starting Agent 2: Disruption Detection")
        
        result = self.disruption_detector.execute(
            "data/disruptions.json",
            "data/suppliers.json",
            self.suppliers
        )
        self.results['disruption_detector'] = result
        logger.info("Agent 2 complete")
        return result
    
    def execute_agent_3_risk_assessor(self) -> Dict:
        """Step 3: Assess risk and prioritize"""
        logger.info("Starting Agent 3: Risk Assessment")
        
        result = self.risk_assessor.execute(
            self.disruptions,
            "data/shipments.json"
        )
        self.results['risk_assessor'] = result
        
        # Extract at-risk shipments for next agents
        if 'intervention_priorities' in result:
            self.at_risk_shipments = result['intervention_priorities'].get('at_risk_shipments', [])
        
        logger.info("Agent 3 complete")
        return result
    
    def execute_agent_4_mitigation(self) -> Dict:
        """Step 4: Recommend mitigation strategies"""
        logger.info("Starting Agent 4: Mitigation Strategy")
        
        result = self.mitigation.execute(
            "data/suppliers.json",
            self.at_risk_shipments,
            self.disruptions
        )
        self.results['mitigation'] = result
        logger.info("Agent 4 complete")
        return result
    
    def execute_agent_5_stakeholder_notification(self) -> Dict:
        """Step 5: Notify stakeholders"""
        logger.info("Starting Agent 5: Stakeholder Notification")
        
        # Prepare comprehensive results
        analysis_results = {
            'at_risk_shipments': self.at_risk_shipments,
            'recommendations': self.results.get('mitigation', {}).get('mitigation_recommendations', {}).get('recommendations', ''),
            'total_estimated_delay_hours': self.results.get('disruption_detector', {}).get('risk_assessment', {}).get('total_estimated_delay_hours', 0),
            'total_at_risk_value': self.results.get('risk_assessor', {}).get('intervention_priorities', {}).get('at_risk_shipments', []),
            'mitigation_costs': self.results.get('mitigation', {}).get('cost_analysis', {}).get('mitigation_costs', {})
        }
        
        result = self.stakeholder.execute(analysis_results)
        self.results['stakeholder_notification'] = result
        logger.info("Agent 5 complete")
        return result
    
    def run_full_pipeline(self):
        """Execute all agents in orchestrated sequence"""
        logger.info("=" * 60)
        logger.info("SUPPLY CHAIN DISRUPTION AGENT - FULL PIPELINE")
        logger.info("=" * 60)
        
        try:
            # Load data
            self.load_data(
                "data/suppliers.json",
                "data/shipments.json",
                "data/disruptions.json"
            )
            
            # Execute agents sequentially
            logger.info("\n--- PHASE 1: MONITORING ---")
            self.execute_agent_1_supplier_monitor()
            
            logger.info("\n--- PHASE 2: DETECTION ---")
            self.execute_agent_2_disruption_detector()
            
            logger.info("\n--- PHASE 3: ASSESSMENT ---")
            self.execute_agent_3_risk_assessor()
            
            logger.info("\n--- PHASE 4: MITIGATION ---")
            self.execute_agent_4_mitigation()
            
            logger.info("\n--- PHASE 5: NOTIFICATION ---")
            self.execute_agent_5_stakeholder_notification()
            
            logger.info("\n" + "=" * 60)
            logger.info("PIPELINE EXECUTION COMPLETE")
            logger.info("=" * 60)
            
            return self.results
        
        except Exception as e:
            logger.error(f"Pipeline execution failed: {e}")
            raise
    
    def print_summary(self):
        """Print executive summary"""
        if 'stakeholder_notification' in self.results:
            print("\n" + "=" * 60)
            print(self.results['stakeholder_notification'].get('executive_summary', ''))
            print("=" * 60)


def main():
    """Main entry point"""
    try:
        orchestrator = SupplyChainOrchestrator()
        orchestrator.run_full_pipeline()
        orchestrator.print_summary()
        
        # Save results to file
        with open('output/pipeline_results.json', 'w') as f:
            # Convert results to serializable format
            serializable_results = {
                k: str(v) if not isinstance(v, (dict, list, str, int, float, bool, type(None))) else v
                for k, v in orchestrator.results.items()
            }
            json.dump(serializable_results, f, indent=2)
        
        logger.info("Results saved to output/pipeline_results.json")
    
    except Exception as e:
        logger.error(f"Main execution failed: {e}")
        raise


if __name__ == "__main__":
    main()
