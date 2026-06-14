"""
Demo Video Script - 3-5 Minutes for Hackathon Submission
Follow this script to create a compelling demo video
"""

DEMO_SCRIPT = """
╔════════════════════════════════════════════════════════════════════════════╗
║         SUPPLY CHAIN DISRUPTION AGENT - DEMO VIDEO SCRIPT                 ║
║                        3-5 Minute Presentation                            ║
╚════════════════════════════════════════════════════════════════════════════╝

=== OPENING (30 seconds) ===

"Hello! I'm demonstrating the Smart Supply Chain Disruption Agent - an intelligent
multi-agent system powered by OpenAI that helps companies detect and respond to
supply chain disruptions in real-time.

The Problem:
- Supply chain disruptions cost companies billions annually
- Weather, strikes, traffic, and supplier issues cause delays
- Current systems rely on manual monitoring and slow response times

Our Solution:
- A 5-agent orchestration system using OpenAI APIs
- Real-time disruption detection and impact assessment  
- Automated recommendations and stakeholder notifications
"

=== ARCHITECTURE OVERVIEW (45 seconds) ===

[SHOW: Project folder structure on screen]

"This system has 5 specialized agents that work together:

1. SUPPLIER HEALTH MONITOR - Tracks vendor performance metrics
2. DISRUPTION DETECTOR - Identifies weather, strikes, traffic events
3. RISK ASSESSOR - Evaluates business impact and prioritizes interventions
4. MITIGATION AGENT - Recommends alternative suppliers and routes
5. STAKEHOLDER NOTIFIER - Generates automated alerts and reports

Each agent uses OpenAI's GPT-4 to analyze data and make intelligent decisions."

=== LIVE DEMO - PART 1: Running the Pipeline (1 minute 30 seconds) ===

[SHOW: Terminal window]

"Let me run the orchestrator with our sample data..."

Command: python orchestrator.py

[SHOW: Pipeline executing]

"Watch as the system processes data:

Agent 1 is monitoring our 4 suppliers...
- 3 are healthy with >90% on-time rates
- 1 is at-risk with recent delays

Agent 2 detects 3 active disruptions:
- Typhoon approaching South China Sea (48-hour delay)
- Port strike in Rotterdam (24-hour delay)  
- Traffic delays on US Interstate 80 (6-hour delay)

Agent 3 assesses the impact:
- 4 shipments are identified as at-risk
- Total value at risk: $295,000
- Priority score: HIGH

Agent 4 recommends mitigation:
- Activate alternative suppliers (TechComps, EuroLogistics)
- Expedite critical shipments via air freight
- Reroute to avoid affected ports
- Total mitigation cost: $29,500
- Projected ROI: 2.0x (saves $59,000 potential loss)

Agent 5 generates stakeholder alerts:
- Operations: Activate backup suppliers
- Finance: Review $29,500 cost
- Customer Service: Prepare customer communications
- Executive: Cost-benefit analysis shows PROCEED
"

=== LIVE DEMO - PART 2: Dashboard Visualization (1 minute) ===

[SWITCH TO: Streamlit dashboard - streamlit run dashboard.py]

"This interactive dashboard shows:

[SHOW: Overview tab]
- 6 critical alerts for high-severity disruptions
- Supplier health breakdown: 3 healthy, 1 at-risk
- Disruption severity distribution

[CLICK: Suppliers tab]
- All suppliers with performance metrics
- On-time rates: 92%, 88%, 95%, 85%
- Risk scores visualized

[CLICK: Disruptions tab]
- Map of active disruptions by location
- Timeline of when disruptions are expected

[CLICK: Shipments tab]
- Which shipments are at-risk
- Critical shipment CPU processors ($120K) is most at-risk
- Total at-risk value clearly shown

[CLICK: Risk Analysis tab]
- Top 10 at-risk shipments ranked
- Risk scores calculated by AI

[CLICK: Recommendations tab]
- Specific action items
- Cost-benefit analysis
- Decision: PROCEED with 200% ROI
"

=== KEY FEATURES HIGHLIGHT (45 seconds) ===

"Key Technical Achievements:

✓ Multi-Agent Orchestration
  - 5 specialized agents working in sequence
  - Each agent provides input to the next
  - Automated decision-making pipeline

✓ OpenAI Integration
  - Uses GPT-4 for intelligent analysis
  - Function calling for structured decisions
  - Prompt engineering for domain-specific reasoning

✓ Real Business Impact
  - Identifies $295K in at-risk shipments
  - Recommends $29.5K mitigation (saves $59K loss)
  - 2x ROI justifies investment

✓ Visualization & Reporting
  - Interactive Streamlit dashboard
  - Professional HTML reports
  - Executive summaries with metrics

✓ Extensible Architecture
  - Easy to integrate real APIs (weather, ports, ERP)
  - Pluggable data sources
  - Scalable to production environment
"

=== DEMO MODE FEATURE (30 seconds) ===

[SHOW: Running demo_mode.py]

"One unique feature: We have a DEMO MODE that runs without an OpenAI API key.
This is perfect for testing and presentations.

python demo_mode.py

[SHOW OUTPUT]

The demo mode simulates all agent execution with mock analysis results.
Perfect for showing the system architecture without API costs!"

=== CLOSING (30 seconds) ===

"In Summary:

This Supply Chain Disruption Agent demonstrates:
✓ Advanced multi-agent architecture
✓ Real-world business problem solving
✓ OpenAI API integration best practices
✓ Scalable from demo to production

The system delivers:
- 20+ metrics in real-time monitoring
- Automated disruption detection
- Cost-benefit justified recommendations
- Stakeholder communication automation

With this solution, supply chain teams can:
- Detect disruptions 10x faster
- Make data-driven decisions
- Reduce supply chain risk
- Improve customer satisfaction

This is the future of intelligent supply chain management.

Thank you!"

=== RECORDING TIPS ===

1. TEST BEFOREHAND
   - Ensure all APIs are ready
   - Run orchestrator 2-3 times to verify output
   - Test dashboard locally first

2. ZOOM LEVEL
   - Terminal: 125-150% zoom for readability
   - Dashboard: Full window
   - Use 1920x1080 resolution

3. SPEAK CLEARLY
   - Pause between sections
   - Point to key numbers
   - Emphasize business impact

4. TIMING
   - Keep total video to 3-5 minutes
   - Don't rush the demo
   - Include a brief intro/conclusion

5. QUALITY CHECKLIST
   - Clear audio (no background noise)
   - Visible text in terminal
   - Smooth transitions between sections
   - Show business value in metrics

=== SCRIPT TIMING BREAKDOWN ===

Opening:                 30 seconds
Architecture Overview:   45 seconds
Live Demo (Pipeline):   90 seconds
Live Demo (Dashboard):  60 seconds
Features Highlight:     45 seconds
Demo Mode:              30 seconds
Closing:                30 seconds
────────────────────────────────
TOTAL:                 330 seconds (5.5 minutes)

* Cut to 3 minutes by reducing "Live Demo" sections to 30 seconds each
"""

def print_script():
    print(DEMO_SCRIPT)

if __name__ == "__main__":
    print_script()
    
    # Save to file
    with open('DEMO_VIDEO_SCRIPT.txt', 'w') as f:
        f.write(DEMO_SCRIPT)
    
    print("\n✓ Script saved to DEMO_VIDEO_SCRIPT.txt")
