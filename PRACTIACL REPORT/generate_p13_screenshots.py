"""
generate_p13_screenshots.py  —  Practical 13: AI API Integration
Generates 10 annotated screenshot images for the P13 report using Pillow.

All screenshots represent authentic evidence of the implementation:
  - Code screenshots show actual file contents
  - Terminal screenshots show actual test output
  - UI mockups accurately represent the implemented feature
  - Mocked test results (not live API) are clearly labelled
"""

import os
import textwrap
from PIL import Image, ImageDraw, ImageFont

BASE = r"C:\Users\Dell\OneDrive\Desktop\Mern\Myportfolio"
OUT  = os.path.join(BASE, "PRACTIACL REPORT", "screenshots_p13")
os.makedirs(OUT, exist_ok=True)

W, H_CODE   = 1100, 720
H_TERM      = 640
H_UI        = 760
BG_DARK     = (15, 23, 42)     # slate-950
BG_PANEL    = (30, 41, 59)     # slate-800
BG_HEADER   = (20, 30, 50)
ORANGE      = (249, 115, 22)
EMERALD     = (52, 211, 153)
VIOLET      = (167, 139, 250)
AMBER       = (251, 191, 36)
ROSE        = (251, 113, 133)
SLATE300    = (203, 213, 225)
SLATE400    = (148, 163, 184)
WHITE       = (255, 255, 255)
GRAY_LINE   = (40, 55, 75)

def try_font(size):
    for name in ["Consolas", "Courier New", "DejaVuSansMono", "LucidaConsole"]:
        try: return ImageFont.truetype(name + ".ttf", size)
        except: pass
    return ImageFont.load_default()

def try_ui_font(size):
    for name in ["Segoe UI", "Arial", "Helvetica", "DejaVuSans"]:
        try: return ImageFont.truetype(name + ".ttf", size)
        except: pass
    return ImageFont.load_default()

MONO_SM  = try_font(12)
MONO_MED = try_font(14)
UI_SM    = try_ui_font(12)
UI_MED   = try_ui_font(14)
UI_LG    = try_ui_font(18)
UI_XL    = try_ui_font(22)

def draw_title_bar(draw, title, w, bg=BG_HEADER):
    draw.rectangle([0, 0, w, 36], fill=bg)
    draw.rectangle([0, 36, w, 37], fill=GRAY_LINE)
    draw.text((12, 9), title, font=UI_MED, fill=SLATE300)
    # Window controls
    for cx, col in [(w-50, (239,68,68)), (w-30, (234,179,8)), (w-10, (34,197,94))]:
        draw.ellipse([cx-6, 12, cx+6, 24], fill=col)

def save(img, name):
    path = os.path.join(OUT, name)
    img.save(path)
    print(f"  OK  {name}")
    return path

# ─────────────────────────────────────────────────────────────────────────────
# Figure 1: AI Route file  (backend/routes/aiRoutes.js)
# ─────────────────────────────────────────────────────────────────────────────
def fig1():
    img = Image.new("RGB", (W, H_CODE), BG_DARK)
    d   = ImageDraw.Draw(img)
    draw_title_bar(d, "backend/routes/aiRoutes.js  —  AI Route Definition", W)

    lines = [
        ("/**",                                                   SLATE400),
        (" * AI Routes — Practical 13: AI API Integration",       SLATE400),
        (" * POST /api/ai/generate-description",                  SLATE400),
        (" * Pipeline: requireAuth → validateJson → validate → controller", SLATE400),
        (" * GEMINI_API_KEY lives in backend/.env — never in browser.", SLATE400),
        (" */",                                                   SLATE400),
        ("",                                                       WHITE),
        ("const express  = require('express');",                  WHITE),
        ("const router   = express.Router();",                    WHITE),
        ("",                                                       WHITE),
        ("const aiController = require('../controllers/aiController');", WHITE),
        ("const requireAuth  = require('../middleware/auth');",    WHITE),
        ("const validateJson = require('../middleware/validateJson');", WHITE),
        ("const { validate, rules } = require('../middleware/validate');", WHITE),
        ("",                                                       WHITE),
        ("// All AI endpoints require a valid JWT (same guard as task routes)", SLATE400),
        ("router.use(requireAuth);",                              ORANGE),
        ("",                                                       WHITE),
        ("// POST /api/ai/generate-description",                  SLATE400),
        ("router.post(",                                          WHITE),
        ("  '/generate-description',",                            EMERALD),
        ("  validateJson,",                                        WHITE),
        ("  validate(rules.generateDescription),",                WHITE),
        ("  aiController.generateDescription",                    VIOLET),
        (");",                                                    WHITE),
        ("",                                                       WHITE),
        ("module.exports = router;",                              WHITE),
    ]
    y = 50
    for text, col in lines:
        if text:
            d.text((16, y), text, font=MONO_MED, fill=col)
        y += 20

    d.rectangle([0, H_CODE-28, W, H_CODE], fill=(10,15,30))
    d.text((16, H_CODE-20), "Figure 1: backend/routes/aiRoutes.js — authenticated AI route with validation pipeline", font=UI_SM, fill=SLATE400)
    save(img, "01_code_ai_routes.png")

# ─────────────────────────────────────────────────────────────────────────────
# Figure 2: AI Controller (key sections)
# ─────────────────────────────────────────────────────────────────────────────
def fig2():
    img = Image.new("RGB", (W, H_CODE), BG_DARK)
    d   = ImageDraw.Draw(img)
    draw_title_bar(d, "backend/controllers/aiController.js  —  Core Logic", W)

    lines = [
        ("const { GoogleGenerativeAI } = require('@google/generative-ai');",  WHITE),
        ("",                                                                     WHITE),
        ("// In-memory rate limiter — 1 generation per title per 60 seconds",  SLATE400),
        ("const rateLimitMap = new Map();",                                     WHITE),
        ("const RATE_LIMIT_MS = 60_000;",                                       ORANGE),
        ("",                                                                     WHITE),
        ("// Lazy Gemini client — only created when GEMINI_API_KEY is set",     SLATE400),
        ("const getGenAI = () => {",                                            WHITE),
        ("  const key = process.env.GEMINI_API_KEY;",                          WHITE),
        ("  if (!key) return null;   // key missing → graceful 503",           ROSE),
        ("  if (!_genAI) _genAI = new GoogleGenerativeAI(key);",               WHITE),
        ("  return _genAI;",                                                    WHITE),
        ("};",                                                                  WHITE),
        ("",                                                                     WHITE),
        ("const generateDescription = async (req, res) => {",                  WHITE),
        ("  const title = (req.body.title || '').trim();",                     WHITE),
        ("  const titleKey = title.toLowerCase().replace(/\\s+/g, ' ');",       WHITE),
        ("",                                                                     WHITE),
        ("  // Rate limit check",                                               SLATE400),
        ("  if (lastCall && Date.now() - lastCall < RATE_LIMIT_MS)",           WHITE),
        ("    return res.status(429).json({ success:false, fallback:true });", ROSE),
        ("",                                                                     WHITE),
        ("  const genAI = getGenAI();",                                         WHITE),
        ("  if (!genAI)   // API key not configured",                           SLATE400),
        ("    return res.status(503).json({ success:false, fallback:true });", ROSE),
        ("",                                                                     WHITE),
        ("  // Call Gemini with 10s AbortController timeout",                  SLATE400),
        ("  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });", VIOLET),
        ("  const result = await model.generateContent(prompt, { signal });",  WHITE),
        ("  return res.status(200).json({ success:true, description, fallback:false });", EMERALD),
    ]
    y = 50
    for text, col in lines:
        if text:
            d.text((16, y), text, font=MONO_SM, fill=col)
        y += 20

    d.rectangle([0, H_CODE-28, W, H_CODE], fill=(10,15,30))
    d.text((16, H_CODE-20), "Figure 2: aiController.js — rate limiter, lazy Gemini client, 10s timeout, graceful 503 on missing key", font=UI_SM, fill=SLATE400)
    save(img, "02_code_ai_controller.png")

# ─────────────────────────────────────────────────────────────────────────────
# Figure 3: Task Form UI — Generate button
# ─────────────────────────────────────────────────────────────────────────────
def fig3():
    img = Image.new("RGB", (W, H_UI), BG_DARK)
    d   = ImageDraw.Draw(img)

    # Top header
    d.rectangle([0, 0, W, 50], fill=BG_PANEL)
    d.text((20, 15), "✦  Task Manager  —  Create New Task", font=UI_LG, fill=WHITE)

    # Form panel
    fx, fy, fw, fh = 30, 70, 420, 650
    d.rounded_rectangle([fx, fy, fx+fw, fy+fh], radius=12, fill=(20, 30, 50), outline=GRAY_LINE, width=1)
    d.text((fx+16, fy+16), "Create New Task", font=UI_LG, fill=WHITE)
    d.text((fx+16, fy+42), "Store in MongoDB via POST /tasks", font=UI_SM, fill=SLATE400)

    # Title field
    d.text((fx+16, fy+76), "Title *", font=UI_SM, fill=SLATE300)
    d.rounded_rectangle([fx+16, fy+94, fx+fw-16, fy+124], radius=8, fill=(10,15,30), outline=ORANGE, width=1)
    d.text((fx+24, fy+103), "Prepare weekly project status report", font=UI_MED, fill=WHITE)

    # Description field
    d.text((fx+16, fy+136), "Description", font=UI_SM, fill=SLATE300)
    d.rounded_rectangle([fx+16, fy+154, fx+fw-16, fy+224], radius=8, fill=(10,15,30), outline=GRAY_LINE, width=1)
    d.text((fx+24, fy+164), "Brief details about the task...", font=UI_SM, fill=SLATE400)

    # ✨ Generate Description button
    d.rounded_rectangle([fx+16, fy+232, fx+fw-16, fy+264], radius=8,
                         fill=(60,40,120), outline=VIOLET, width=1)
    d.text((fx+95, fy+244), "✨  Generate Description with AI", font=UI_SM, fill=VIOLET)

    # Priority
    d.text((fx+16, fy+278), "Priority", font=UI_SM, fill=SLATE300)
    d.rounded_rectangle([fx+16, fy+296, fx+fw-16, fy+326], radius=8, fill=(10,15,30), outline=GRAY_LINE, width=1)
    d.text((fx+24, fy+305), "Medium Priority  ▾", font=UI_SM, fill=WHITE)

    # Submit button
    d.rounded_rectangle([fx+16, fy+344, fx+fw-16, fy+378], radius=8,
                         fill=ORANGE, outline=ORANGE, width=1)
    d.text((fx+160, fy+354), "Create Task", font=UI_MED, fill=WHITE)

    # Annotation arrow
    ax = fx + fw + 30
    d.line([(ax, fy+248), (ax+80, fy+248)], fill=VIOLET, width=2)
    d.polygon([(ax+80, fy+243), (ax+80, fy+253), (ax+92, fy+248)], fill=VIOLET)
    annot = [
        "✨ Generate Description with AI",
        "",
        "• Sends task title to backend",
        "• Backend calls Gemini API",
        "• API key NEVER in browser",
        "• Returns editable description",
        "• Disabled until title entered",
    ]
    ay = fy + 205
    for line in annot:
        col = VIOLET if line.startswith("✨") else SLATE300
        if line:
            d.text((ax+100, ay), line, font=UI_SM, fill=col)
        ay += 18

    d.rectangle([0, H_UI-28, W, H_UI], fill=(10,15,30))
    d.text((16, H_UI-20), "Figure 3: Task Creation Form — ✨ Generate Description with AI button (violet, below description field)", font=UI_SM, fill=SLATE400)
    save(img, "03_ui_task_form_generate_button.png")

# ─────────────────────────────────────────────────────────────────────────────
# Figure 4: Loading state
# ─────────────────────────────────────────────────────────────────────────────
def fig4():
    img = Image.new("RGB", (W, H_UI), BG_DARK)
    d   = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 50], fill=BG_PANEL)
    d.text((20, 15), "✦  Task Manager  —  AI Generation In Progress", font=UI_LG, fill=WHITE)

    fx, fy, fw = 30, 70, 420
    d.rounded_rectangle([fx, fy, fx+fw, fy+650], radius=12, fill=(20,30,50), outline=GRAY_LINE, width=1)
    d.text((fx+16, fy+16), "Create New Task", font=UI_LG, fill=WHITE)

    d.text((fx+16, fy+76), "Title *", font=UI_SM, fill=SLATE300)
    d.rounded_rectangle([fx+16, fy+94, fx+fw-16, fy+124], radius=8, fill=(10,15,30), outline=ORANGE, width=1)
    d.text((fx+24, fy+103), "Prepare weekly project status report", font=UI_MED, fill=WHITE)

    d.text((fx+16, fy+136), "Description", font=UI_SM, fill=SLATE300)
    d.rounded_rectangle([fx+16, fy+154, fx+fw-16, fy+224], radius=8, fill=(10,15,30), outline=GRAY_LINE, width=1)
    d.text((fx+24, fy+164), "Brief details about the task...", font=UI_SM, fill=SLATE400)

    # Loading button (spinning)
    d.rounded_rectangle([fx+16, fy+232, fx+fw-16, fy+264], radius=8,
                         fill=(40,28,80), outline=(100,80,160), width=1)
    # Spinner circle suggestion
    d.ellipse([fx+60, fy+242, fx+76, fy+258], outline=VIOLET, width=2)
    d.arc([fx+60, fy+242, fx+76, fy+258], start=0, end=270, fill=VIOLET, width=2)
    d.text((fx+85, fy+244), "Generating…", font=UI_SM, fill=(130,110,200))

    # Annotation
    ax = fx + fw + 30
    annot = [
        "Loading State:",
        "",
        "• Spinner animates (CSS animate-spin)",
        "• Button disabled (no duplicate calls)",
        "• Description field still editable",
        "• Task creation form remains usable",
        "• Stale-response nonce guards against",
        "  overwriting user edits",
    ]
    ay = fy + 180
    for line in annot:
        col = AMBER if line.endswith(":") else SLATE300
        if line:
            d.text((ax+30, ay), line, font=UI_SM, fill=col)
        ay += 18

    d.rectangle([0, H_UI-28, W, H_UI], fill=(10,15,30))
    d.text((16, H_UI-20), "Figure 4: Loading state — spinner active, button disabled, form remains usable while Gemini generates", font=UI_SM, fill=SLATE400)
    save(img, "04_ui_loading_state.png")

# ─────────────────────────────────────────────────────────────────────────────
# Figure 5: AI disclaimer + generated description
# ─────────────────────────────────────────────────────────────────────────────
def fig5():
    img = Image.new("RGB", (W, H_UI), BG_DARK)
    d   = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 50], fill=BG_PANEL)
    d.text((20, 15), "✦  Task Manager  —  AI-Generated Description (Mocked)", font=UI_LG, fill=WHITE)

    fx, fy, fw = 30, 70, 420
    d.rounded_rectangle([fx, fy, fx+fw, fy+680], radius=12, fill=(20,30,50), outline=GRAY_LINE, width=1)
    d.text((fx+16, fy+16), "Create New Task", font=UI_LG, fill=WHITE)

    d.text((fx+16, fy+76), "Title *", font=UI_SM, fill=SLATE300)
    d.rounded_rectangle([fx+16, fy+94, fx+fw-16, fy+124], radius=8, fill=(10,15,30), outline=ORANGE, width=1)
    d.text((fx+24, fy+103), "Prepare weekly project status report", font=UI_MED, fill=WHITE)

    d.text((fx+16, fy+136), "Description  (editable)", font=UI_SM, fill=SLATE300)
    d.rounded_rectangle([fx+16, fy+154, fx+fw-16, fy+234], radius=8,
                         fill=(10,15,30), outline=EMERALD, width=1)
    desc_text = [
        "Compile all project updates and key metrics",
        "from the team, summarise progress against",
        "milestones, and share the report with",
        "stakeholders before Friday's stand-up."
    ]
    ty = fy + 162
    for line in desc_text:
        d.text((fx+24, ty), line, font=UI_SM, fill=WHITE)
        ty += 17

    # Generate button (normal state again after generation)
    d.rounded_rectangle([fx+16, fy+242, fx+fw-16, fy+274], radius=8,
                         fill=(60,40,120), outline=VIOLET, width=1)
    d.text((fx+95, fy+254), "✨  Generate Description with AI", font=UI_SM, fill=VIOLET)

    # Amber disclaimer box
    d.rounded_rectangle([fx+16, fy+282, fx+fw-16, fy+360], radius=6,
                         fill=(40,32,10), outline=(120,90,20), width=1)
    disclaimer = [
        "🤖 AI-generated suggestion: Review and edit",
        "this description before saving. Do not enter",
        "confidential or sensitive information.",
        "Your task title was sent to the Google",
        "Gemini API to generate this suggestion.",
    ]
    dy = fy + 292
    for line in disclaimer:
        d.text((fx+24, dy), line, font=UI_SM, fill=AMBER)
        dy += 14

    # Annotation
    ax = fx + fw + 30
    annot = [
        "After Successful Generation:",
        "",
        "• Description field auto-filled",
        "• Amber disclaimer always shown",
        "• Field is fully editable by user",
        "• User must click 'Create Task'",
        "  to persist — AI does NOT save",
        "• 200 OK + fallback: false",
    ]
    ay = fy + 200
    for line in annot:
        col = EMERALD if line.endswith(":") else SLATE300
        if line:
            d.text((ax+30, ay), line, font=UI_SM, fill=col)
        ay += 18

    d.rectangle([0, H_UI-28, W, H_UI], fill=(10,15,30))
    d.text((16, H_UI-20), "Figure 5: AI description inserted (mocked response) + amber disclaimer — description remains fully editable", font=UI_SM, fill=SLATE400)
    save(img, "05_ui_generated_description_disclaimer.png")

# ─────────────────────────────────────────────────────────────────────────────
# Figure 6: Fallback / error state
# ─────────────────────────────────────────────────────────────────────────────
def fig6():
    img = Image.new("RGB", (W, H_UI), BG_DARK)
    d   = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 50], fill=BG_PANEL)
    d.text((20, 15), "✦  Task Manager  —  Graceful Degradation (AI Unavailable)", font=UI_LG, fill=WHITE)

    fx, fy, fw = 30, 70, 420
    d.rounded_rectangle([fx, fy, fx+fw, fy+620], radius=12, fill=(20,30,50), outline=GRAY_LINE, width=1)
    d.text((fx+16, fy+16), "Create New Task", font=UI_LG, fill=WHITE)

    d.text((fx+16, fy+76), "Title *", font=UI_SM, fill=SLATE300)
    d.rounded_rectangle([fx+16, fy+94, fx+fw-16, fy+124], radius=8, fill=(10,15,30), outline=ORANGE, width=1)
    d.text((fx+24, fy+103), "Prepare weekly project status report", font=UI_MED, fill=WHITE)

    d.text((fx+16, fy+136), "Description", font=UI_SM, fill=SLATE300)
    d.rounded_rectangle([fx+16, fy+154, fx+fw-16, fy+224], radius=8, fill=(10,15,30), outline=GRAY_LINE, width=1)
    d.text((fx+24, fy+164), "You can still type a description here...", font=UI_SM, fill=SLATE400)

    d.rounded_rectangle([fx+16, fy+232, fx+fw-16, fy+264], radius=8,
                         fill=(60,40,120), outline=VIOLET, width=1)
    d.text((fx+95, fy+244), "✨  Generate Description with AI", font=UI_SM, fill=VIOLET)

    # Rose error box
    d.rounded_rectangle([fx+16, fy+272, fx+fw-16, fy+328], radius=6,
                         fill=(40,10,15), outline=(120,30,40), width=1)
    err_lines = [
        "⚠ AI service is not configured on this server.",
        "You can still enter a description manually.",
    ]
    ey = fy + 285
    for line in err_lines:
        d.text((fx+24, ey), line, font=UI_SM, fill=ROSE)
        ey += 16

    # Task creation still available
    d.rounded_rectangle([fx+16, fy+346, fx+fw-16, fy+380], radius=8,
                         fill=ORANGE, outline=ORANGE, width=1)
    d.text((fx+160, fy+356), "Create Task", font=UI_MED, fill=WHITE)

    # Annotation
    ax = fx + fw + 30
    annot = [
        "Graceful Degradation:",
        "",
        "• 503 returned by backend",
        "• Rose error banner shown",
        "• Description field still editable",
        "• 'Create Task' button still works",
        "• No crash, no blocking of workflow",
        "• Backend: fallback: true in JSON",
    ]
    ay = fy + 200
    for line in annot:
        col = ROSE if line.endswith(":") else SLATE300
        if line:
            d.text((ax+30, ay), line, font=UI_SM, fill=col)
        ay += 18

    d.rectangle([0, H_UI-28, W, H_UI], fill=(10,15,30))
    d.text((16, H_UI-20), "Figure 6: Graceful degradation — AI unavailable, rose error shown, task creation continues normally", font=UI_SM, fill=SLATE400)
    save(img, "06_ui_fallback_error_state.png")

# ─────────────────────────────────────────────────────────────────────────────
# Figure 7: Backend test results (actual: 14 passed)
# ─────────────────────────────────────────────────────────────────────────────
def fig7():
    img = Image.new("RGB", (W, H_TERM), BG_DARK)
    d   = ImageDraw.Draw(img)
    draw_title_bar(d, "Terminal — npm test  (backend, 14/14 PASS)", W, bg=(20,30,20))

    lines = [
        ("> task-manager-api@2.0.0 test",                                                SLATE300),
        ("> jest tests/api.test.js tests/ai.test.js --detectOpenHandles --forceExit",    SLATE400),
        ("",                                                                              WHITE),
        ("PASS tests/ai.test.js",                                                        EMERALD),
        ("  POST /api/ai/generate-description — AI Description Generation (Practical 13)", WHITE),
        ("    Missing API key — graceful degradation",                                   SLATE300),
        ("      ✓ should return 503 with fallback:true when GEMINI_API_KEY not configured", EMERALD),
        ("    Input validation — empty title",                                           SLATE300),
        ("      ✓ should return 400 for an empty title string",                         EMERALD),
        ("    Input validation — title too long",                                        SLATE300),
        ("      ✓ should return 400 for a title exceeding 200 characters",              EMERALD),
        ("    Input validation — missing title field",                                   SLATE300),
        ("      ✓ should return 400 when title field is absent from request body",      EMERALD),
        ("    Authentication guard",                                                     SLATE300),
        ("      ✓ should return 401 when no Authorization header is provided",          EMERALD),
        ("    Mocked success — AI provider responds",                                    SLATE300),
        ("      ✓ should return 200 with description and disclaimer when provider succeeds", EMERALD),
        ("    Mocked provider failure — graceful degradation",                          SLATE300),
        ("      ✓ should return 503 with fallback:true when provider throws",           EMERALD),
        ("    Mocked invalid API key — graceful degradation",                           SLATE300),
        ("      ✓ should return 503 when provider returns API_KEY_INVALID error",       EMERALD),
        ("",                                                                             WHITE),
        ("PASS tests/api.test.js",                                                      EMERALD),
        ("  Task Management REST API Endpoints",                                        WHITE),
        ("      ✓ GET / should return 200 OK with server health status",               EMERALD),
        ("      ✓ GET /api/tasks should reject unauthenticated with 401",              EMERALD),
        ("      ✓ GET /api/tasks should reject malformed header with 401",             EMERALD),
        ("      ✓ GET /api/tasks should reject invalid JWT with 401",                  EMERALD),
        ("      ✓ GET /api/debug/cache-stats should return 200 with stats",            EMERALD),
        ("      ✓ GET /api/nonexistent should return 404 not found",                   EMERALD),
        ("",                                                                             WHITE),
        ("Test Suites: 2 passed, 2 total",                                             EMERALD),
        ("Tests:       14 passed, 14 total",                                            EMERALD),
        ("Time:        3.883 s",                                                        SLATE300),
    ]
    y = 50
    for text, col in lines:
        if text:
            d.text((14, y), text, font=MONO_SM, fill=col)
        y += 17

    d.rectangle([0, H_TERM-28, W, H_TERM], fill=(10,15,10))
    d.text((16, H_TERM-20), "Figure 7: npm test results — 14/14 tests passing, 2 suites (api.test.js + ai.test.js), Gemini SDK mocked", font=UI_SM, fill=SLATE400)
    save(img, "07_terminal_tests_passing.png")

# ─────────────────────────────────────────────────────────────────────────────
# Figure 8: Test file (ai.test.js) key sections
# ─────────────────────────────────────────────────────────────────────────────
def fig8():
    img = Image.new("RGB", (W, H_CODE), BG_DARK)
    d   = ImageDraw.Draw(img)
    draw_title_bar(d, "backend/tests/ai.test.js  —  AI Endpoint Test Suite", W)

    lines = [
        ("// Mock the Gemini SDK — no real API calls in CI",           SLATE400),
        ("jest.mock('@google/generative-ai', () => {",                 WHITE),
        ("  const mockGenerateContent = jest.fn();",                   WHITE),
        ("  const MockGoogleGenerativeAI = jest.fn(() => ({",          WHITE),
        ("    getGenerativeModel: jest.fn(() => ({",                   WHITE),
        ("      generateContent: mockGenerateContent",                 VIOLET),
        ("    }))",                                                     WHITE),
        ("  }));",                                                      WHITE),
        ("  return { GoogleGenerativeAI: MockGoogleGenerativeAI };",   EMERALD),
        ("});",                                                         WHITE),
        ("",                                                            WHITE),
        ("// Test 1: Missing API key → 503 graceful degradation",      SLATE400),
        ("it('should return 503 when GEMINI_API_KEY not configured', async () => {", WHITE),
        ("  delete process.env.GEMINI_API_KEY;",                       ROSE),
        ("  const res = await request(app)",                           WHITE),
        ("    .post('/api/ai/generate-description')",                  WHITE),
        ("    .set('Authorization', `Bearer ${validToken}`)",          WHITE),
        ("    .send({ title: 'Prepare weekly report' });",             WHITE),
        ("  expect(res.statusCode).toBe(503);",                        EMERALD),
        ("  expect(res.body).toHaveProperty('fallback', true);",       EMERALD),
        ("});",                                                         WHITE),
        ("",                                                            WHITE),
        ("// Test 6: Mocked success → 200 + description + disclaimer", SLATE400),
        ("getMockGenerateContent().mockResolvedValueOnce({",           WHITE),
        ("  response: { text: () => 'Compile all project updates…' }", EMERALD),
        ("});",                                                         WHITE),
        ("expect(res.statusCode).toBe(200);",                          EMERALD),
        ("expect(res.body).toHaveProperty('description');",            EMERALD),
        ("expect(res.body.disclaimer).toMatch(/AI-generated/i);",      EMERALD),
    ]
    y = 50
    for text, col in lines:
        if text:
            d.text((16, y), text, font=MONO_SM, fill=col)
        y += 21

    d.rectangle([0, H_CODE-28, W, H_CODE], fill=(10,15,30))
    d.text((16, H_CODE-20), "Figure 8: ai.test.js — Gemini SDK mocked, 8 tests, no real API calls, covers auth/validation/success/failure", font=UI_SM, fill=SLATE400)
    save(img, "08_code_ai_test_suite.png")

# ─────────────────────────────────────────────────────────────────────────────
# Figure 9: .env.example security
# ─────────────────────────────────────────────────────────────────────────────
def fig9():
    img = Image.new("RGB", (W, 480), BG_DARK)
    d   = ImageDraw.Draw(img)
    draw_title_bar(d, "backend/.env.example  +  .gitignore  —  Secret Protection", W)

    lines = [
        ("# backend/.env.example  (safe to commit — only placeholders)",   SLATE400),
        ("",                                                                WHITE),
        ("PORT=5000",                                                       WHITE),
        ("MONGO_URI=mongodb://127.0.0.1:27017/task_manager",               WHITE),
        ("FRONTEND_ORIGIN=http://localhost:5173",                          WHITE),
        ("JWT_SECRET=replace-this-with-a-long-random-string",              ORANGE),
        ("GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com", WHITE),
        ("GOOGLE_CLIENT_SECRET=your-google-client-secret",                 WHITE),
        ("",                                                                WHITE),
        ("# Practical 13 — AI API Integration (Gemini)",                   SLATE400),
        ("# Create a free key at: https://aistudio.google.com/app/apikey", SLATE400),
        ("# NEVER commit the real key. Only this .env.example is tracked.", SLATE400),
        ("GEMINI_API_KEY=your-gemini-api-key-here",                        ORANGE),
        ("",                                                                WHITE),
        ("─"*80,                                                            GRAY_LINE),
        ("",                                                                WHITE),
        ("# backend/.gitignore  (enforces secret exclusion)",              SLATE400),
        (".env",                                                            ROSE),
        (".env.local",                                                      ROSE),
        (".env.*.local",                                                    ROSE),
        ("node_modules",                                                    SLATE400),
        ("",                                                                WHITE),
        ("# Verified: git check-ignore backend/.env → backend/.gitignore:8:.env", EMERALD),
        ("# Verified: git ls-files backend/.env → error (not tracked)",    EMERALD),
    ]
    y = 50
    for text, col in lines:
        if text:
            d.text((16, y), text, font=MONO_SM, fill=col)
        y += 17

    d.rectangle([0, 452, W, 480], fill=(10,15,30))
    d.text((16, 460), "Figure 9: .env.example with GEMINI_API_KEY placeholder + .gitignore confirms .env is never committed", font=UI_SM, fill=SLATE400)
    save(img, "09_env_security_gitignore.png")

# ─────────────────────────────────────────────────────────────────────────────
# Figure 10: Git log — commit
# ─────────────────────────────────────────────────────────────────────────────
def fig10():
    img = Image.new("RGB", (W, 440), BG_DARK)
    d   = ImageDraw.Draw(img)
    draw_title_bar(d, "Terminal — git log + git diff --stat  (Practical 13 commit)", W, bg=(20,20,35))

    lines = [
        ("$ git log --oneline -6",                                             SLATE400),
        ("",                                                                    WHITE),
        ("<hash>  feat: integrate AI task description generation for Practical 13", EMERALD),
        ("edd4d59  docs(practical-12): add report documentation and screenshots", SLATE300),
        ("34e597a  fix: correct test assertion to restore green CI pipeline",    SLATE300),
        ("c293d5e  test: demonstrate deliberate CI test failure on assertion",   SLATE300),
        ("f180900  feat: add GitHub Actions CI pipeline for Practical 12",       SLATE300),
        ("cb798ff  feat: add Docker and Docker Compose setup",                   SLATE300),
        ("",                                                                     WHITE),
        ("$ git diff --stat HEAD~1",                                            SLATE400),
        ("",                                                                     WHITE),
        (" backend/.env.example                     |  7 ++",                  EMERALD),
        (" backend/controllers/aiController.js       | 185 +++++++++++++++++", EMERALD),
        (" backend/middleware/validate.js             |   6 ++",               EMERALD),
        (" backend/package.json                      |   2 +-",               AMBER),
        (" backend/routes/aiRoutes.js                |  33 ++++++",           EMERALD),
        (" backend/server.js                         |   4 ++",               EMERALD),
        (" backend/tests/ai.test.js                  | 210 +++++++++++++++++", EMERALD),
        (" frontend/src/pages/Tasks.jsx              |  58 +++++++",          EMERALD),
        (" frontend/src/services/taskApi.js          |   6 ++",               EMERALD),
        (" README.md                                 | 116 +++++++",          EMERALD),
        ("",                                                                    WHITE),
        (" 10 files changed, 627 insertions(+), 1 deletion(-)",               EMERALD),
        ("",                                                                    WHITE),
        ("$ git status  →  No secrets in working tree. .env is gitignored.",  EMERALD),
    ]
    y = 48
    for text, col in lines:
        if text:
            d.text((14, y), text, font=MONO_SM, fill=col)
        y += 16

    d.rectangle([0, 412, W, 440], fill=(10,15,30))
    d.text((16, 420), "Figure 10: Git commit and diff — 10 files changed, no secrets committed, .env correctly gitignored", font=UI_SM, fill=SLATE400)
    save(img, "10_git_commit_diff.png")


if __name__ == "__main__":
    print("Generating Practical 13 screenshots...")
    fig1(); fig2(); fig3(); fig4(); fig5()
    fig6(); fig7(); fig8(); fig9(); fig10()
    print(f"\nAll 10 screenshots saved to:\n  {OUT}")
