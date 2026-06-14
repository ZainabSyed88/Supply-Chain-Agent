"""
Streamlit Dashboard for Supply Chain Disruption Agent
Run with: streamlit run dashboard.py
"""

import streamlit as st
import json
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import os

st.set_page_config(page_title="Supply Chain Dashboard", layout="wide")

# Page title
st.title("🚀 Supply Chain Disruption Agent Dashboard")
st.markdown("Real-time monitoring and analysis of supply chain disruptions")

# Sidebar navigation
page = st.sidebar.radio("Navigate", ["Overview", "Suppliers", "Disruptions", "Shipments", "Risk Analysis", "Recommendations"])

# Load data
@st.cache_data
def load_data():
    suppliers = json.load(open('data/suppliers.json'))['suppliers']
    disruptions = json.load(open('data/disruptions.json'))['active_disruptions']
    shipments = json.load(open('data/shipments.json'))['shipments']
    return suppliers, disruptions, shipments

suppliers, disruptions, shipments = load_data()

# PAGE 1: Overview
if page == "Overview":
    st.header("Dashboard Overview")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Suppliers", len(suppliers))
    with col2:
        st.metric("Active Disruptions", len(disruptions))
    with col3:
        st.metric("Shipments In Transit", len(shipments))
    with col4:
        healthy = sum(1 for s in suppliers if s['on_time_rate'] > 0.90)
        st.metric("Healthy Suppliers", healthy)
    
    # Key alerts
    st.subheader("🚨 Critical Alerts")
    
    for disruption in disruptions:
        if disruption['severity'] == 'high':
            st.error(f"**{disruption['type'].upper()}** in {disruption['location']} - Est. Delay: {disruption['estimated_delay_hours']} hours")
    
    # Quick stats
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Supplier Health Status")
        health_counts = {
            'Healthy': sum(1 for s in suppliers if s['on_time_rate'] > 0.90),
            'At Risk': sum(1 for s in suppliers if s['on_time_rate'] <= 0.90)
        }
        fig = px.pie(values=health_counts.values(), names=health_counts.keys(), title="Supplier Status")
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("Disruption Severity")
        severity_counts = {
            'High': sum(1 for d in disruptions if d['severity'] == 'high'),
            'Medium': sum(1 for d in disruptions if d['severity'] == 'medium'),
            'Low': sum(1 for d in disruptions if d['severity'] == 'low')
        }
        fig = px.pie(values=severity_counts.values(), names=severity_counts.keys(), title="Disruption Severity")
        st.plotly_chart(fig, use_container_width=True)

# PAGE 2: Suppliers
elif page == "Suppliers":
    st.header("Supplier Analysis")
    
    df_suppliers = pd.DataFrame(suppliers)
    
    # Filter options
    col1, col2 = st.columns(2)
    with col1:
        filter_health = st.selectbox("Filter by Health", ["All", "Healthy", "At Risk"])
    with col2:
        filter_location = st.multiselect("Filter by Location", df_suppliers['location'].unique(), default=df_suppliers['location'].unique())
    
    # Apply filters
    filtered_df = df_suppliers.copy()
    if filter_health == "Healthy":
        filtered_df = filtered_df[filtered_df['on_time_rate'] > 0.90]
    elif filter_health == "At Risk":
        filtered_df = filtered_df[filtered_df['on_time_rate'] <= 0.90]
    
    filtered_df = filtered_df[filtered_df['location'].isin(filter_location)]
    
    # Display table
    st.dataframe(filtered_df, use_container_width=True)
    
    # Visualization
    col1, col2 = st.columns(2)
    
    with col1:
        fig = px.bar(df_suppliers, x='name', y='on_time_rate', title="Supplier On-Time Rates", color='on_time_rate')
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        fig = px.scatter(df_suppliers, x='on_time_rate', y='risk_score', size='risk_score', 
                        hover_name='name', title="Risk vs Performance", color='risk_score')
        st.plotly_chart(fig, use_container_width=True)

# PAGE 3: Disruptions
elif page == "Disruptions":
    st.header("Active Disruptions")
    
    df_disruptions = pd.DataFrame(disruptions)
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Disruptions", len(disruptions))
    with col2:
        total_delay = sum(d['estimated_delay_hours'] for d in disruptions)
        st.metric("Total Delay Hours", total_delay)
    with col3:
        critical = sum(1 for d in disruptions if d['severity'] == 'high')
        st.metric("Critical Events", critical)
    
    # Disruption details
    st.subheader("Disruption Details")
    for idx, disruption in enumerate(disruptions):
        with st.expander(f"📍 {disruption['type'].upper()} - {disruption['location']}"):
            col1, col2, col3 = st.columns(3)
            with col1:
                st.write(f"**Severity:** {disruption['severity']}")
            with col2:
                st.write(f"**Delay:** {disruption['estimated_delay_hours']} hours")
            with col3:
                st.write(f"**Affected Suppliers:** {len(disruption['affected_suppliers'])}")
            st.write(f"**Description:** {disruption['description']}")
    
    # Timeline
    st.subheader("Disruption Timeline")
    fig = px.timeline(
        df_disruptions.assign(start=disruptions[0]['timestamp']),
        x_start='start',
        y='location',
        color='severity',
        title="Disruptions Over Time"
    )
    st.plotly_chart(fig, use_container_width=True)

# PAGE 4: Shipments
elif page == "Shipments":
    st.header("Shipment Status")
    
    df_shipments = pd.DataFrame(shipments)
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Shipments", len(shipments))
    with col2:
        critical = sum(1 for s in shipments if s['priority'] == 'critical')
        st.metric("Critical Shipments", critical)
    with col3:
        total_value = sum(s['value'] for s in shipments)
        st.metric("Total Value", f"${total_value:,.0f}")
    
    # Shipment table
    st.subheader("Active Shipments")
    st.dataframe(df_shipments, use_container_width=True)
    
    # Visualizations
    col1, col2 = st.columns(2)
    
    with col1:
        priority_counts = df_shipments['priority'].value_counts()
        fig = px.bar(x=priority_counts.index, y=priority_counts.values, title="Shipments by Priority", labels={'x': 'Priority', 'y': 'Count'})
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        fig = px.scatter(df_shipments, x='value', y='priority', size='value', hover_name='id', 
                        title="Shipment Value by Priority", color='priority')
        st.plotly_chart(fig, use_container_width=True)

# PAGE 5: Risk Analysis
elif page == "Risk Analysis":
    st.header("Risk Assessment")
    
    # Calculate at-risk shipments
    at_risk = []
    for shipment in shipments:
        supplier_id = shipment['supplier_id']
        affected = any(supplier_id in d['affected_suppliers'] for d in disruptions)
        if affected:
            risk_score = (shipment['value'] / 100000) * 0.4 + (1 if shipment['priority'] == 'critical' else 0.5) * 0.3 + 0.3
            at_risk.append({
                'shipment_id': shipment['id'],
                'value': shipment['value'],
                'priority': shipment['priority'],
                'risk_score': min(risk_score, 1.0),
                'supplier': supplier_id
            })
    
    at_risk.sort(key=lambda x: x['risk_score'], reverse=True)
    
    col1, col2 = st.columns(2)
    with col1:
        st.metric("At-Risk Shipments", len(at_risk))
    with col2:
        total_at_risk = sum(s['value'] for s in at_risk)
        st.metric("Total Value at Risk", f"${total_at_risk:,.0f}")
    
    # Risk table
    st.subheader("At-Risk Shipments (Ranked)")
    if at_risk:
        df_risk = pd.DataFrame(at_risk)
        st.dataframe(df_risk, use_container_width=True)
        
        # Risk visualization
        fig = px.bar(df_risk, x='shipment_id', y='risk_score', title="Risk Scores by Shipment", color='risk_score')
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.success("✓ No shipments at risk")

# PAGE 6: Recommendations
elif page == "Recommendations":
    st.header("Mitigation Recommendations")
    
    at_risk = []
    for shipment in shipments:
        supplier_id = shipment['supplier_id']
        affected = any(supplier_id in d['affected_suppliers'] for d in disruptions)
        if affected:
            risk_score = (shipment['value'] / 100000) * 0.4 + (1 if shipment['priority'] == 'critical' else 0.5) * 0.3 + 0.3
            at_risk.append({
                'shipment_id': shipment['id'],
                'value': shipment['value'],
                'priority': shipment['priority'],
                'risk_score': min(risk_score, 1.0),
                'supplier': supplier_id
            })
    
    at_risk.sort(key=lambda x: x['risk_score'], reverse=True)
    total_at_risk_value = sum(s['value'] for s in at_risk)
    
    # Mitigation costs
    st.subheader("Mitigation Strategy & Costs")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        expedited = total_at_risk_value * 0.05
        st.metric("Expedited Shipping", f"${expedited:,.0f}")
    with col2:
        alt_supplier = total_at_risk_value * 0.03
        st.metric("Alternative Supplier", f"${alt_supplier:,.0f}")
    with col3:
        rerouting = total_at_risk_value * 0.02
        st.metric("Rerouting Cost", f"${rerouting:,.0f}")
    with col4:
        total = expedited + alt_supplier + rerouting
        st.metric("Total Mitigation", f"${total:,.0f}")
    
    # Recommendations
    st.subheader("Recommended Actions")
    
    actions = [
        ("🚀 Activate Alternative Suppliers", "Use backup suppliers for 2-3 high-risk shipments", "High Priority"),
        ("✈️ Expedite Critical Shipments", "Air freight for CPU processor shipment (SHIP003)", "Urgent"),
        ("🛣️ Optimize Routes", "Reroute via air freight to avoid port strike", "High Priority"),
        ("📞 Customer Communication", "Notify top-tier customers about potential delays", "Medium Priority")
    ]
    
    for idx, (action, detail, priority) in enumerate(actions):
        col1, col2 = st.columns([0.3, 0.7])
        with col1:
            st.write(f"**{action}**")
        with col2:
            st.write(f"{detail}")
            st.caption(f"Priority: {priority}")
    
    # Cost-benefit analysis
    st.subheader("Cost-Benefit Analysis")
    
    mitigation_cost = total_at_risk_value * 0.10
    potential_loss = total_at_risk_value * 0.20  # Estimated loss if disruption not mitigated
    net_benefit = potential_loss - mitigation_cost
    roi = (net_benefit / mitigation_cost) * 100
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Mitigation Cost", f"${mitigation_cost:,.0f}")
    with col2:
        st.metric("Potential Loss Avoided", f"${potential_loss:,.0f}")
    with col3:
        st.metric("ROI", f"{roi:.0f}%")
    
    if roi > 50:
        st.success("✅ **RECOMMENDATION: PROCEED** - Strong ROI justifies mitigation investment")
    else:
        st.warning("⚠️ Review with finance team before proceeding")

# Footer
st.divider()
st.markdown("---")
st.caption("Supply Chain Disruption Agent | Powered by Streamlit & OpenAI | HCLTech Hackathon 2026")
