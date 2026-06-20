# 🚀 Ollama Setup Guide

Get Ollama running in 3 minutes!

---

## Step 1: Download & Install (1 minute)

### Option A: Download Installer (Easiest)
1. Go to: **https://ollama.ai**
2. Click "Download for Windows"
3. Run the installer
4. Restart your computer

### Option B: PowerShell Install
```powershell
# Download installer
Invoke-WebRequest -Uri "https://ollama.ai/download/OllamaSetup.exe" -OutFile "$env:TEMP\OllamaSetup.exe"

# Run it
& "$env:TEMP\OllamaSetup.exe"

# Restart when done
```

---

## Step 2: Start Ollama (1 minute)

After installation, open **Command Prompt** or **PowerShell** and run:

```bash
ollama serve
```

You should see:
```
2024/06/18 10:35:22 loaded model...
Listening on 127.0.0.1:11434
```

**Keep this window open!** (Don't close it)

---

## Step 3: Pull a Model (1 minute)

Open a **NEW Command Prompt** or **PowerShell** window and run:

```bash
ollama pull mistral
```

This downloads the AI model (~4GB). Takes 2-5 minutes depending on your internet.

After download completes, you'll see:
```
Pulling digest: ...
...
Success!
```

---

## Step 4: Run Your Copilot! 

Go back to your first terminal window (running `ollama serve`) - keep it running.

Then run the copilot:

```bash
streamlit run copilot_chat.py
```

Now the copilot will have full AI powers! 🤖

---

## ✅ Verify Setup

### Check Ollama is Running
```bash
curl http://localhost:11434/api/tags
```

Should return JSON with available models.

### Test Ask Question
```bash
curl -X POST http://localhost:11434/api/generate -d '{"model":"mistral","prompt":"What is supply chain?"}'
```

Should return a response.

---

## 🔧 Troubleshooting

### "Command not found: ollama"
- Restart your computer after installation
- Check that installer finished successfully
- Try adding Ollama to PATH: `C:\Users\[YourUsername]\AppData\Local\Programs\Ollama`

### "Connection refused" when running Copilot
- Make sure `ollama serve` is still running in another terminal
- Don't close the Ollama terminal!

### "Waiting for model download" (stuck)
- This is normal - first model download takes time
- Restart if stuck >30 minutes

### Slow responses
- Ollama is running locally on your machine
- More CPU/RAM = faster responses
- Mistral model is optimized for speed

---

## 📊 Available Models

### Fast (Good for Demo)
```bash
ollama pull mistral  # Fastest, ~7B params - USE THIS
```

### Medium Quality
```bash
ollama pull neural-chat  # Good balance
ollama pull llama2  # Popular, ~7B params
```

### High Quality (Slow)
```bash
ollama pull llama2:13b  # More accurate but slower
```

---

## 🎯 Complete Flow

1. **Terminal 1:** `ollama serve` (keep running)
2. **Terminal 2:** `ollama pull mistral` (download model)
3. **Terminal 3:** `streamlit run copilot_chat.py` (run copilot)
4. Open browser: `http://localhost:8502`
5. Ask questions! ✨

---

## 💡 Try These Questions

Once everything is running:

- "How can we reduce supplier risk?"
- "What strategies work for supply chain optimization?"
- "How do we handle disruptions?"
- "What metrics matter for suppliers?"
- Or ask anything supply chain related!

The AI will give you intelligent answers based on supply chain expertise.

---

## 🆘 Still Having Issues?

1. Make sure you restarted your computer after install
2. Check Task Manager - is "Ollama" process running?
3. Try: `tasklist | find "Ollama"` to see if it's running
4. Verify port 11434 is open: `netstat -ano | find "11434"`

---

## 📌 Quick Reference

| What | Command |
|------|---------|
| Start Ollama | `ollama serve` |
| Download Model | `ollama pull mistral` |
| Test API | `curl http://localhost:11434/api/tags` |
| Run Copilot | `streamlit run copilot_chat.py` |
| Access App | http://localhost:8502 |

---

**You're all set! Enjoy your AI-powered supply chain copilot!** 🚀
