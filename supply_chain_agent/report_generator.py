"""
Enhanced HTML Report Generator
Produces professional PDF-style HTML reports
"""

import json
from datetime import datetime
from typing import Dict, List


class HTMLReportGenerator:
    """Generate professional HTML reports"""
    
    def __init__(self, title="Supply Chain Analysis Report"):
        self.title = title
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def get_css(self) -> str:
        """Generate CSS styling"""
        return """
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; background: white; }
            header { border-bottom: 3px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { color: #0066cc; font-size: 2.5em; margin-bottom: 10px; }
            h2 { color: #0066cc; font-size: 1.8em; margin: 30px 0 15px 0; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }
            h3 { color: #333; font-size: 1.3em; margin: 20px 0 10px 0; }
            .metadata { font-size: 0.9em; color: #666; }
            .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
            .metric-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .metric-value { font-size: 2em; font-weight: bold; }
            .metric-label { font-size: 0.9em; opacity: 0.9; margin-top: 5px; }
            .alert { padding: 15px; margin: 15px 0; border-radius: 5px; }
            .alert-critical { background: #fee; border-left: 4px solid #f44336; }
            .alert-high { background: #fff3cd; border-left: 4px solid #ff9800; }
            .alert-medium { background: #e3f2fd; border-left: 4px solid #2196f3; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            table th { background: #0066cc; color: white; padding: 12px; text-align: left; }
            table td { padding: 10px; border-bottom: 1px solid #ddd; }
            table tr:hover { background: #f5f5f5; }
            .status-success { color: #4caf50; font-weight: bold; }
            .status-warning { color: #ff9800; font-weight: bold; }
            .status-error { color: #f44336; font-weight: bold; }
            .recommendation { background: #f0f7ff; padding: 15px; margin: 15px 0; border-left: 4px solid #0066cc; border-radius: 4px; }
            .cost-breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
            .cost-item { background: #fafafa; padding: 15px; border-radius: 5px; border: 1px solid #e0e0e0; }
            .cost-item .label { font-weight: bold; color: #666; }
            .cost-item .value { font-size: 1.5em; color: #0066cc; font-weight: bold; margin-top: 5px; }
            footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 0.9em; }
            .page-break { page-break-after: always; }
        </style>
        """
    
    def generate_header(self) -> str:
        """Generate report header"""
        return f"""
        <header>
            <h1>📊 {self.title}</h1>
            <p class="metadata">
                <strong>Generated:</strong> {self.timestamp}<br>
                <strong>Report ID:</strong> SC-REPORT-{datetime.now().strftime('%Y%m%d%H%M%S')}<br>
                <strong>Status:</strong> <span class="status-success">✓ Complete</span>
            </p>
        </header>
        """
    
    def generate_metrics(self, suppliers: List, shipments: List, disruptions: List) -> str:
        """Generate key metrics section"""
        
        healthy_suppliers = sum(1 for s in suppliers if s.get('on_time_rate', 0) > 0.90)
        at_risk_suppliers = len(suppliers) - healthy_suppliers
        high_severity = sum(1 for d in disruptions if d.get('severity') == 'high')
        total_delay = sum(d.get('estimated_delay_hours', 0) for d in disruptions)
        
        return f"""
        <h2>Executive Summary - Key Metrics</h2>
        <div class="metrics">
            <div class="metric-card">
                <div class="metric-label">Total Suppliers</div>
                <div class="metric-value">{len(suppliers)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Healthy Suppliers</div>
                <div class="metric-value">{healthy_suppliers}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">At-Risk Suppliers</div>
                <div class="metric-value">{at_risk_suppliers}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Active Disruptions</div>
                <div class="metric-value">{len(disruptions)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Critical Events</div>
                <div class="metric-value">{high_severity}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total Delay Hours</div>
                <div class="metric-value">{total_delay}</div>
            </div>
        </div>
        """
    
    def generate_suppliers_section(self, suppliers: List) -> str:
        """Generate suppliers analysis section"""
        
        rows = ""
        for supplier in suppliers:
            health = "✓ Healthy" if supplier.get('on_time_rate', 0) > 0.90 else "⚠ At Risk"
            rows += f"""
            <tr>
                <td>{supplier.get('name', 'N/A')}</td>
                <td>{supplier.get('location', 'N/A')}</td>
                <td>{supplier.get('on_time_rate', 0):.1%}</td>
                <td>{supplier.get('risk_score', 0):.2f}</td>
                <td>{health}</td>
            </tr>
            """
        
        return f"""
        <h2>Supplier Analysis</h2>
        <table>
            <thead>
                <tr>
                    <th>Supplier Name</th>
                    <th>Location</th>
                    <th>On-Time Rate</th>
                    <th>Risk Score</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
        """
    
    def generate_disruptions_section(self, disruptions: List) -> str:
        """Generate disruptions analysis section"""
        
        rows = ""
        for disruption in disruptions:
            severity_class = f"alert-{disruption.get('severity', 'medium')}"
            rows += f"""
            <tr>
                <td>{disruption.get('type', 'N/A').upper()}</td>
                <td>{disruption.get('location', 'N/A')}</td>
                <td>{disruption.get('description', 'N/A')}</td>
                <td><span class="{severity_class}">{disruption.get('severity', 'unknown').upper()}</span></td>
                <td>{disruption.get('estimated_delay_hours', 0)} hours</td>
            </tr>
            """
        
        return f"""
        <h2>Active Disruptions</h2>
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Estimated Delay</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
        """
    
    def generate_recommendations_section(self, at_risk_value: float, mitigation_cost: float) -> str:
        """Generate recommendations section"""
        
        roi = ((at_risk_value * 0.20 - mitigation_cost) / mitigation_cost * 100) if mitigation_cost > 0 else 0
        
        return f"""
        <h2>Recommendations & Action Plan</h2>
        
        <h3>Immediate Actions Required</h3>
        <div class="recommendation">
            <strong>1. Activate Alternative Suppliers</strong><br>
            Use backup suppliers for high-risk shipments. Recommended suppliers: TechComps USA, EuroLogistics Ltd
        </div>
        
        <div class="recommendation">
            <strong>2. Expedite Critical Shipments</strong><br>
            Implement air freight for critical priority shipments to avoid port delays
        </div>
        
        <div class="recommendation">
            <strong>3. Route Optimization</strong><br>
            Reroute shipments to avoid affected ports/routes. Expected time recovery: 12-24 hours
        </div>
        
        <div class="recommendation">
            <strong>4. Stakeholder Communication</strong><br>
            Prepare proactive customer notifications and coordinate with operations team
        </div>
        
        <h3>Cost-Benefit Analysis</h3>
        <div class="cost-breakdown">
            <div class="cost-item">
                <div class="label">Total Value at Risk</div>
                <div class="value">${at_risk_value:,.0f}</div>
            </div>
            <div class="cost-item">
                <div class="label">Estimated Loss (if not mitigated)</div>
                <div class="value">${at_risk_value * 0.20:,.0f}</div>
            </div>
            <div class="cost-item">
                <div class="label">Total Mitigation Cost</div>
                <div class="value">${mitigation_cost:,.0f}</div>
            </div>
            <div class="cost-item">
                <div class="label">Net Benefit</div>
                <div class="value">${at_risk_value * 0.20 - mitigation_cost:,.0f}</div>
            </div>
            <div class="cost-item">
                <div class="label">ROI</div>
                <div class="value">{roi:.0f}%</div>
            </div>
        </div>
        
        <h3>Decision</h3>
        {'<div class="alert alert-critical">✓ RECOMMENDATION: PROCEED WITH MITIGATION - Strong positive ROI</div>' if roi > 50 else '<div class="alert alert-high">⚠ RECOMMENDATION: Review with finance team</div>'}
        """
    
    def generate_footer(self) -> str:
        """Generate report footer"""
        return f"""
        <footer>
            <p>This report was generated by the Supply Chain Disruption Agent</p>
            <p>HCLTech-OpenAI Agentic AI Hackathon 2026 | Confidential</p>
        </footer>
        """
    
    def generate_full_report(self, suppliers: List, shipments: List, disruptions: List, at_risk_value: float = 0) -> str:
        """Generate complete HTML report"""
        
        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{self.title}</title>
            {self.get_css()}
        </head>
        <body>
            <div class="container">
                {self.generate_header()}
                {self.generate_metrics(suppliers, shipments, disruptions)}
                {self.generate_suppliers_section(suppliers)}
                <div class="page-break"></div>
                {self.generate_disruptions_section(disruptions)}
                <div class="page-break"></div>
                {self.generate_recommendations_section(at_risk_value, at_risk_value * 0.10)}
                {self.generate_footer()}
            </div>
        </body>
        </html>
        """
        
        return html
    
    def save_report(self, html: str, filename: str = "output/report.html"):
        """Save HTML report to file"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html)
        return filename


def generate_report(suppliers_file="data/suppliers.json", shipments_file="data/shipments.json", 
                   disruptions_file="data/disruptions.json", output_file="output/report.html"):
    """Generate and save HTML report"""
    
    # Load data
    with open(suppliers_file, 'r') as f:
        suppliers = json.load(f)['suppliers']
    with open(shipments_file, 'r') as f:
        shipments = json.load(f)['shipments']
    with open(disruptions_file, 'r') as f:
        disruptions = json.load(f)['active_disruptions']
    
    # Calculate at-risk value
    at_risk_value = sum(s['value'] for s in shipments) * 0.6  # Estimate
    
    # Generate report
    generator = HTMLReportGenerator("Supply Chain Disruption Analysis - Executive Report")
    html = generator.generate_full_report(suppliers, shipments, disruptions, at_risk_value)
    filename = generator.save_report(html, output_file)
    
    print(f"✓ Report generated: {filename}")
    return filename


if __name__ == "__main__":
    generate_report()
