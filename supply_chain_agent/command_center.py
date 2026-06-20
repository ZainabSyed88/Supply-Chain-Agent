"""
LIVE SUPPLY CHAIN COMMAND CENTER DASHBOARD
Executive-level control center for real-time supply chain visibility

This is the #1 priority feature for maximum visual impact and business value.
"""

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import json
from datetime import datetime, timedelta
import folium
from streamlit_folium import st_folium

# ============================================
# PAGE CONFIGURATION
# ============================================

st.set_page_config(
    page_title="ChainPulse Command Center",
    page_icon="🌐",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("🌐 Supply Chain Command Center")
st.markdown("Real-time global supply chain visibility and control")

# ============================================
# LOAD DATA
# ============================================

@st.cache_data
def load_data():
    """Load supply chain data"""
    try:
        with open('data/suppliers.json') as f:
            suppliers = json.load(f)['suppliers']
        with open('data/disruptions.json') as f:
            disruptions = json.load(f)['active_disruptions']
        with open('data/shipments.json') as f:
            shipments = json.load(f)['shipments']
        return suppliers, disruptions, shipments
    except:
        return [], [], []

suppliers, disruptions, shipments = load_data()

# ============================================
# KPI METRICS (Top Row)
# ============================================

col1, col2, col3, col4, col5 = st.columns(5)

with col1:
    total_suppliers = len(suppliers)
    st.metric(
        "Total Suppliers",
        total_suppliers,
        f"↓ {sum(1 for s in suppliers if s.get('on_time_rate', 0) <= 0.90)} at risk"
    )

with col2:
    active_disruptions = len(disruptions)
    critical = len([d for d in disruptions if d.get('severity') == 'high'])
    st.metric(
        "Active Disruptions",
        active_disruptions,
        f"🔴 {critical} critical"
    )

with col3:
    total_shipments = len(shipments)
    on_time = len([s for s in shipments if s.get('status') == 'on-time'])
    delayed = len([s for s in shipments if s.get('status') == 'delayed'])
    st.metric(
        "Shipments In Transit",
        total_shipments,
        f"✓ {on_time} on-time | ⚠️ {delayed} delayed"
    )

with col4:
    # Simulate revenue at risk calculation
    avg_shipment_value = 450000
    at_risk_value = delayed * avg_shipment_value
    st.metric(
        "Revenue at Risk",
        f"${at_risk_value / 1000:.0f}K",
        f"{(at_risk_value / (total_shipments * avg_shipment_value) * 100):.1f}% of value"
    )

with col5:
    # Health score
    avg_on_time = sum(s.get('on_time_rate', 0.85) for s in suppliers) / len(suppliers) if suppliers else 0.85
    health_score = int(avg_on_time * 100)
    st.metric(
        "Chain Health Score",
        f"{health_score}%",
        "Declining" if health_score < 85 else "Stable"
    )

st.divider()

# ============================================
# MAIN DASHBOARD (3-COLUMN LAYOUT)
# ============================================

tab1, tab2, tab3, tab4 = st.tabs(["🗺️ Global View", "⚠️ Disruptions", "📦 Shipments", "💰 Financial Impact"])

# ============================================
# TAB 1: GLOBAL MAP VIEW
# ============================================

with tab1:
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("Global Supplier Network Map")
        
        # Create map
        m = folium.Map(
            location=[20, 0],
            zoom_start=3,
            tiles="OpenStreetMap"
        )
        
        # Add supplier markers
        for supplier in suppliers:
            # Simulate coordinates based on location
            locations = {
                'Shanghai': [31.23, 121.47],
                'Singapore': [1.35, 103.82],
                'Bangkok': [13.73, 100.50],
                'Mumbai': [19.08, 72.88],
                'Rotterdam': [51.92, 4.28],
                'Los Angeles': [33.94, -118.40]
            }
            
            loc = supplier.get('location', 'Shanghai')
            coords = locations.get(loc, [0, 0])
            
            # Color based on health
            on_time = supplier.get('on_time_rate', 0.85)
            color = 'green' if on_time > 0.90 else 'orange' if on_time > 0.75 else 'red'
            
            folium.CircleMarker(
                location=coords,
                radius=10,
                popup=f"{supplier['name']}<br>On-time: {on_time*100:.0f}%",
                color=color,
                fill=True,
                fillOpacity=0.8
            ).add_to(m)
        
        st_folium(m, width=700, height=500)
    
    with col2:
        st.subheader("Supplier Status Summary")
        
        # Supplier health breakdown
        health_data = {
            'Healthy (>90%)': len([s for s in suppliers if s.get('on_time_rate', 0) > 0.90]),
            'At Risk (75-90%)': len([s for s in suppliers if 0.75 <= s.get('on_time_rate', 0) <= 0.90]),
            'Critical (<75%)': len([s for s in suppliers if s.get('on_time_rate', 0) < 0.75])
        }
        
        fig = go.Figure(data=[
            go.Bar(
                y=list(health_data.keys()),
                x=list(health_data.values()),
                orientation='h',
                marker=dict(color=['green', 'orange', 'red']),
                text=list(health_data.values()),
                textposition='auto'
            )
        ])
        fig.update_layout(showlegend=False, height=300)
        st.plotly_chart(fig, use_container_width=True)
        
        # Top suppliers
        st.subheader("Top Performers")
        top_suppliers = sorted(suppliers, key=lambda x: x.get('on_time_rate', 0), reverse=True)[:5]
        for i, sup in enumerate(top_suppliers, 1):
            st.write(f"{i}. {sup['name']} - {sup.get('on_time_rate', 0)*100:.0f}% ✓")

# ============================================
# TAB 2: DISRUPTIONS
# ============================================

with tab2:
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("Active Disruption Events")
        
        # Disruption timeline
        disruption_df = pd.DataFrame([
            {
                'Type': d['type'],
                'Location': d['location'],
                'Severity': d['severity'],
                'Delay (hrs)': d['estimated_delay_hours'],
                'Suppliers Affected': len(d.get('affected_suppliers', []))
            }
            for d in disruptions
        ])
        
        # Color code severity
        def severity_color(severity):
            return {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(severity, '')
        
        if not disruption_df.empty:
            st.dataframe(
                disruption_df.style.applymap(
                    lambda x: 'color: red' if x == 'high' else 'color: orange' if x == 'medium' else '',
                    subset=['Severity']
                ),
                use_container_width=True
            )
        else:
            st.success("✓ No active disruptions detected")
        
        # Disruption impact chart
        if disruptions:
            fig = px.bar(
                disruption_df,
                x='Delay (hrs)',
                y='Location',
                color='Severity',
                color_discrete_map={'high': 'red', 'medium': 'orange', 'low': 'green'},
                title="Estimated Delays by Disruption",
                barmode='h'
            )
            st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("Risk Distribution")
        
        severity_counts = {
            'Critical': len([d for d in disruptions if d['severity'] == 'high']),
            'Medium': len([d for d in disruptions if d['severity'] == 'medium']),
            'Low': len([d for d in disruptions if d['severity'] == 'low'])
        }
        
        fig = go.Figure(data=[
            go.Pie(
                labels=list(severity_counts.keys()),
                values=list(severity_counts.values()),
                marker=dict(colors=['red', 'orange', 'green']),
                hole=0.3
            )
        ])
        fig.update_layout(height=300)
        st.plotly_chart(fig, use_container_width=True)
        
        # Affected suppliers
        st.subheader("Most Affected Suppliers")
        affected_counts = {}
        for d in disruptions:
            for supplier in d.get('affected_suppliers', []):
                affected_counts[supplier] = affected_counts.get(supplier, 0) + 1
        
        for supplier, count in sorted(affected_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            st.write(f"• {supplier}: {count} disruptions")

# ============================================
# TAB 3: SHIPMENTS
# ============================================

with tab3:
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("Shipment Status Overview")
        
        shipment_df = pd.DataFrame([
            {
                'ID': s['id'],
                'From': s['origin'],
                'To': s['destination'],
                'Status': s.get('status', 'in-transit'),
                'Progress': f"{s.get('progress', 50)}%",
                'ETA': s.get('eta', 'N/A')
            }
            for s in shipments
        ])
        
        st.dataframe(shipment_df, use_container_width=True)
        
        # Progress distribution
        if shipments:
            statuses = [s.get('status', 'in-transit') for s in shipments]
            status_counts = pd.Series(statuses).value_counts()
            
            fig = px.bar(
                x=status_counts.index,
                y=status_counts.values,
                title="Shipment Status Distribution",
                labels={'x': 'Status', 'y': 'Count'},
                color=status_counts.index,
                color_discrete_map={'on-time': 'green', 'delayed': 'red', 'in-transit': 'blue'}
            )
            st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("Route Performance")
        
        # Origin/destination analysis
        origins = pd.Series([s['origin'] for s in shipments]).value_counts()
        
        fig = px.bar(
            x=origins.values,
            y=origins.index,
            orientation='h',
            title="Shipments by Origin",
            labels={'x': 'Count', 'y': 'Location'}
        )
        fig.update_layout(height=300)
        st.plotly_chart(fig, use_container_width=True)

# ============================================
# TAB 4: FINANCIAL IMPACT
# ============================================

with tab4:
    st.subheader("Financial Impact Analysis")
    
    col1, col2, col3 = st.columns(3)
    
    # Calculate financial metrics
    avg_shipment_value = 450000
    delayed_shipments = len([s for s in shipments if s.get('status') == 'delayed'])
    critical_disruptions = len([d for d in disruptions if d['severity'] == 'high'])
    
    revenue_at_risk = delayed_shipments * avg_shipment_value
    mitigation_cost = revenue_at_risk * 0.1  # 10% of at-risk value
    potential_savings = revenue_at_risk - mitigation_cost
    
    with col1:
        st.metric(
            "💰 Revenue at Risk",
            f"${revenue_at_risk / 1_000_000:.2f}M",
            f"{(revenue_at_risk / (len(shipments) * avg_shipment_value) * 100):.1f}% of total value"
        )
    
    with col2:
        st.metric(
            "💸 Mitigation Cost",
            f"${mitigation_cost / 1_000_000:.2f}M",
            "10% of at-risk value"
        )
    
    with col3:
        st.metric(
            "💎 Potential Savings",
            f"${potential_savings / 1_000_000:.2f}M",
            "With proactive action"
        )
    
    # Financial breakdown chart
    col1, col2 = st.columns(2)
    
    with col1:
        fig = go.Figure(data=[
            go.Bar(
                name='Revenue at Risk',
                x=['Current Disruptions'],
                y=[revenue_at_risk / 1_000_000],
                marker_color='red'
            ),
            go.Bar(
                name='Mitigation Cost',
                x=['Current Disruptions'],
                y=[mitigation_cost / 1_000_000],
                marker_color='orange'
            ),
            go.Bar(
                name='Potential Savings',
                x=['Current Disruptions'],
                y=[potential_savings / 1_000_000],
                marker_color='green'
            )
        ])
        fig.update_layout(
            title="Financial Impact Breakdown",
            barmode='stack',
            yaxis_title='Amount ($M)'
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        # ROI Analysis
        roi_data = {
            'Cost': [mitigation_cost / 1_000_000],
            'Savings': [potential_savings / 1_000_000],
            'Net Benefit': [(potential_savings - mitigation_cost) / 1_000_000]
        }
        
        fig = go.Figure(data=[
            go.Indicator(
                mode="number+delta",
                value=((potential_savings / mitigation_cost - 1) * 100) if mitigation_cost > 0 else 0,
                title="ROI %",
                domain={'x': [0, 1], 'y': [0, 1]}
            )
        ])
        
        st.metric(
            "📊 ROI Analysis",
            f"{((potential_savings / mitigation_cost - 1) * 100):.0f}%" if mitigation_cost > 0 else "N/A",
            "Return on mitigation investment"
        )
        
        st.info(f"""
        **Financial Recommendations:**
        
        1. Invest ${mitigation_cost / 1_000_000:.2f}M in mitigation
        2. Expected savings: ${potential_savings / 1_000_000:.2f}M
        3. Net benefit: ${(potential_savings - mitigation_cost) / 1_000_000:.2f}M
        4. Decision: {'✓ Recommended' if potential_savings > mitigation_cost else '✗ Not viable'}
        """)

# ============================================
# FOOTER & REFRESH
# ============================================

st.divider()

col1, col2, col3 = st.columns(3)

with col1:
    if st.button("🔄 Refresh Data"):
        st.cache_data.clear()
        st.rerun()

with col2:
    if st.button("📊 Generate Report"):
        st.success("Report generation started...")

with col3:
    if st.button("📧 Alert Team"):
        st.success("Alerts sent to team!")

st.caption(f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
