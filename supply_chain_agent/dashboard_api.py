"""
Mobile Dashboard API Server
Serves the mobile-responsive dashboard and provides REST API endpoints
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='website', static_url_path='')
CORS(app)

# ============================================
# CONFIGURATION
# ============================================

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
PORT = 5000
HOST = '0.0.0.0'  # Accessible from any network

# ============================================
# UTILITY FUNCTIONS
# ============================================

def load_json_file(filename):
    """Load JSON data from file"""
    filepath = os.path.join(DATA_DIR, filename)
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning(f"File not found: {filepath}")
        return {}
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON in: {filepath}")
        return {}


def save_json_file(filename, data):
    """Save JSON data to file"""
    filepath = os.path.join(DATA_DIR, filename)
    try:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving file {filepath}: {e}")
        return False


def calculate_health_score(suppliers, disruptions):
    """Calculate overall supply chain health score"""
    if not suppliers:
        return 85
    
    # Average on-time rate
    avg_on_time = sum(s.get('on_time_rate', 0.85) for s in suppliers) / len(suppliers)
    
    # Disruption impact (each disruption reduces score by 5%)
    disruption_impact = max(0, 1 - (len(disruptions) * 0.05))
    
    # Weighted health score
    health_score = int((avg_on_time * 0.7 + disruption_impact * 0.3) * 100)
    return max(0, min(100, health_score))


# ============================================
# STATIC FILES
# ============================================

@app.route('/')
def index():
    """Serve the mobile dashboard"""
    return send_from_directory('website', 'mobile_dashboard.html')


@app.route('/dashboard')
def dashboard():
    """Serve the mobile dashboard"""
    return send_from_directory('website', 'mobile_dashboard.html')


@app.route('/styles/<path:filename>')
def serve_styles(filename):
    """Serve CSS files"""
    return send_from_directory('website', filename, mimetype='text/css')


@app.route('/scripts/<path:filename>')
def serve_scripts(filename):
    """Serve JavaScript files"""
    return send_from_directory('website', filename, mimetype='text/javascript')


# ============================================
# API ENDPOINTS - DATA
# ============================================

@app.route('/api/suppliers', methods=['GET'])
def get_suppliers():
    """Get all suppliers"""
    data = load_json_file('suppliers.json')
    suppliers = data.get('suppliers', [])
    
    # Filter by location if provided
    location = request.args.get('location')
    if location:
        suppliers = [s for s in suppliers if s.get('location') == location]
    
    # Filter by health status if provided
    status = request.args.get('status')
    if status == 'healthy':
        suppliers = [s for s in suppliers if s.get('on_time_rate', 0) > 0.90]
    elif status == 'at-risk':
        suppliers = [s for s in suppliers if s.get('on_time_rate', 0) <= 0.90]
    
    return jsonify({
        'success': True,
        'count': len(suppliers),
        'suppliers': suppliers
    })


@app.route('/api/suppliers/<int:supplier_id>', methods=['GET'])
def get_supplier(supplier_id):
    """Get specific supplier details"""
    data = load_json_file('suppliers.json')
    suppliers = data.get('suppliers', [])
    
    supplier = next((s for s in suppliers if s.get('id') == supplier_id), None)
    
    if supplier:
        return jsonify({
            'success': True,
            'supplier': supplier
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Supplier not found'
        }), 404


@app.route('/api/disruptions', methods=['GET'])
def get_disruptions():
    """Get all active disruptions"""
    data = load_json_file('disruptions.json')
    disruptions = data.get('active_disruptions', [])
    
    # Filter by severity if provided
    severity = request.args.get('severity')
    if severity:
        disruptions = [d for d in disruptions if d.get('severity') == severity]
    
    return jsonify({
        'success': True,
        'count': len(disruptions),
        'disruptions': disruptions
    })


@app.route('/api/shipments', methods=['GET'])
def get_shipments():
    """Get all shipments"""
    data = load_json_file('shipments.json')
    shipments = data.get('shipments', [])
    
    # Filter by status if provided
    status = request.args.get('status')
    if status:
        shipments = [s for s in shipments if s.get('status') == status]
    
    return jsonify({
        'success': True,
        'count': len(shipments),
        'shipments': shipments
    })


@app.route('/api/shipments/<shipment_id>', methods=['GET'])
def get_shipment(shipment_id):
    """Get specific shipment details"""
    data = load_json_file('shipments.json')
    shipments = data.get('shipments', [])
    
    shipment = next((s for s in shipments if s.get('id') == shipment_id), None)
    
    if shipment:
        return jsonify({
            'success': True,
            'shipment': shipment
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Shipment not found'
        }), 404


# ============================================
# API ENDPOINTS - ANALYTICS
# ============================================

@app.route('/api/analytics/dashboard', methods=['GET'])
def get_dashboard_analytics():
    """Get dashboard overview metrics"""
    suppliers_data = load_json_file('suppliers.json')
    disruptions_data = load_json_file('disruptions.json')
    shipments_data = load_json_file('shipments.json')
    
    suppliers = suppliers_data.get('suppliers', [])
    disruptions = disruptions_data.get('active_disruptions', [])
    shipments = shipments_data.get('shipments', [])
    
    # Calculate metrics
    health_score = calculate_health_score(suppliers, disruptions)
    
    healthy_suppliers = len([s for s in suppliers if s.get('on_time_rate', 0) > 0.90])
    
    on_time_shipments = len([s for s in shipments if s.get('status') == 'on-time'])
    delayed_shipments = len([s for s in shipments if s.get('status') == 'delayed'])
    
    disruptions_by_severity = {
        'high': len([d for d in disruptions if d.get('severity') == 'high']),
        'medium': len([d for d in disruptions if d.get('severity') == 'medium']),
        'low': len([d for d in disruptions if d.get('severity') == 'low'])
    }
    
    return jsonify({
        'success': True,
        'metrics': {
            'health_score': health_score,
            'total_suppliers': len(suppliers),
            'healthy_suppliers': healthy_suppliers,
            'at_risk_suppliers': len(suppliers) - healthy_suppliers,
            'total_disruptions': len(disruptions),
            'disruptions_by_severity': disruptions_by_severity,
            'total_shipments': len(shipments),
            'on_time_shipments': on_time_shipments,
            'delayed_shipments': delayed_shipments,
            'on_time_rate': round((on_time_shipments / len(shipments) * 100) if shipments else 0, 1)
        }
    })


@app.route('/api/analytics/risk-distribution', methods=['GET'])
def get_risk_distribution():
    """Get risk distribution data"""
    suppliers_data = load_json_file('suppliers.json')
    suppliers = suppliers_data.get('suppliers', [])
    
    low_risk = len([s for s in suppliers if s.get('risk_score', 50) < 33])
    medium_risk = len([s for s in suppliers if 33 <= s.get('risk_score', 50) < 67])
    high_risk = len([s for s in suppliers if s.get('risk_score', 50) >= 67])
    
    return jsonify({
        'success': True,
        'data': {
            'low_risk': low_risk,
            'medium_risk': medium_risk,
            'high_risk': high_risk
        }
    })


@app.route('/api/analytics/performance', methods=['GET'])
def get_performance_metrics():
    """Get detailed performance metrics"""
    suppliers_data = load_json_file('suppliers.json')
    suppliers = suppliers_data.get('suppliers', [])
    
    if not suppliers:
        return jsonify({'success': False, 'error': 'No suppliers found'}), 404
    
    on_time_rates = [s.get('on_time_rate', 0) for s in suppliers]
    
    return jsonify({
        'success': True,
        'metrics': {
            'average_on_time_rate': round(sum(on_time_rates) / len(on_time_rates) * 100, 1),
            'best_performing': max(suppliers, key=lambda x: x.get('on_time_rate', 0))['name'],
            'worst_performing': min(suppliers, key=lambda x: x.get('on_time_rate', 0))['name'],
            'total_suppliers': len(suppliers)
        }
    })


# ============================================
# API ENDPOINTS - ACTIONS
# ============================================

@app.route('/api/orchestrator/run', methods=['POST'])
def run_orchestrator():
    """Run the supply chain orchestrator analysis"""
    try:
        logger.info("Running orchestrator analysis...")
        
        # In a real implementation, this would call orchestrator.py
        # For now, we simulate a successful run
        
        return jsonify({
            'success': True,
            'message': 'Orchestrator analysis completed',
            'execution_time': '2.5 minutes',
            'results': {
                'disruptions_detected': 3,
                'recommendations': 5,
                'risk_score': 42
            }
        })
    except Exception as e:
        logger.error(f"Error running orchestrator: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/reports/generate', methods=['GET'])
def generate_report():
    """Generate PDF report"""
    try:
        # In a real implementation, this would generate an actual PDF
        logger.info("Generating report...")
        
        # For now, redirect to HTML report
        return send_from_directory(os.path.dirname(__file__), 'output/report.html', as_attachment=True)
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/alerts/send', methods=['POST'])
def send_alerts():
    """Send alerts to team"""
    try:
        data = request.json
        message = data.get('message', 'Supply chain alert')
        
        logger.info(f"Sending alert: {message}")
        
        # In a real implementation, this would send emails/Slack messages
        
        return jsonify({
            'success': True,
            'message': 'Alerts sent successfully',
            'recipients': 5
        })
    except Exception as e:
        logger.error(f"Error sending alerts: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/disruptions/<int:disruption_id>/acknowledge', methods=['POST'])
def acknowledge_disruption(disruption_id):
    """Acknowledge a disruption"""
    try:
        logger.info(f"Acknowledging disruption {disruption_id}")
        
        return jsonify({
            'success': True,
            'message': 'Disruption acknowledged'
        })
    except Exception as e:
        logger.error(f"Error acknowledging disruption: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================
# API ENDPOINTS - EXPORT
# ============================================

@app.route('/api/export/suppliers', methods=['GET'])
def export_suppliers():
    """Export suppliers as CSV/JSON"""
    data = load_json_file('suppliers.json')
    suppliers = data.get('suppliers', [])
    
    fmt = request.args.get('format', 'json')
    
    if fmt == 'csv':
        import csv
        from io import StringIO
        
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=['id', 'name', 'location', 'on_time_rate', 'risk_score'])
        writer.writeheader()
        writer.writerows(suppliers)
        
        return output.getvalue(), 200, {'Content-Disposition': 'attachment; filename=suppliers.csv'}
    else:
        return jsonify({
            'success': True,
            'data': suppliers
        })


@app.route('/api/export/all', methods=['GET'])
def export_all():
    """Export all data"""
    suppliers = load_json_file('suppliers.json').get('suppliers', [])
    disruptions = load_json_file('disruptions.json').get('active_disruptions', [])
    shipments = load_json_file('shipments.json').get('shipments', [])
    
    return jsonify({
        'success': True,
        'timestamp': datetime.now().isoformat(),
        'data': {
            'suppliers': suppliers,
            'disruptions': disruptions,
            'shipments': shipments
        }
    })


# ============================================
# HEALTH CHECK
# ============================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })


# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    logger.info(f"Starting Mobile Dashboard API Server on http://{HOST}:{PORT}")
    logger.info("Access dashboard at: http://localhost:5000")
    logger.info("API docs at: http://localhost:5000/api/docs")
    
    # Run Flask app
    app.run(
        host=HOST,
        port=PORT,
        debug=False,  # Set to True for development
        use_reloader=False
    )
