"""
Main Orchestrator for Supply Chain Disruption Agent
Coordinates agents in parallel tiers for faster execution.
Supports OpenAI API only
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime
from typing import Any, Callable, Dict, List
from config import OPENAI_API_KEY, OPENAI_MODEL

# Try to import OpenAI, but make it optional
try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

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


class AsyncSupplyChainOrchestrator:
    """Async orchestrator for the supply chain disruption agent."""

    def __init__(self):
        # Check if OpenAI API key is available
        if OPENAI_API_KEY and HAS_OPENAI:
            logger.info("Using OpenAI API for LLM")
            self.openai_client = OpenAI(api_key=OPENAI_API_KEY)
            self.llm_mode = "openai"
        else:
            logger.warning(
                "OpenAI API key not found or OpenAI package not installed. Please set OPENAI_API_KEY and install openai."
            )
            self.openai_client = None
            self.llm_mode = "none"

        self.suppliers: list[dict[str, Any]] = []
        self.shipments: list[dict[str, Any]] = []
        self.disruptions: list[dict[str, Any]] = []
        self.results: dict[str, Any] = {}
        self.agent_times: dict[str, float] = {}
        self.errors: dict[str, str] = {}

        self.context = {
            "suppliers": [],
            "shipments": [],
            "disruptions": [],
            "at_risk_shipments": [],
            "risk_scores": {},
            "recommendations": [],
        }

        # Initialize agents with the shared OpenAI client.
        self.supplier_monitor = SupplierMonitorAgent(self.openai_client)
        self.disruption_detector = DisruptionDetectorAgent(self.openai_client)
        self.risk_assessor = RiskAssessmentAgent(self.openai_client)
        self.mitigation = MitigationAgent(self.openai_client)
        self.stakeholder = StakeholderNotificationAgent(self.openai_client)

    def load_data(self, suppliers_file: str, shipments_file: str, disruptions_file: str):
        """Load all data files and populate shared context."""
        logger.info("Loading data files...")

        try:
            with open(suppliers_file, 'r') as f:
                suppliers_data = json.load(f)
                self.suppliers = suppliers_data.get('suppliers', [])
                self.context['suppliers'] = self.suppliers
                logger.info(f"Loaded {len(self.suppliers)} suppliers")

            with open(shipments_file, 'r') as f:
                shipments_data = json.load(f)
                self.shipments = shipments_data.get('shipments', [])
                self.context['shipments'] = self.shipments
                logger.info(f"Loaded {len(self.shipments)} shipments")

            with open(disruptions_file, 'r') as f:
                disruptions_data = json.load(f)
                self.disruptions = disruptions_data.get('active_disruptions', [])
                self.context['disruptions'] = self.disruptions
                logger.info(f"Loaded {len(self.disruptions)} disruptions")

        except FileNotFoundError as e:
            logger.error(f"Error loading data: {e}")
            raise

    async def run_agent_async(
        self,
        agent_name: str,
        agent_func: Callable,
        on_start: Callable[[str], Any] = None,
        on_complete: Callable[[str, float, dict], Any] = None,
        on_error: Callable[[str, str], Any] = None,
        timeout_seconds: int = 60,
    ) -> Dict[str, Any]:
        """
        Wrapper that runs any sync agent function in a thread pool.
        Handles timing, timeout, error catching, and callbacks.
        """
        start_time = time.time()

        try:
            if on_start:
                await on_start(agent_name)

            loop = asyncio.get_event_loop()
            result = await asyncio.wait_for(
                loop.run_in_executor(None, agent_func), timeout=timeout_seconds
            )

            duration_ms = round((time.time() - start_time) * 1000, 2)
            self.results[agent_name] = result
            self.agent_times[agent_name] = duration_ms

            if on_complete:
                await on_complete(agent_name, duration_ms, result)

            return result

        except asyncio.TimeoutError:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            error_msg = f"Agent {agent_name} timed out after {timeout_seconds}s"
            self.errors[agent_name] = error_msg
            self.agent_times[agent_name] = duration_ms

            if on_error:
                await on_error(agent_name, error_msg)

            return {}

        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            error_msg = str(e)
            self.errors[agent_name] = error_msg
            self.agent_times[agent_name] = duration_ms

            if on_error:
                await on_error(agent_name, error_msg)

            return {}

    async def run_pipeline_async(
        self,
        on_start: Callable[[], Any] = None,
        on_agent_start: Callable[[str], Any] = None,
        on_agent_complete: Callable[[str, float, dict], Any] = None,
        on_agent_error: Callable[[str, str], Any] = None,
        on_complete: Callable[[dict], Any] = None,
    ) -> Dict[str, Any]:
        """Run all agents in parallel tiers.
        Callbacks allow events to fire at each stage.
        """
        pipeline_start = time.time()

        if on_start:
            await on_start()

        def make_callbacks(agent_name: str):
            async def _start(name: str):
                if on_agent_start:
                    await on_agent_start(name)

            async def _complete(name: str, duration_ms: float, result: dict):
                if on_agent_complete:
                    await on_agent_complete(name, duration_ms, result)

            async def _error(name: str, error: str):
                if on_agent_error:
                    await on_agent_error(name, error)

            return _start, _complete, _error

        logger.info("Tier 1 starting: supplier_monitor + disruption_detector")
        s1, c1, e1 = make_callbacks("supplier_monitor")
        s2, c2, e2 = make_callbacks("disruption_detector")

        tier1_results = await asyncio.gather(
            self.run_agent_async(
                "supplier_monitor",
                lambda: self.supplier_monitor.execute("data/suppliers.json"),
                on_start=s1,
                on_complete=c1,
                on_error=e1,
            ),
            self.run_agent_async(
                "disruption_detector",
                lambda: self.disruption_detector.execute(
                    "data/disruptions.json",
                    "data/suppliers.json",
                    self.context["suppliers"],
                ),
                on_start=s2,
                on_complete=c2,
                on_error=e2,
            ),
            return_exceptions=False,
        )

        supplier_result = tier1_results[0] or {}
        disruption_result = tier1_results[1] or {}

        self.context["disruptions"] = disruption_result.get(
            "detected_disruptions", self.context["disruptions"]
        )

        logger.info("Tier 1 complete")

        logger.info("Tier 2 starting: risk_assessor + mitigation")
        s3, c3, e3 = make_callbacks("risk_assessor")
        s4, c4, e4 = make_callbacks("mitigation")

        tier2_results = await asyncio.gather(
            self.run_agent_async(
                "risk_assessor",
                lambda: self.risk_assessor.execute(
                    self.context["disruptions"],
                    "data/shipments.json",
                ),
                on_start=s3,
                on_complete=c3,
                on_error=e3,
            ),
            self.run_agent_async(
                "mitigation",
                lambda: self.mitigation.execute(
                    "data/suppliers.json",
                    self.context.get("at_risk_shipments", []),
                    self.context["disruptions"],
                ),
                on_start=s4,
                on_complete=c4,
                on_error=e4,
            ),
            return_exceptions=False,
        )

        risk_result = tier2_results[0] or {}
        if "intervention_priorities" in risk_result:
            self.context["at_risk_shipments"] = risk_result[
                "intervention_priorities"
            ].get("at_risk_shipments", [])

        logger.info("Tier 2 complete")

        logger.info("Tier 3 starting: stakeholder_notification")
        s5, c5, e5 = make_callbacks("stakeholder_notification")

        analysis_results = {
            "at_risk_shipments": self.context.get("at_risk_shipments", []),
            "recommendations": self.results.get("mitigation", {})
            .get("mitigation_recommendations", {})
            .get("recommendations", ""),
            "total_estimated_delay_hours": self.results.get(
                "disruption_detector", {}
            ).get("risk_assessment", {}).get("total_estimated_delay_hours", 0),
            "mitigation_costs": self.results.get("mitigation", {})
            .get("cost_analysis", {})
            .get("mitigation_costs", {}),
        }

        await self.run_agent_async(
            "stakeholder_notification",
            lambda: self.stakeholder.execute(analysis_results),
            on_start=s5,
            on_complete=c5,
            on_error=e5,
        )

        logger.info("Tier 3 complete")

        total_ms = round((time.time() - pipeline_start) * 1000, 2)
        summary = {
            "total_duration_ms": total_ms,
            "agent_times": self.agent_times,
            "errors": self.errors,
            "agents_succeeded": len(self.results),
            "agents_failed": len(self.errors),
            "results": self.results,
        }

        if on_complete:
            await on_complete(summary)

        return summary

    def run_full_pipeline(self):
        """Execute the async pipeline from a synchronous entrypoint."""
        logger.info("=" * 60)
        logger.info("SUPPLY CHAIN DISRUPTION AGENT - FULL PIPELINE")
        logger.info("=" * 60)
        self.load_data("data/suppliers.json", "data/shipments.json", "data/disruptions.json")
        return asyncio.run(self.run_pipeline_async())

    def print_summary(self):
        """Print executive summary"""
        if 'stakeholder_notification' in self.results:
            print("\n" + "=" * 60)
            print(self.results['stakeholder_notification'].get('executive_summary', ''))
            print("=" * 60)


def main():
    """Main entry point"""
    try:
        orchestrator = AsyncSupplyChainOrchestrator()

        if orchestrator.llm_mode == "none":
            print("\n" + "=" * 70)
            print("ℹ️  CHAINPULSE SUPPLY CHAIN AGENT - NO LLM CONFIGURED")
            print("=" * 70)
            print("\n📌 No OpenAI API key detected or OpenAI package not installed.")
            print("\n🚀 RECOMMENDED: Set OPENAI_API_KEY in .env and install the openai package.")
            print("   1. Install requirements: pip install -r backend/requirements.txt")
            print("   2. Add OPENAI_API_KEY=sk-... to .env")
            print("\n🔗 Or use the website at: http://localhost:8000")
            print("" + "=" * 70 + "\n")
            return

        orchestrator.run_full_pipeline()
        orchestrator.print_summary()

        with open('output/pipeline_results.json', 'w') as f:
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
