"""
Configuration for Supply Chain Disruption Agent
"""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = "gpt-4"

# Agent Configuration
AGENTS = {
    "supplier_monitor": {
        "name": "Supplier Health Monitor",
        "role": "Monitors vendor performance and delays",
        "temperature": 0.3
    },
    "disruption_detector": {
        "name": "Disruption Detection Agent",
        "role": "Identifies supply chain risks and disruptions",
        "temperature": 0.4
    },
    "risk_assessor": {
        "name": "Risk Assessment Agent",
        "role": "Evaluates impact and prioritizes interventions",
        "temperature": 0.3
    },
    "mitigation": {
        "name": "Mitigation Agent",
        "role": "Recommends alternative suppliers and routes",
        "temperature": 0.5
    },
    "stakeholder": {
        "name": "Stakeholder Notification Agent",
        "role": "Communicates alerts and recommendations",
        "temperature": 0.2
    }
}

# Data thresholds
DELAY_THRESHOLD_HOURS = 24
RISK_SCORE_THRESHOLD = 0.7
CRITICAL_SHIPMENT_VALUE = 50000

# Mock data paths
DATA_DIR = "data/"
SUPPLIERS_FILE = f"{DATA_DIR}suppliers.json"
SHIPMENTS_FILE = f"{DATA_DIR}shipments.json"
DISRUPTIONS_FILE = f"{DATA_DIR}disruptions.json"
