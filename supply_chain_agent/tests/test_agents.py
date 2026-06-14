"""
Unit tests for Supply Chain Disruption Agent
Run with: pytest tests/
"""

import pytest
import json
from agents.supplier_monitor_agent import SupplierMonitorAgent
from agents.disruption_detector_agent import DisruptionDetectorAgent
from agents.risk_assessment_agent import RiskAssessmentAgent


class TestSupplierMonitor:
    """Test Supplier Monitor Agent"""
    
    def test_load_suppliers(self):
        """Test supplier data loading"""
        agent = SupplierMonitorAgent(None)
        suppliers = agent.load_suppliers('data/suppliers.json')
        
        assert len(suppliers) > 0
        assert all('id' in s and 'name' in s for s in suppliers)
    
    def test_monitor_performance(self):
        """Test performance monitoring"""
        agent = SupplierMonitorAgent(None)
        suppliers = agent.load_suppliers('data/suppliers.json')
        
        result = agent.monitor_performance(suppliers)
        
        assert result['status'] == 'success'
        assert 'metrics' in result
        assert result['metrics']['total_suppliers'] == len(suppliers)
        assert result['metrics']['healthy'] + result['metrics']['at_risk'] == len(suppliers)


class TestDisruptionDetector:
    """Test Disruption Detector Agent"""
    
    def test_load_disruptions(self):
        """Test disruption data loading"""
        agent = DisruptionDetectorAgent(None)
        disruptions = agent.load_disruptions('data/disruptions.json')
        
        assert len(disruptions) > 0
        assert all('type' in d and 'severity' in d for d in disruptions)
    
    def test_assess_risk_levels(self):
        """Test risk level assessment"""
        agent = DisruptionDetectorAgent(None)
        disruptions = agent.load_disruptions('data/disruptions.json')
        
        result = agent.assess_risk_levels(disruptions)
        
        assert result['status'] == 'success'
        assert 'risk_levels' in result
        assert result['total_estimated_delay_hours'] >= 0


class TestRiskAssessment:
    """Test Risk Assessment Agent"""
    
    def test_load_shipments(self):
        """Test shipment data loading"""
        agent = RiskAssessmentAgent(None)
        shipments = agent.load_shipments('data/shipments.json')
        
        assert len(shipments) > 0
        assert all('id' in s and 'value' in s for s in shipments)
    
    def test_prioritize_interventions(self):
        """Test intervention prioritization"""
        with open('data/disruptions.json', 'r') as f:
            disruptions = json.load(f)['active_disruptions']
        
        agent = RiskAssessmentAgent(None)
        result = agent.prioritize_interventions(disruptions, agent.load_shipments('data/shipments.json'))
        
        assert result['status'] == 'success'
        assert 'at_risk_shipments' in result
        assert result['total_at_risk'] >= 0


class TestDataIntegrity:
    """Test data file integrity"""
    
    def test_suppliers_json_format(self):
        """Test suppliers.json structure"""
        with open('data/suppliers.json', 'r') as f:
            data = json.load(f)
        
        assert 'suppliers' in data
        assert isinstance(data['suppliers'], list)
        assert len(data['suppliers']) > 0
    
    def test_shipments_json_format(self):
        """Test shipments.json structure"""
        with open('data/shipments.json', 'r') as f:
            data = json.load(f)
        
        assert 'shipments' in data
        assert isinstance(data['shipments'], list)
        assert len(data['shipments']) > 0
    
    def test_disruptions_json_format(self):
        """Test disruptions.json structure"""
        with open('data/disruptions.json', 'r') as f:
            data = json.load(f)
        
        assert 'active_disruptions' in data
        assert isinstance(data['active_disruptions'], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
