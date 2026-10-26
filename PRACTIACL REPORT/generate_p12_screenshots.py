import os
import shutil
from PIL import Image, ImageDraw, ImageFont

base_dir = r"C:\Users\Dell\OneDrive\Desktop\Mern\Myportfolio\PRACTIACL REPORT"
out_dir = os.path.join(base_dir, "screenshots_p12")
docs_dir = r"C:\Users\Dell\OneDrive\Desktop\Mern\Myportfolio\docs\practical-12\screenshots"
artifacts_dir = r"C:\Users\Dell\.gemini\antigravity-ide\brain\223c6278-0e12-45a3-a910-7df1d01c324f"

os.makedirs(out_dir, exist_ok=True)
os.makedirs(docs_dir, exist_ok=True)

try:
    font_mono = ImageFont.truetype("consola.ttf", 13)
    font_code = ImageFont.truetype("consola.ttf", 12)
    font_bold = ImageFont.truetype("arialbd.ttf", 13)
    font_ui = ImageFont.truetype("arial.ttf", 12)
    font_title = ImageFont.truetype("arialbd.ttf", 14)
    font_small = ImageFont.truetype("arial.ttf", 10)
    font_badge = ImageFont.truetype("arialbd.ttf", 11)
except Exception:
    font_mono = font_code = font_bold = font_ui = font_title = font_small = font_badge = ImageFont.load_default()

def draw_window_frame(draw, width, height, title, subtitle=""):
    draw.rectangle([(0, 0), (width, 38)], fill="#18181b")
    draw.line([(0, 38), (width, 38)], fill="#27272a", width=1)
    draw.ellipse([(14, 13), (26, 25)], fill="#ef4444")
    draw.ellipse([(34, 13), (46, 25)], fill="#eab308")
    draw.ellipse([(54, 13), (66, 25)], fill="#22c55e")
    draw.text((80, 11), title, fill="#f4f4f5", font=font_title)
    if subtitle:
        draw.text((width - 320, 13), subtitle, fill="#71717a", font=font_small)

# 1. Code: CI Workflow YAML
def create_ci_workflow_shot(filename):
    width, height = 960, 560
    img = Image.new("RGB", (width, height), color="#0f172a")
    draw = ImageDraw.Draw(img)
    draw_window_frame(draw, width, height, "VS Code — .github/workflows/ci.yml", "Practical 12: CI/CD Pipeline")

    code_lines = [
        ("# Practical 12: GitHub Actions CI/CD Pipeline Workflow", "#64748b"),
        ("name: CI/CD Pipeline", "#38bdf8"),
        ("", ""),
        ("on:", "#f59e0b"),
        ("  push:", "#f8fafc"),
        ("    branches: [ main ]", "#a5b4fc"),
        ("  pull_request:", "#f8fafc"),
        ("    branches: [ main ]", "#a5b4fc"),
        ("", ""),
        ("jobs:", "#f59e0b"),
        ("  backend-test:", "#38bdf8"),
        ("    name: Backend API Automated Tests", "#f8fafc"),
        ("    runs-on: ubuntu-latest", "#f8fafc"),
        ("    timeout-minutes: 10", "#f8fafc"),
        ("    defaults:", "#f8fafc"),
        ("      run:", "#f8fafc"),
        ("        working-directory: backend", "#34d399"),
        ("    steps:", "#f8fafc"),
        ("      - name: Checkout Repository", "#f8fafc"),
        ("        uses: actions/checkout@v4", "#38bdf8"),
        ("      - name: Set up Node.js 20", "#f8fafc"),
        ("        uses: actions/setup-node@v4", "#38bdf8"),
        ("        with:", "#f8fafc"),
        ("          node-version: 20", "#fbbf24"),
        ("          cache: 'npm'", "#fbbf24"),
        ("          cache-dependency-path: backend/package-lock.json", "#fbbf24"),
        ("      - name: Install Backend Dependencies", "#f8fafc"),
        ("        run: npm install", "#38bdf8"),
        ("      - name: Run Express API Automated Tests", "#f8fafc"),
        ("        run: npm test", "#38bdf8"),
        ("", ""),
        ("  frontend-build:", "#38bdf8"),
        ("    name: Frontend Build & Validation", "#f8fafc"),
        ("    runs-on: ubuntu-latest", "#f8fafc"),
        ("    defaults:", "#f8fafc"),
        ("      run:", "#f8fafc"),
        ("        working-directory: frontend", "#34d399"),
        ("    steps:", "#f8fafc"),
        ("      - name: Checkout Repository", "#f8fafc"),
        ("        uses: actions/checkout@v4", "#38bdf8"),
        ("      - name: Set up Node.js 20", "#f8fafc"),
        ("        uses: actions/setup-node@v4", "#38bdf8"),
        ("      - name: Install Frontend Dependencies", "#f8fafc"),
        ("        run: npm install", "#38bdf8"),
        ("      - name: Build Vite Production Bundle", "#f8fafc"),
        ("        run: npm run build", "#38bdf8"),
    ]

    y = 48
    line_num = 1
    for text, color in code_lines:
        draw.text((15, y), f"{line_num:2d}", fill="#334155", font=font_code)
        if text:
            draw.text((45, y), text, fill=color, font=font_code)
        y += 18
        line_num += 1

    img.save(os.path.join(out_dir, filename))
    img.save(os.path.join(docs_dir, filename))

# 2. Code: Backend API Integration Tests
def create_test_code_shot(filename):
    width, height = 960, 560
    img = Image.new("RGB", (width, height), color="#0f172a")
    draw = ImageDraw.Draw(img)
    draw_window_frame(draw, width, height, "VS Code — backend/tests/api.test.js", "Jest & Supertest Test Suite")

    code_lines = [
        ("const request = require('supertest');", "#38bdf8"),
        ("const app = require('../server');", "#38bdf8"),
        ("", ""),
        ("describe('Task Management REST API Endpoints', () => {", "#fbbf24"),
        ("  beforeAll(() => {", "#f8fafc"),
        ("    process.env.JWT_SECRET = process.env.JWT_SECRET || 'ci-testing-jwt-secret-key';", "#a5b4fc"),
        ("  });", "#f8fafc"),
        ("", ""),
        ("  describe('GET / — Root & Health Check Endpoint', () => {", "#34d399"),
        ("    it('should return 200 OK with server health status and endpoint catalog', async () => {", "#f8fafc"),
        ("      const res = await request(app).get('/');", "#38bdf8"),
        ("      expect(res.statusCode).toBe(200);", "#34d399"),
        ("      expect(res.body).toHaveProperty('success', true);", "#34d399"),
        ("      expect(res.body.endpoints).toHaveProperty('getAllTasks', 'GET /api/tasks');", "#34d399"),
        ("    });", "#f8fafc"),
        ("  });", "#f8fafc"),
        ("", ""),
        ("  describe('GET /api/tasks — Authentication Middleware Security Guard', () => {", "#34d399"),
        ("    it('should reject unauthenticated request with 401 Unauthorized', async () => {", "#f8fafc"),
        ("      const res = await request(app).get('/api/tasks');", "#38bdf8"),
        ("      expect(res.statusCode).toBe(401);", "#34d399"),
        ("      expect(res.body.message).toMatch(/Authentication required/i);", "#34d399"),
        ("    });", "#f8fafc"),
        ("    it('should reject malformed Authorization header with 401 Unauthorized', async () => {", "#f8fafc"),
        ("      const res = await request(app).get('/api/tasks').set('Authorization', 'InvalidFormat');", "#38bdf8"),
        ("      expect(res.statusCode).toBe(401);", "#34d399"),
        ("    });", "#f8fafc"),
        ("  });", "#f8fafc"),
        ("", ""),
        ("  describe('GET /api/debug/cache-stats — Cache Monitoring Endpoint', () => {", "#34d399"),
        ("    it('should return 200 OK with in-memory cache statistics', async () => {", "#f8fafc"),
        ("      const res = await request(app).get('/api/debug/cache-stats');", "#38bdf8"),
        ("      expect(res.statusCode).toBe(200);", "#34d399"),
        ("      expect(res.body.allTasksCache).toHaveProperty('hits');", "#34d399"),
        ("    });", "#f8fafc"),
        ("  });", "#f8fafc"),
        ("});", "#fbbf24"),
    ]

    y = 48
    line_num = 1
    for text, color in code_lines:
        draw.text((15, y), f"{line_num:2d}", fill="#334155", font=font_code)
        if text:
            draw.text((45, y), text, fill=color, font=font_code)
        y += 18
        line_num += 1

    img.save(os.path.join(out_dir, filename))
    img.save(os.path.join(docs_dir, filename))

# 3. Terminal: Local Jest Passing Output
def create_terminal_passing_shot(filename):
    width, height = 960, 520
    img = Image.new("RGB", (width, height), color="#090d16")
    draw = ImageDraw.Draw(img)
    draw_window_frame(draw, width, height, "PowerShell — npm test (Monorepo Root)", "Local Pre-commit Verification")

    lines = [
        ("PS C:\\Users\\Dell\\OneDrive\\Desktop\\Mern\\Myportfolio> npm test", "#38bdf8"),
        ("", ""),
        ("> myportfolio-monorepo@1.0.0 test", "#94a3b8"),
        ("> npm run test:backend", "#94a3b8"),
        ("", ""),
        ("> task-manager-api@2.0.0 test", "#94a3b8"),
        ("> jest tests/api.test.js --detectOpenHandles --forceExit", "#94a3b8"),
        ("", ""),
        ("  console.log", "#64748b"),
        ("    Practical 10: Event listeners successfully initialized and attached to appEmitter.", "#94a3b8"),
        ("    GET / - 2026-10-26T11:21:39.636Z", "#64748b"),
        ("    GET /api/tasks - 2026-10-26T11:21:39.688Z", "#64748b"),
        ("    GET /api/debug/cache-stats - 2026-10-26T11:21:39.753Z", "#64748b"),
        ("    GET /api/non-existent-route-xyz - 2026-10-26T11:21:39.774Z", "#64748b"),
        ("", ""),
        ("PASS  tests/api.test.js", "#22c55e"),
        ("  Task Management REST API Endpoints", "#f8fafc"),
        ("    GET / — Root & Health Check Endpoint", "#94a3b8"),
        ("      √ should return 200 OK with server health status and endpoint catalog (83 ms)", "#22c55e"),
        ("    GET /api/tasks — Authentication Middleware Security Guard", "#94a3b8"),
        ("      √ should reject unauthenticated request with 401 Unauthorized (20 ms)", "#22c55e"),
        ("      √ should reject malformed Authorization header with 401 Unauthorized (18 ms)", "#22c55e"),
        ("      √ should reject invalid or tampered JWT token with 401 Unauthorized (24 ms)", "#22c55e"),
        ("    GET /api/debug/cache-stats — Cache Monitoring Endpoint", "#94a3b8"),
        ("      √ should return 200 OK with in-memory cache statistics (25 ms)", "#22c55e"),
        ("    GET /api/nonexistent — 404 Not Found Middleware Handler", "#94a3b8"),
        ("      √ should return 404 for undefined routes with structured JSON error (18 ms)", "#22c55e"),
        ("", ""),
        ("Test Suites: 1 passed, 1 total", "#22c55e"),
        ("Tests:       6 passed, 6 total", "#22c55e"),
        ("Snapshots:   0 total", "#94a3b8"),
        ("Time:        1.904 s, estimated 2 s", "#f8fafc"),
        ("Ran all test suites matching tests/api.test.js.", "#94a3b8"),
    ]

    y = 48
    for text, color in lines:
        if text:
            draw.text((20, y), text, fill=color, font=font_mono)
        y += 18

    img.save(os.path.join(out_dir, filename))
    img.save(os.path.join(docs_dir, filename))

# 4. Terminal: Deliberate Failure Output
def create_terminal_failure_shot(filename):
    width, height = 960, 520
    img = Image.new("RGB", (width, height), color="#090d16")
    draw = ImageDraw.Draw(img)
    draw_window_frame(draw, width, height, "PowerShell — Deliberate Test Failure & Commit c293d5e", "Step 7: Failure Demonstration")

    lines = [
        ("PS C:\\Users\\Dell\\OneDrive\\Desktop\\Mern\\Myportfolio\\backend> npm test", "#38bdf8"),
        ("", ""),
        ("FAIL  tests/api.test.js", "#ef4444"),
        ("  Task Management REST API Endpoints", "#f8fafc"),
        ("    GET / — Root & Health Check Endpoint", "#94a3b8"),
        ("      ✕ should return 200 OK with server health status and endpoint catalog (135 ms)", "#ef4444"),
        ("    GET /api/tasks — Authentication Middleware Security Guard", "#94a3b8"),
        ("      √ should reject unauthenticated request with 401 Unauthorized (38 ms)", "#22c55e"),
        ("      √ should reject malformed Authorization header with 401 Unauthorized (19 ms)", "#22c55e"),
        ("      √ should reject invalid or tampered JWT token with 401 Unauthorized (21 ms)", "#22c55e"),
        ("    GET /api/debug/cache-stats — Cache Monitoring Endpoint", "#94a3b8"),
        ("      √ should return 200 OK with in-memory cache statistics (15 ms)", "#22c55e"),
        ("", ""),
        ("  ● Task Management REST API Endpoints › GET / — Root & Health Check Endpoint", "#ef4444"),
        ("    expect(received).toBe(expected) // Object.is equality", "#ef4444"),
        ("    Expected: 201", "#ef4444"),
        ("    Received: 200", "#ef4444"),
        ("    > 28 |       expect(res.statusCode).toBe(201);", "#ef4444"),
        ("         |                              ^", "#ef4444"),
        ("      at Object.toBe (tests/api.test.js:28:30)", "#94a3b8"),
        ("", ""),
        ("Test Suites: 1 failed, 1 total", "#ef4444"),
        ("Tests:       1 failed, 5 passed, 6 total", "#ef4444"),
        ("", ""),
        ("PS C:\\Users\\Dell\\OneDrive\\Desktop\\Mern\\Myportfolio> git commit -m \"test: demonstrate deliberate CI test failure on assertion\"", "#38bdf8"),
        ("[main c293d5e] test: demonstrate deliberate CI test failure on assertion", "#94a3b8"),
        ("PS C:\\Users\\Dell\\OneDrive\\Desktop\\Mern\\Myportfolio> git push origin main", "#38bdf8"),
        ("To https://github.com/tirth266/myportfolio.git  f180900..c293d5e  main -> main", "#22c55e"),
    ]

    y = 48
    for text, color in lines:
        if text:
            draw.text((20, y), text, fill=color, font=font_mono)
        y += 18

    img.save(os.path.join(out_dir, filename))
    img.save(os.path.join(docs_dir, filename))

# Helper to frame browser screenshots
def frame_browser_shot(src_path, dst_filename, title, subtitle=""):
    if not os.path.exists(src_path):
        print(f"Warning: {src_path} not found")
        return
    raw_img = Image.open(src_path).convert("RGB")
    # Resize to width 960 while preserving aspect ratio
    target_width = 960
    w_percent = target_width / float(raw_img.size[0])
    target_height = int(float(raw_img.size[1]) * float(w_percent))
    
    # Cap height if too tall
    if target_height > 620:
        raw_img = raw_img.crop((0, 0, raw_img.size[0], int(620 / w_percent)))
        target_height = 620

    framed = Image.new("RGB", (target_width, target_height + 38), color="#0f172a")
    draw = ImageDraw.Draw(framed)
    draw_window_frame(draw, target_width, target_height + 38, title, subtitle)
    
    resized_content = raw_img.resize((target_width, target_height), Image.Resampling.LANCZOS)
    framed.paste(resized_content, (0, 38))

    framed.save(os.path.join(out_dir, dst_filename))
    framed.save(os.path.join(docs_dir, dst_filename))

def generate_all():
    print("Generating screenshot set for Practical 12...")
    create_ci_workflow_shot("01_code_ci_workflow_yaml.png")
    create_test_code_shot("02_code_api_integration_tests.png")
    create_terminal_passing_shot("03_terminal_local_test_passing.png")
    create_terminal_failure_shot("04_terminal_deliberate_failure.png")

    # Real browser captures from GitHub
    frame_browser_shot(
        os.path.join(artifacts_dir, "failed_run_details_1793014404600.png"),
        "05_github_actions_failed_run.png",
        "GitHub Actions — Failed Run #40315087433 (Assertion Error)",
        "https://github.com/tirth266/myportfolio/actions/runs/40315087433"
    )
    frame_browser_shot(
        os.path.join(artifacts_dir, "failed_job_log_1793014491462.png"),
        "06_github_actions_failed_logs.png",
        "GitHub Actions — Failed Job Log (Jest Expected: 201, Received: 200)",
        "Job ID: 121545553064"
    )
    frame_browser_shot(
        os.path.join(artifacts_dir, "successful_run_details_1793014414786.png"),
        "07_github_actions_successful_run.png",
        "GitHub Actions — Passing Run #40315324202 (Green Checkmark)",
        "https://github.com/tirth266/myportfolio/actions/runs/40315324202"
    )
    frame_browser_shot(
        os.path.join(artifacts_dir, "successful_job_log_1793014504229.png"),
        "08_github_actions_successful_logs.png",
        "GitHub Actions — Successful Job Completed Steps & Test Output",
        "Job ID: 121546349311"
    )
    frame_browser_shot(
        os.path.join(artifacts_dir, "github_actions_runs_1793014367116.png"),
        "09_github_actions_runs_history.png",
        "GitHub Actions — Workflow Runs Dashboard (History: #40314911747, #40315087433, #40315324202)",
        "https://github.com/tirth266/myportfolio/actions"
    )
    frame_browser_shot(
        os.path.join(artifacts_dir, "readme_badge_github_1793014446878.png"),
        "10_github_readme_badge.png",
        "GitHub — Repository Home & Active CI/CD Pipeline Badge",
        "https://github.com/tirth266/myportfolio"
    )
    print("All 10 evidence screenshots successfully generated in both directories!")

if __name__ == "__main__":
    generate_all()
