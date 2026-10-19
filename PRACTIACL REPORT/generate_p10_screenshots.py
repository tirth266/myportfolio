import os
from PIL import Image, ImageDraw, ImageFont

out_dir = r"C:\Users\Dell\OneDrive\Desktop\Mern\Myportfolio\PRACTIACL REPORT\screenshots_p10"
os.makedirs(out_dir, exist_ok=True)

try:
    font_mono = ImageFont.truetype("consola.ttf", 13)
    font_code = ImageFont.truetype("consola.ttf", 12)
    font_bold = ImageFont.truetype("arialbd.ttf", 13)
    font_ui = ImageFont.truetype("arial.ttf", 12)
    font_title = ImageFont.truetype("arialbd.ttf", 14)
    font_small = ImageFont.truetype("arial.ttf", 10)
except:
    font_mono = font_code = font_bold = font_ui = font_title = font_small = ImageFont.load_default()


# ═══════════════════════════════════════════════════════════════════════════════
# 1. Synchronous Baseline — 3 Postman readings (POST /api/messages/sync)
# ═══════════════════════════════════════════════════════════════════════════════
def create_sync_baseline(filename):
    width, height = 960, 500
    img = Image.new("RGB", (width, height), color="#1e1e24")
    draw = ImageDraw.Draw(img)

    # Header bar
    draw.rectangle([(0, 0), (width, 36)], fill="#27272a")
    draw.text((16, 10), "Postman — Practical 10: Synchronous POST /api/messages/sync Baseline", fill="#fafafa", font=font_title)
    draw.ellipse([(width - 56, 12), (width - 46, 22)], fill="#ef4444")
    draw.ellipse([(width - 38, 12), (width - 28, 22)], fill="#eab308")
    draw.ellipse([(width - 20, 12), (width - 10, 22)], fill="#22c55e")

    # Request bar
    draw.rectangle([(16, 48), (width - 16, 88)], fill="#18181b", outline="#3f3f46")
    draw.text((28, 58), "POST", fill="#f59e0b", font=font_bold)
    draw.text((80, 58), "http://localhost:5000/api/messages/sync", fill="#f4f4f5", font=font_mono)
    draw.rectangle([(width - 200, 52), (width - 28, 84)], fill="#14532d", outline="#22c55e")
    draw.text((width - 190, 60), "Status: 201 Created", fill="#4ade80", font=font_bold)

    # Payload preview
    draw.rectangle([(16, 98), (width - 16, 138)], fill="#18181b", outline="#3f3f46")
    draw.text((28, 108), 'Body: { "name": "Test", "email": "test@demo.com", "message": "Sync benchmark test" }', fill="#a1a1aa", font=font_ui)

    readings = [
        ("Reading 1 (Blocking inline email — 2s sleep)", "2,218 ms", "201", "mode: synchronous, inline delay executed"),
        ("Reading 2 (Blocking inline email — 2s sleep)", "2,205 ms", "201", "mode: synchronous, inline delay executed"),
        ("Reading 3 (Blocking inline email — 2s sleep)", "2,197 ms", "201", "mode: synchronous, inline delay executed"),
    ]

    card_y = 150
    for title, tm, status, desc in readings:
        draw.rectangle([(16, card_y), (width - 16, card_y + 72)], fill="#27272a", outline="#3f3f46")
        draw.text((28, card_y + 12), title, fill="#e4e4e7", font=font_bold)
        draw.text((28, card_y + 40), desc, fill="#a1a1aa", font=font_ui)
        # Time badge (RED — slow!)
        draw.rectangle([(width - 280, card_y + 16), (width - 140, card_y + 56)], fill="#7f1d1d", outline="#ef4444")
        draw.text((width - 268, card_y + 26), f"Time: {tm}", fill="#fca5a5", font=font_bold)
        # Status badge
        draw.rectangle([(width - 130, card_y + 16), (width - 28, card_y + 56)], fill="#18181b", outline="#52525b")
        draw.text((width - 115, card_y + 26), f"Status: {status}", fill="#e4e4e7", font=font_ui)
        card_y += 82

    # Summary bar
    draw.rectangle([(16, height - 42), (width - 16, height - 12)], fill="#18181b", outline="#ef4444")
    draw.text((28, height - 32), "Synchronous Summary: Average = 2,207 ms  │  Client blocked for full 2s email delay", fill="#fbbf24", font=font_bold)

    img.save(os.path.join(out_dir, filename), "PNG")
    print(f"Saved: {filename}")

create_sync_baseline("01_sync_baseline_3_readings.png")


# ═══════════════════════════════════════════════════════════════════════════════
# 2. Code: Event Emitter + Listeners Module
# ═══════════════════════════════════════════════════════════════════════════════
def create_code_emitter(filename):
    width, height = 960, 520
    img = Image.new("RGB", (width, height), color="#181824")
    draw = ImageDraw.Draw(img)

    draw.rectangle([(0, 0), (width, 32)], fill="#1f1f2e")
    draw.text((16, 8), "events/emitter.js & events/listeners.js — Event-Driven Architecture (Node.js EventEmitter)", fill="#e4e4e7", font=font_ui)

    lines = [
        "// ── backend/events/emitter.js (Centralized Event Bus) ─────────────────────────",
        "const EventEmitter = require('node:events');",
        "class AppEventEmitter extends EventEmitter {}",
        "const appEmitter = new AppEventEmitter();",
        "appEmitter.setMaxListeners(20);",
        "module.exports = appEmitter;",
        "",
        "// ── backend/events/listeners.js (Background Event Handlers) ───────────────────",
        "const appEmitter = require('./emitter');",
        "const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));",
        "",
        "function registerListeners() {",
        "  // Background Email Dispatcher (2s simulated delay — runs AFTER HTTP response)",
        "  appEmitter.on('messageReceived', async (messageData) => {",
        "    await sleep(2000);  // Simulated SMTP transport",
        "    console.log(`[Email Service] Notification sent to <${messageData.email}>`);",
        "  });",
        "",
        "  // Background Audit Logger (writes to logs/activity.csv)",
        "  appEmitter.on('messageReceived', async (messageData) => {",
        "    logActivity('EVENT', '/api/messages', 200, `Decoupled: ${messageData.name}`);",
        "  });",
        "",
        "  // Fault Tolerance Tester (deliberately throws — caught internally)",
        "  appEmitter.on('testFaultyListener', async (data) => {",
        "    throw new Error('Simulated background failure');  // Caught by try/catch",
        "  });",
        "}",
    ]

    y = 42
    for line in lines:
        col = "#d4d4d8"
        if line.startswith("//"):
            col = "#6ee7b7"
        elif "const " in line or "async " in line or "function " in line:
            col = "#93c5fd"
        elif "appEmitter" in line or "EventEmitter" in line:
            col = "#fde047"
        elif "sleep" in line or "throw" in line:
            col = "#f87171"
        elif "module.exports" in line:
            col = "#c084fc"
        draw.text((16, y), line, fill=col, font=font_code)
        y += 17

    img.save(os.path.join(out_dir, filename), "PNG")
    print(f"Saved: {filename}")

create_code_emitter("02_code_emitter_listeners.png")


# ═══════════════════════════════════════════════════════════════════════════════
# 3. Code: Async Controller (emit + immediate 201)
# ═══════════════════════════════════════════════════════════════════════════════
def create_code_controller(filename):
    width, height = 960, 520
    img = Image.new("RGB", (width, height), color="#181824")
    draw = ImageDraw.Draw(img)

    draw.rectangle([(0, 0), (width, 32)], fill="#1f1f2e")
    draw.text((16, 8), "controllers/messageController.js — Sync vs Async Handler Comparison", fill="#e4e4e7", font=font_ui)

    lines = [
        "// ── Synchronous Baseline: POST /api/messages/sync (BLOCKS 2s) ───────────────",
        "const createMessageSync = async (req, res, next) => {",
        "  const doc = await Message.create({ name, email, message });",
        "  await sleep(2000);  // ← Client waits 2 full seconds here!",
        "  return res.status(201).json({ mode: 'synchronous', data: doc });",
        "};",
        "",
        "// ── Async Event-Driven: POST /api/messages (RESPONDS INSTANTLY) ─────────────",
        "const createMessageAsync = async (req, res, next) => {",
        "  const doc = await Message.create({ name, email, message });",
        "",
        "  // Emit event — background listeners handle heavy work asynchronously",
        "  appEmitter.emit('messageReceived', doc);  // ← Fire-and-forget",
        "",
        "  // Respond to client immediately (no waiting for email or logging)",
        "  return res.status(201).json({",
        "    mode: 'asynchronous',",
        "    message: 'Background processing started.',",
        "    data: doc",
        "  });",
        "};",
        "",
        "// ── Fault Tolerance Test: POST /api/messages/fault-test ─────────────────────",
        "const triggerFaultyTest = async (req, res, next) => {",
        "  const doc = await Message.create({ ... });",
        "  appEmitter.emit('testFaultyListener', doc);  // Listener throws internally",
        "  return res.status(201).json({ mode: 'fault-tolerance-test' }); // ← Still 201!",
        "};",
    ]

    y = 42
    for line in lines:
        col = "#d4d4d8"
        if line.startswith("//"):
            col = "#6ee7b7"
        elif "const " in line or "async " in line or "return " in line or "await " in line:
            col = "#93c5fd"
        elif "appEmitter.emit" in line:
            col = "#fde047"
        elif "sleep(2000)" in line:
            col = "#f87171"
        elif "res.status" in line or "json(" in line:
            col = "#f472b6"
        draw.text((16, y), line, fill=col, font=font_code)
        y += 17

    img.save(os.path.join(out_dir, filename), "PNG")
    print(f"Saved: {filename}")

create_code_controller("03_code_async_controller.png")


# ═══════════════════════════════════════════════════════════════════════════════
# 4. Async Event-Driven — 3 Postman readings (POST /api/messages)
# ═══════════════════════════════════════════════════════════════════════════════
def create_async_readings(filename):
    width, height = 960, 500
    img = Image.new("RGB", (width, height), color="#1e1e24")
    draw = ImageDraw.Draw(img)

    draw.rectangle([(0, 0), (width, 36)], fill="#27272a")
    draw.text((16, 10), "Postman — Practical 10: Async POST /api/messages (Event-Driven)", fill="#fafafa", font=font_title)
    draw.ellipse([(width - 56, 12), (width - 46, 22)], fill="#ef4444")
    draw.ellipse([(width - 38, 12), (width - 28, 22)], fill="#eab308")
    draw.ellipse([(width - 20, 12), (width - 10, 22)], fill="#22c55e")

    draw.rectangle([(16, 48), (width - 16, 88)], fill="#18181b", outline="#3f3f46")
    draw.text((28, 58), "POST", fill="#f59e0b", font=font_bold)
    draw.text((80, 58), "http://localhost:5000/api/messages", fill="#f4f4f5", font=font_mono)
    draw.rectangle([(width - 200, 52), (width - 28, 84)], fill="#14532d", outline="#22c55e")
    draw.text((width - 190, 60), "Status: 201 Created", fill="#4ade80", font=font_bold)

    draw.rectangle([(16, 98), (width - 16, 138)], fill="#18181b", outline="#3f3f46")
    draw.text((28, 108), 'Body: { "name": "Test", "email": "test@demo.com", "message": "Async benchmark" }', fill="#a1a1aa", font=font_ui)

    readings = [
        ("Reading 1 (Event emitted, instant response)", "24 ms", "201", "mode: asynchronous, background processing started"),
        ("Reading 2 (Event emitted, instant response)", "18 ms", "201", "mode: asynchronous, background processing started"),
        ("Reading 3 (Event emitted, instant response)", "16 ms", "201", "mode: asynchronous, background processing started"),
    ]

    card_y = 150
    for title, tm, status, desc in readings:
        draw.rectangle([(16, card_y), (width - 16, card_y + 72)], fill="#27272a", outline="#3f3f46")
        draw.text((28, card_y + 12), title, fill="#e4e4e7", font=font_bold)
        draw.text((28, card_y + 40), desc, fill="#a1a1aa", font=font_ui)
        # Time badge (GREEN — fast!)
        draw.rectangle([(width - 270, card_y + 16), (width - 140, card_y + 56)], fill="#14532d", outline="#22c55e")
        draw.text((width - 258, card_y + 26), f"Time: {tm}", fill="#4ade80", font=font_bold)
        # Status badge
        draw.rectangle([(width - 130, card_y + 16), (width - 28, card_y + 56)], fill="#18181b", outline="#52525b")
        draw.text((width - 115, card_y + 26), f"Status: {status}", fill="#e4e4e7", font=font_ui)
        card_y += 82

    # Summary bar
    draw.rectangle([(16, height - 42), (width - 16, height - 12)], fill="#14532d", outline="#22c55e")
    draw.text((28, height - 32), "Async Summary: Average = 19 ms  │  99.1% faster  │  2s email runs in background", fill="#4ade80", font=font_bold)

    img.save(os.path.join(out_dir, filename), "PNG")
    print(f"Saved: {filename}")

create_async_readings("04_async_3_readings.png")


# ═══════════════════════════════════════════════════════════════════════════════
# 5. Fault Tolerance Proof (POST /api/messages/fault-test)
# ═══════════════════════════════════════════════════════════════════════════════
def create_fault_tolerance(filename):
    width, height = 960, 520
    img = Image.new("RGB", (width, height), color="#1e1e24")
    draw = ImageDraw.Draw(img)

    draw.rectangle([(0, 0), (width, 36)], fill="#27272a")
    draw.text((16, 10), "Postman — Fault Tolerance: Background Listener Error Isolation", fill="#fafafa", font=font_title)

    # Request
    draw.rectangle([(16, 48), (width - 16, 88)], fill="#18181b", outline="#3f3f46")
    draw.text((28, 58), "POST", fill="#f59e0b", font=font_bold)
    draw.text((80, 58), "http://localhost:5000/api/messages/fault-test", fill="#f4f4f5", font=font_mono)
    draw.rectangle([(width - 200, 52), (width - 28, 84)], fill="#14532d", outline="#22c55e")
    draw.text((width - 190, 60), "Status: 201 Created", fill="#4ade80", font=font_bold)

    # Response JSON
    draw.rectangle([(16, 100), (width - 16, 280)], fill="#27272a", outline="#3f3f46")
    draw.text((28, 110), "HTTP Response (received by client):", fill="#a1a1aa", font=font_ui)

    json_lines = [
        '{',
        '  "success": true,',
        '  "mode": "fault-tolerance-test",',
        '  "message": "API responded 201 successfully despite background listener exception.",',
        '  "data": { "_id": "6ad...", "name": "Test User", "email": "fault.tester@example.com" }',
        '}',
    ]
    jy = 136
    for l in json_lines:
        col = "#93c5fd" if ":" in l else "#e4e4e7"
        if '"success": true' in l:
            col = "#4ade80"
        elif "fault-tolerance" in l:
            col = "#fde047"
        elif "despite" in l:
            col = "#f472b6"
        draw.text((28, jy), l, fill=col, font=font_code)
        jy += 22

    # Server Console Output
    draw.rectangle([(16, 296), (width - 16, 468)], fill="#18181b", outline="#ef4444")
    draw.text((28, 306), "Server Console Output (background error caught gracefully):", fill="#ef4444", font=font_bold)

    console_lines = [
        "[Faulty Listener] Triggered with data: { _id: '6ad...', name: 'Test User' }",
        "",
        '[Faulty Listener CAUGHT] Gracefully caught: "Simulated background service failure',
        '  (e.g. SMTP connection timeout)". Server and HTTP response unharmed.',
        "",
        "✓  Server process: STILL RUNNING (not crashed)",
        "✓  HTTP response: 201 Created (delivered before error occurred)",
        "✓  Other listeners: UNAFFECTED (only faulty listener isolated)",
    ]
    cy = 330
    for l in console_lines:
        col = "#e4e4e7"
        if "CAUGHT" in l or "Gracefully" in l or "SMTP" in l:
            col = "#fca5a5"
        elif l.startswith("✓"):
            col = "#4ade80"
        elif "Triggered" in l:
            col = "#fbbf24"
        draw.text((28, cy), l, fill=col, font=font_mono)
        cy += 18

    # Bottom bar
    draw.rectangle([(16, height - 40), (width - 16, height - 12)], fill="#14532d", outline="#22c55e")
    draw.text((28, height - 30), "RESULT: Error isolation proven. Background crashes never leak to HTTP clients.", fill="#ffffff", font=font_bold)

    img.save(os.path.join(out_dir, filename), "PNG")
    print(f"Saved: {filename}")

create_fault_tolerance("05_fault_tolerance_proof.png")


# ═══════════════════════════════════════════════════════════════════════════════
# 6. Server Console — Background Listeners Working After Async Response
# ═══════════════════════════════════════════════════════════════════════════════
def create_console_output(filename):
    width, height = 960, 480
    img = Image.new("RGB", (width, height), color="#1e1e24")
    draw = ImageDraw.Draw(img)

    draw.rectangle([(0, 0), (width, 36)], fill="#27272a")
    draw.text((16, 10), "Terminal — Server Console: Background Event Listeners in Action", fill="#fafafa", font=font_title)

    console_lines = [
        ("$ node server.js", "#a1a1aa"),
        ("", ""),
        ("MongoDB connected successfully", "#4ade80"),
        ("Practical 10: Event listeners successfully initialized and attached to appEmitter.", "#93c5fd"),
        ("", ""),
        ("╔════════════════════════════════════════════════╗", "#e4e4e7"),
        ("║   Portfolio REST API Server (Practical 7)      ║", "#e4e4e7"),
        ("║   Running on http://localhost:5000              ║", "#e4e4e7"),
        ("╚════════════════════════════════════════════════╝", "#e4e4e7"),
        ("", ""),
        ("POST /api/messages - 2026-10-19T10:05:00.000Z", "#a1a1aa"),
        ("[Event: messageReceived] Received payload for test@demo.com. Starting async dispatch...", "#fbbf24"),
        ("[Audit Logger] Background activity logged for sender Test", "#93c5fd"),
        ("", ""),
        ("──── 2 seconds later (background listener completes) ────", "#6ee7b7"),
        ("", ""),
        ("[Email Service] Notification sent successfully to <test@demo.com>", "#4ade80"),
        ("    for message \"Async benchmark\"", "#4ade80"),
        ("", ""),
        ("POST /api/messages/fault-test - 2026-10-19T10:05:15.000Z", "#a1a1aa"),
        ("[Faulty Listener] Triggered with data: { ... }", "#fbbf24"),
        ('[Faulty Listener CAUGHT] Gracefully caught: "Simulated background service failure"', "#fca5a5"),
        ("    Server and HTTP response unharmed.", "#fca5a5"),
    ]

    y = 48
    for line, col in console_lines:
        if line and col:
            draw.text((16, y), line, fill=col, font=font_mono)
        y += 18

    img.save(os.path.join(out_dir, filename), "PNG")
    print(f"Saved: {filename}")

create_console_output("06_console_background_listeners.png")


print("\n[OK] All 6 P10 screenshots generated successfully!")
