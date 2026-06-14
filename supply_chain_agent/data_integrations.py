"""
Data Integration Examples
Templates for connecting to real data sources
"""

import json
import requests
from typing import Dict, List
from datetime import datetime


# ============================================================================
# EXAMPLE 1: Weather Data Integration (OpenWeatherMap API)
# ============================================================================

class WeatherDataIntegration:
    """Example: Integrate weather API to detect weather-based disruptions"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"
    
    def get_weather_data(self, location: str) -> Dict:
        """
        Fetch weather data for a location
        Example location: "Shanghai,CN"
        """
        params = {
            'q': location,
            'appid': self.api_key
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            data = response.json()
            
            return {
                'location': location,
                'weather': data.get('weather', [{}])[0].get('main'),
                'description': data.get('weather', [{}])[0].get('description'),
                'wind_speed': data.get('wind', {}).get('speed'),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {'error': str(e)}


# ============================================================================
# EXAMPLE 2: Port Status Integration (Fictitious API)
# ============================================================================

class PortStatusIntegration:
    """Example: Integrate port status API to detect port disruptions"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.ports-data.example.com/status"
    
    def get_port_status(self, port_code: str) -> Dict:
        """
        Fetch port status
        Example port_code: "SHGH" (Shanghai), "ROTT" (Rotterdam)
        """
        # This is a mock implementation - replace with real API
        mock_data = {
            'SHGH': {'status': 'affected', 'reason': 'Typhoon approaching', 'estimated_recovery': '48h'},
            'ROTT': {'status': 'disrupted', 'reason': 'Port strike', 'estimated_recovery': '24h'},
            'NYKA': {'status': 'normal', 'reason': None, 'estimated_recovery': None}
        }
        
        return {
            'port_code': port_code,
            'data': mock_data.get(port_code, {'status': 'unknown'}),
            'timestamp': datetime.now().isoformat()
        }


# ============================================================================
# EXAMPLE 3: Traffic/Logistics Data Integration
# ============================================================================

class TrafficDataIntegration:
    """Example: Integrate traffic/route data to optimize shipping routes"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.traffic-data.example.com/routes"
    
    def get_route_status(self, origin: str, destination: str) -> Dict:
        """
        Get route status and estimated time
        Example: origin="Shanghai", destination="New York"
        """
        # This is a mock implementation
        return {
            'origin': origin,
            'destination': destination,
            'optimal_route': 'Suez Canal',
            'estimated_days': 14,
            'congestion_level': 'low',
            'alternative_routes': [
                {'route': 'Cape of Good Hope', 'estimated_days': 28, 'risk': 'high'},
                {'route': 'Air Freight', 'estimated_days': 1, 'cost_multiplier': 5}
            ],
            'timestamp': datetime.now().isoformat()
        }


# ============================================================================
# EXAMPLE 4: Supplier System Integration (Enterprise API)
# ============================================================================

class SupplierSystemIntegration:
    """Example: Integrate with supplier management systems"""
    
    def __init__(self, api_endpoint: str, api_key: str):
        self.endpoint = api_endpoint
        self.api_key = api_key
    
    def get_supplier_performance(self, supplier_id: str) -> Dict:
        """
        Fetch real supplier performance metrics
        This would connect to your ERP/procurement system
        """
        headers = {'Authorization': f'Bearer {self.api_key}'}
        
        try:
            # Example: GET /api/suppliers/{supplier_id}/performance
            url = f"{self.endpoint}/api/suppliers/{supplier_id}/performance"
            response = requests.get(url, headers=headers)
            
            return response.json()
        except Exception as e:
            return {'error': str(e)}
    
    def get_shipment_status(self, shipment_id: str) -> Dict:
        """
        Fetch real shipment tracking data
        """
        headers = {'Authorization': f'Bearer {self.api_key}'}
        
        try:
            url = f"{self.endpoint}/api/shipments/{shipment_id}/tracking"
            response = requests.get(url, headers=headers)
            
            return response.json()
        except Exception as e:
            return {'error': str(e)}


# ============================================================================
# EXAMPLE 5: News/Event Data Integration
# ============================================================================

class NewsEventIntegration:
    """Example: Integrate news API to detect supply chain events"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://newsapi.org/v2/everything"
    
    def search_disruption_events(self, keywords: str = "port strike supply chain") -> List[Dict]:
        """
        Search for supply chain related news and events
        """
        params = {
            'q': keywords,
            'sortBy': 'publishedAt',
            'apiKey': self.api_key
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            articles = response.json().get('articles', [])
            
            return [
                {
                    'title': article.get('title'),
                    'description': article.get('description'),
                    'published_at': article.get('publishedAt'),
                    'source': article.get('source', {}).get('name')
                }
                for article in articles[:10]  # Top 10
            ]
        except Exception as e:
            return [{'error': str(e)}]


# ============================================================================
# EXAMPLE 6: Database Integration (SQL)
# ============================================================================

class DatabaseIntegration:
    """Example: Direct database integration for supplier/shipment data"""
    
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
    
    def get_suppliers_from_db(self) -> List[Dict]:
        """
        Fetch suppliers from SQL database
        This is pseudocode - implement with your DB connector
        """
        # Example SQL query:
        # SELECT supplier_id, name, location, on_time_rate, risk_score 
        # FROM suppliers WHERE status = 'active'
        
        import pyodbc  # Example for SQL Server
        
        try:
            conn = pyodbc.connect(self.connection_string)
            cursor = conn.cursor()
            
            query = """
            SELECT supplier_id, name, location, on_time_rate, risk_score 
            FROM suppliers WHERE status = 'active'
            """
            
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            
            suppliers = []
            for row in cursor.fetchall():
                suppliers.append(dict(zip(columns, row)))
            
            conn.close()
            return suppliers
        except Exception as e:
            print(f"Database error: {e}")
            return []
    
    def get_active_shipments_from_db(self) -> List[Dict]:
        """
        Fetch active shipments from database
        """
        # Similar pattern to get_suppliers_from_db()
        pass


# ============================================================================
# EXAMPLE 7: Machine Learning Model Integration
# ============================================================================

class MLModelIntegration:
    """Example: Integrate ML model for disruption prediction"""
    
    def __init__(self, model_endpoint: str):
        self.endpoint = model_endpoint
    
    def predict_disruption_risk(self, supplier_id: str, route: str) -> Dict:
        """
        Call ML model to predict disruption probability
        """
        payload = {
            'supplier_id': supplier_id,
            'route': route,
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            # Example: POST to model API
            response = requests.post(
                f"{self.endpoint}/predict",
                json=payload,
                timeout=10
            )
            
            prediction = response.json()
            return {
                'supplier_id': supplier_id,
                'disruption_probability': prediction.get('probability', 0),
                'risk_factors': prediction.get('risk_factors', []),
                'confidence': prediction.get('confidence', 0)
            }
        except Exception as e:
            return {'error': str(e)}


# ============================================================================
# USAGE EXAMPLES
# ============================================================================

def example_usage():
    """Example of how to use these integrations"""
    
    # 1. Weather Integration
    # weather = WeatherDataIntegration(api_key="your_weather_api_key")
    # shanghai_weather = weather.get_weather_data("Shanghai,CN")
    # print(shanghai_weather)
    
    # 2. Port Status
    # ports = PortStatusIntegration(api_key="your_api_key")
    # port_status = ports.get_port_status("SHGH")
    # print(port_status)
    
    # 3. Traffic/Routes
    # traffic = TrafficDataIntegration(api_key="your_api_key")
    # route = traffic.get_route_status("Shanghai", "New York")
    # print(route)
    
    # 4. Supplier System
    # supplier_sys = SupplierSystemIntegration(
    #     api_endpoint="https://your-erp-system.com",
    #     api_key="your_api_key"
    # )
    # perf = supplier_sys.get_supplier_performance("SUP001")
    # print(perf)
    
    # 5. News Events
    # news = NewsEventIntegration(api_key="your_newsapi_key")
    # events = news.search_disruption_events()
    # print(events)
    
    # 6. Database
    # db = DatabaseIntegration("Driver={ODBC Driver 17 for SQL Server};...")
    # suppliers = db.get_suppliers_from_db()
    # print(suppliers)
    
    # 7. ML Model
    # ml = MLModelIntegration(model_endpoint="https://ml-service.example.com")
    # prediction = ml.predict_disruption_risk("SUP001", "Shanghai-NYC")
    # print(prediction)
    
    pass


if __name__ == "__main__":
    print("Data Integration Templates - See example_usage() for implementation patterns")
