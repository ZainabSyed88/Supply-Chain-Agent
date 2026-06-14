# Quick Start Guide - Supply Chain Disruption Agent

## 🚀 Getting Started in 5 Minutes

### Step 1: Navigate to Project
```bash
cd c:\Users\dell\OneDrive\Desktop\my_project_hackathon\supply_chain_agent
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Set Up OpenAI API Key
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-...
```

### Step 4: Run the Agent
```bash
python orchestrator.py
```

## 📊 What the Agent Does

The orchestrator will:
1. Load supplier, shipment, and disruption data
2. Run 5 agents in sequence:
   - **Agent 1**: Monitor supplier health
   - **Agent 2**: Detect disruptions
   - **Agent 3**: Assess risks
   - **Agent 4**: Recommend mitigation
   - **Agent 5**: Generate stakeholder alerts

3. Generate analysis results and executive summary
4. Save results to `output/pipeline_results.json`

## 📁 Project Files

- `agents/` - Individual agent implementations
- `data/` - Sample supplier, shipment, and disruption data
- `orchestrator.py` - Main coordination script
- `config.py` - Configuration settings
- `utils/helpers.py` - Utility functions

## 🎯 Key Features

✅ Multi-agent orchestration
✅ Real-time disruption detection
✅ Risk-based prioritization
✅ Cost-benefit analysis
✅ Automated stakeholder notifications

## 🔍 Mock Data Included

**Suppliers**: 4 suppliers with different risk profiles
**Shipments**: 4 active shipments with various priorities
**Disruptions**: 3 active disruptions (weather, strike, traffic)

## ⚙️ Configuration

Edit `config.py` to customize:
- OpenAI model selection
- Agent temperature settings
- Risk thresholds
- Data file locations

## 💡 Next Steps

1. **Test with mock data** (run as-is)
2. **Integrate real data** from your systems
3. **Add external APIs** (weather, traffic, port status)
4. **Create demo video** for hackathon submission
5. **Deploy to production**

## 📝 Notes

- The project uses mock data for demonstration
- All agents use OpenAI GPT-4 for analysis
- Results are logged and saved to JSON
- Executive summary is printed to console

---

**For detailed information, see README.md**
