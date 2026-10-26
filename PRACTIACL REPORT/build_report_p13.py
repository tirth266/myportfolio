"""
build_report_p13.py  —  Practical 13: AI API Integration
Generates 24AIML060_AWDF-P13.docx and .pdf matching P11/P12 format exactly.

Layout:
  Header: Student ID + logo + university info (same as P11/P12)
  Table 1: Practical Statement, Theory, Architecture
  Page break
  Table 2: Screenshots & Evidence (10 figures)
  Page break
  Table 3: Test Results Table, Viva Q&A, Troubleshooting, Links
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls


def create_p13_report():
    doc = docx.Document()

    # Page Margins: 0.5 in (matches P11/P12)
    for section in doc.sections:
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)

    base_dir  = r"C:\Users\Dell\OneDrive\Desktop\Mern\Myportfolio\PRACTIACL REPORT"
    logo_path = os.path.join(base_dir, "extracted_p6", "p6_page0_img2.png")
    shots_dir = os.path.join(base_dir, "screenshots_p13")

    # ── Helpers ──────────────────────────────────────────────────────────────

    def set_cell_border(cell, **kw):
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>\n'
            f'<w:top    w:val="{kw.get("top","single")}"    w:sz="{kw.get("top_sz","4")}"    w:space="0" w:color="{kw.get("top_color","000000")}"/>\n'
            f'<w:left   w:val="{kw.get("left","single")}"   w:sz="{kw.get("left_sz","4")}"   w:space="0" w:color="{kw.get("left_color","000000")}"/>\n'
            f'<w:bottom w:val="{kw.get("bottom","single")}" w:sz="{kw.get("bottom_sz","4")}" w:space="0" w:color="{kw.get("bottom_color","000000")}"/>\n'
            f'<w:right  w:val="{kw.get("right","single")}"  w:sz="{kw.get("right_sz","4")}"  w:space="0" w:color="{kw.get("right_color","000000")}"/>\n'
            f'</w:tcBorders>'
        )
        tcPr.append(tcBorders)

    def set_cell_bg(cell, fill_hex):
        tcPr = cell._tc.get_or_add_tcPr()
        shd  = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        tcPr.append(shd)

    def create_table():
        tbl = doc.add_table(rows=0, cols=2)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit   = False
        return tbl

    def add_row(tbl, label, content_fn):
        r     = tbl.add_row()
        c_lbl = r.cells[0]
        c_cnt = r.cells[1]
        c_lbl.width = Inches(1.85)
        c_cnt.width = Inches(5.65)

        for c in (c_lbl, c_cnt):
            set_cell_border(c, top="single", bottom="single", left="single", right="single",
                            top_sz="6", bottom_sz="6", left_sz="6", right_sz="6")
        set_cell_bg(c_lbl, "f4f4f5")

        p   = c_lbl.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after  = Pt(2)
        rl  = p.add_run(label)
        rl.font.name = "Arial"
        rl.font.size = Pt(10)
        rl.font.bold = True

        content_fn(c_cnt)
        return r

    def add_shot(cell, title, filename):
        p = cell.add_paragraph()
        p.paragraph_format.space_before    = Pt(6)
        p.paragraph_format.space_after     = Pt(2)
        p.paragraph_format.keep_with_next  = True
        r = p.add_run(title)
        r.font.bold = True
        r.font.size = Pt(9.5)

        img_path = os.path.join(shots_dir, filename)
        if os.path.exists(img_path):
            pi = cell.add_paragraph()
            pi.paragraph_format.space_before = Pt(1)
            pi.paragraph_format.space_after  = Pt(4)
            pi.alignment = WD_ALIGN_PARAGRAPH.CENTER
            pi.add_run().add_picture(img_path, width=Inches(4.65))
        else:
            cell.add_paragraph().add_run(f"[ Missing: {filename} ]")

    # ── HEADER (identical to P11/P12) ────────────────────────────────────────

    p_id = doc.add_paragraph()
    p_id.paragraph_format.space_before = Pt(0)
    p_id.paragraph_format.space_after  = Pt(2)
    run_id = p_id.add_run("Student ID: 24AIML060")
    run_id.font.name = "Arial"
    run_id.font.size = Pt(11)
    run_id.font.bold = True

    header_table = doc.add_table(rows=1, cols=2)
    header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    header_table.autofit   = False
    header_table.columns[0].width = Inches(1.1)
    header_table.columns[1].width = Inches(6.4)

    row       = header_table.rows[0]
    cell_logo = row.cells[0]
    cell_logo.width = Inches(1.1)
    cell_logo.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    if os.path.exists(logo_path):
        pl = cell_logo.paragraphs[0]
        pl.alignment = WD_ALIGN_PARAGRAPH.CENTER
        pl.paragraph_format.space_before = Pt(0)
        pl.paragraph_format.space_after  = Pt(0)
        pl.add_run().add_picture(logo_path, width=Inches(0.95))

    cell_text = row.cells[1]
    cell_text.width = Inches(6.4)
    cell_text.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p_uni = cell_text.paragraphs[0]
    p_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_uni.paragraph_format.space_before = Pt(0)
    p_uni.paragraph_format.space_after  = Pt(1)

    r1 = p_uni.add_run("CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY\n")
    r1.font.name = "Arial"; r1.font.size = Pt(12); r1.font.bold = True

    r2 = p_uni.add_run("FACULTY OF TECHNOLOGY AND ENGINEERING\nB. TECH (IT/CE/CSE/AIML)\n")
    r2.font.name = "Arial"; r2.font.size = Pt(10); r2.font.bold = True

    r3 = p_uni.add_run("Subject: Advanced Web Development Frameworks (ITUE301) | Semester: 5th")
    r3.font.name = "Arial"; r3.font.size = Pt(10); r3.font.bold = True

    p_gap = doc.add_paragraph()
    p_gap.paragraph_format.space_before = Pt(2)
    p_gap.paragraph_format.space_after  = Pt(4)

    # ── TABLE 1: Statement, Theory, Architecture ──────────────────────────────

    t1 = create_table()

    def build_stmt(cell):
        p  = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after  = Pt(2)
        rt = p.add_run("Practical 13: AI API Integration into a Web Application\n")
        rt.font.bold = True
        rt.font.size = Pt(10.5)

        meta = [
            ("CO/PO:", "CO6 / PO3, PO5, PO12"),
            ("Objective:", "Integrate an external AI service (Google Gemini API) securely into the existing Task Management application and demonstrate responsible AI usage."),
        ]
        for lbl, val in meta:
            pm = cell.add_paragraph()
            pm.paragraph_format.space_before = Pt(1)
            pm.paragraph_format.space_after  = Pt(1)
            pm.paragraph_format.left_indent  = Inches(0.1)
            rm = pm.add_run(lbl + " ")
            rm.font.bold = True; rm.font.size = Pt(9.5)
            pm.add_run(val).font.size = Pt(9.5)

        bullets = [
            "Created POST /api/ai/generate-description backend endpoint (authenticated, validated, rate-limited at 1 req/title/60s) that calls the Google Gemini gemini-1.5-flash model and returns a structured JSON response.",
            "Implemented a lazy Gemini client with 10-second AbortController timeout, graceful 503 degradation on missing/invalid key, and provider error isolation — stack traces, keys, and auth headers are never forwarded to clients.",
            "Added a validated generateDescription rule (title: required, 1-200 chars) to the existing middleware/validate.js pipeline, consistent with the project's existing auth → validate → controller architecture.",
            "Integrated the Generate Description button, loading spinner, editable description field, AI disclaimer banner, and rose error/fallback banner into the existing Tasks.jsx creation form using Tailwind utility classes.",
            "Secured the API key: stored in backend/.env only, confirmed gitignored (backend/.gitignore line 8), never logged, returned, or exposed in browser requests or frontend bundles.",
            "Added 8 automated tests in backend/tests/ai.test.js using jest.mock('@google/generative-ai') — no real API calls in CI — covering auth guard, validation, missing key, mocked success, provider failure, and invalid key.",
            "Updated backend package.json test script, README.md (Practical 13 section), and backend/.env.example with GEMINI_API_KEY placeholder.",
        ]
        for b in bullets:
            pb = cell.add_paragraph()
            pb.paragraph_format.space_before = Pt(1)
            pb.paragraph_format.space_after  = Pt(1)
            pb.paragraph_format.left_indent  = Inches(0.2)
            rb = pb.add_run("• " + b)
            rb.font.size = Pt(9.5)

    add_row(t1, "Practical Statement & Objective:", build_stmt)

    def build_theory(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after  = Pt(2)
        p.add_run("Theory — AI API Integration, Security & Responsible AI:\n").font.bold = True

        pts = [
            ("External AI API Integration:",
             " Modern web applications extend functionality by calling third-party AI providers (OpenAI, Google Gemini, Anthropic) over HTTPS. The backend acts as a secure proxy: it authenticates the request, forwards minimal data to the provider, and returns structured results to the frontend. The browser never contacts the AI provider directly."),
            ("Backend-Only Key Principle:",
             " API keys grant billing authority and full provider access. Placing a key in React source code, environment variables prefixed VITE_, or any browser-accessible location exposes it to any user who opens DevTools. The key must reside exclusively in a server-side .env file listed in .gitignore and must never appear in browser network requests, bundle files, or version control history."),
            ("Graceful Degradation:",
             " When an external dependency (AI provider, database, cache) is unavailable, the application must continue serving its core workflow. The generate-description endpoint returns HTTP 503 with fallback:true when the API key is missing or the provider fails, allowing the frontend to display a helpful message while keeping task creation fully operational."),
            ("Responsible AI & Data Minimisation:",
             " Only the task title (minimum necessary data) is forwarded to Gemini. No credentials, user profiles, task history, or private data are included. Users are informed via a visible disclaimer that their title is sent to an external provider. Generated content is returned as editable text under full user control; it is not persisted until the user explicitly submits the task form."),
            ("Rate Limiting:",
             " Client-side or server-side abuse of a paid AI endpoint incurs cost. An in-memory per-title rate limiter (Map<string,timestamp>) enforces one generation request per normalised title per 60 seconds, returning HTTP 429 with a retry-after message. The interval cleanup timer uses .unref() to avoid blocking process exit in test environments."),
        ]
        for lbl, desc in pts:
            pb = cell.add_paragraph()
            pb.paragraph_format.space_before = Pt(1)
            pb.paragraph_format.space_after  = Pt(1)
            pb.paragraph_format.left_indent  = Inches(0.15)
            rl = pb.add_run("• " + lbl)
            rl.font.bold = True; rl.font.size = Pt(9.5)
            pb.add_run(desc).font.size = Pt(9)

    add_row(t1, "Theory & Architecture:", build_theory)

    def build_tools(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after  = Pt(1)
        p.add_run("Tools & Technologies (Practical 13 additions):\n").font.bold = True

        tools = [
            ("@google/generative-ai 0.x:", " Official Google Gemini Node.js SDK. Provides GoogleGenerativeAI class and model.generateContent() API used in aiController.js."),
            ("Google Gemini 1.5 Flash:", " Cost-efficient, low-latency generative text model used to produce concise task descriptions from a title prompt. Configured with a 10-second AbortController timeout."),
            ("In-Memory Rate Limiter:", " Custom Map-based per-title rate limiter in aiController.js. No additional database table required. Enforces 1 request/title/60 s with periodic cleanup via setInterval().unref()."),
            ("jest.mock():", " Jest module mocking used in ai.test.js to replace the @google/generative-ai SDK with a configurable mock. Enables testing all code paths (success, failure, timeout) without real API calls or charges."),
            ("AbortController / signal:", " Node.js built-in used to enforce a 10-second provider timeout. If Gemini does not respond within 10 s, the request is cancelled and HTTP 503 is returned."),
        ]
        for lbl, desc in tools:
            pt = cell.add_paragraph()
            pt.paragraph_format.space_before = Pt(0.5)
            pt.paragraph_format.space_after  = Pt(0.5)
            pt.paragraph_format.left_indent  = Inches(0.15)
            rt = pt.add_run("• " + lbl)
            rt.font.bold = True; rt.font.size = Pt(9)
            pt.add_run(desc).font.size = Pt(9)

    add_row(t1, "Tools & Technologies:", build_tools)

    doc.add_page_break()

    # ── TABLE 2: Screenshots ──────────────────────────────────────────────────

    t2 = create_table()

    def build_shots(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before    = Pt(2)
        p.paragraph_format.space_after     = Pt(2)
        p.paragraph_format.keep_with_next  = True
        p.add_run("AI API Integration Evidence — Screenshots:\n").font.bold = True

        add_shot(cell, "Figure 1: Code — backend/routes/aiRoutes.js (authenticated AI route with validation pipeline)", "01_code_ai_routes.png")
        add_shot(cell, "Figure 2: Code — backend/controllers/aiController.js (rate limiter, lazy Gemini client, 10s timeout, graceful 503)", "02_code_ai_controller.png")
        add_shot(cell, "Figure 3: UI — Task Creation Form with ✨ Generate Description with AI button (violet, below description field)", "03_ui_task_form_generate_button.png")
        add_shot(cell, "Figure 4: UI — Loading State: spinning indicator, button disabled, form remains fully usable during generation", "04_ui_loading_state.png")
        add_shot(cell, "Figure 5: UI — Mocked AI-generated description inserted into editable field + amber AI-generated-content disclaimer", "05_ui_generated_description_disclaimer.png")
        add_shot(cell, "Figure 6: UI — Graceful degradation: rose error banner when AI unavailable, task creation still works", "06_ui_fallback_error_state.png")
        add_shot(cell, "Figure 7: Terminal — npm test: 14/14 tests passing (api.test.js + ai.test.js), Gemini SDK mocked, no API calls", "07_terminal_tests_passing.png")
        add_shot(cell, "Figure 8: Code — backend/tests/ai.test.js (jest.mock, 8 AI tests: auth/validation/success/failure/invalid key)", "08_code_ai_test_suite.png")
        add_shot(cell, "Figure 9: Security — backend/.env.example with GEMINI_API_KEY placeholder + .gitignore confirmation", "09_env_security_gitignore.png")
        add_shot(cell, "Figure 10: Git — Practical 13 commit diff (10 files changed, 627 insertions, no secrets committed)", "10_git_commit_diff.png")

    add_row(t2, "Screenshots & Evidence:", build_shots)

    doc.add_page_break()

    # ── TABLE 3: Test Results, Q&A, Troubleshooting, Links ───────────────────

    t3 = create_table()

    def build_test_table(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after  = Pt(2)
        p.add_run("Automated Test Results Summary (npm test — 2 suites, 14 tests):\n").font.bold = True

        tbl = cell.add_table(rows=9, cols=4)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False

        hdrs  = ["Test Case", "Suite", "Expected", "Actual Result"]
        widths = [Inches(2.2), Inches(1.0), Inches(0.9), Inches(1.55)]

        for i, h in enumerate(hdrs):
            c = tbl.rows[0].cells[i]
            c.width = widths[i]
            set_cell_border(c, top="single", bottom="single", left="single", right="single", top_sz="4", bottom_sz="4", left_sz="4", right_sz="4")
            set_cell_bg(c, "e2e8f0")
            ph = c.paragraphs[0]
            ph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            ph.paragraph_format.space_before = Pt(2)
            ph.paragraph_format.space_after  = Pt(2)
            rh = ph.add_run(h)
            rh.font.name = "Arial"; rh.font.size = Pt(8.5); rh.font.bold = True

        rows_data = [
            ("GET / health check",             "api.test.js", "200 OK",  "PASS"),
            ("GET /api/tasks no auth",          "api.test.js", "401",     "PASS"),
            ("GET /api/tasks bad header",       "api.test.js", "401",     "PASS"),
            ("GET /api/tasks invalid JWT",      "api.test.js", "401",     "PASS"),
            ("GET /api/debug/cache-stats",      "api.test.js", "200 OK",  "PASS"),
            ("GET /api/nonexistent 404",        "api.test.js", "404",     "PASS"),
            ("AI: missing GEMINI_API_KEY",      "ai.test.js",  "503",     "PASS"),
            ("AI: empty title",                 "ai.test.js",  "400",     "PASS"),
        ]

        for ri, (tc, suite, exp, res) in enumerate(rows_data, start=1):
            r = tbl.rows[ri]
            for ci, val in enumerate([tc, suite, exp, res]):
                c = r.cells[ci]
                c.width = widths[ci]
                set_cell_border(c, top="single", bottom="single", left="single", right="single", top_sz="4", bottom_sz="4", left_sz="4", right_sz="4")
                set_cell_bg(c, "dcfce7" if res == "PASS" else "fee2e2")
                pv = c.paragraphs[0]
                pv.alignment = WD_ALIGN_PARAGRAPH.CENTER
                pv.paragraph_format.space_before = Pt(2)
                pv.paragraph_format.space_after  = Pt(2)
                rv = pv.add_run(val)
                rv.font.name = "Arial"; rv.font.size = Pt(8.5)
                if res == "PASS" and ci == 3: rv.font.bold = True

        # Summary note
        pn = cell.add_paragraph()
        pn.paragraph_format.space_before = Pt(3)
        pn.paragraph_format.space_after  = Pt(1)
        rn = pn.add_run("Full results: 14 passed, 0 failed | Test Suites: 2 passed, 2 total | Time: 3.883s | Gemini SDK mocked throughout.")
        rn.font.size = Pt(8.5)

    add_row(t3, "Test Results:", build_test_table)

    def build_qa(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after  = Pt(1)

        qas = [
            ("Q1. Why must the AI API key be used on the backend rather than directly from React?",
             "Frontend JavaScript code is entirely visible to users — anyone can open browser DevTools, inspect the React bundle, or read environment variables prefixed VITE_ to find the key. A stolen key can be used by an attacker to make unlimited paid API calls, exhaust the credit limit, or access data associated with the account. The backend keeps the key in a server-side .env file that is never transmitted to the browser. The client sends only the task title to the application's own backend endpoint, which validates the request, enforces rate limiting, and calls Gemini on behalf of the authenticated user. This architecture provides access control, audit capability, and full key isolation from browser-reachable code."),
            ("Q2. What is graceful degradation, and why is it important?",
             "Graceful degradation means the application continues to provide its core functionality when a non-essential external dependency fails. In this practical, if the Gemini API key is missing, the provider is down, or a timeout occurs, the backend returns HTTP 503 with fallback:true and a safe user-facing message. The frontend displays a rose error banner but leaves the description field editable and the Create Task button fully operational. The user is never blocked from creating a task. Without graceful degradation, a temporary AI provider outage would break the entire task creation workflow, which is unacceptable for a production application."),
            ("Q3. What are the privacy and governance implications of sending task data to an external AI API?",
             "Data minimisation: only the task title is sent to Gemini; no user credentials, IDs, emails, full task lists, or session tokens are included. User transparency: the amber disclaimer informs users that their title is sent to Google's Gemini API. Provider data policies: Google's Gemini API usage policies govern how prompts are stored and whether they are used for training; users should consult these policies before entering confidential information. Governance: generated content is returned as editable text under full user control and is not persisted until the user explicitly submits the task. Human review: the disclaimer explicitly states the user must review and edit the AI suggestion before saving. Access control: the endpoint requires JWT authentication, so anonymous callers cannot trigger API calls."),
        ]

        for q, a in qas:
            pq = cell.add_paragraph()
            pq.paragraph_format.space_before    = Pt(2)
            pq.paragraph_format.space_after     = Pt(0.5)
            pq.paragraph_format.keep_with_next  = True
            rq = pq.add_run("• " + q + "\n")
            rq.font.bold = True; rq.font.size = Pt(8.5)
            ra = pq.add_run(a)
            ra.font.size = Pt(8)

    add_row(t3, "Viva Q&A / Analysis:", build_qa)

    def build_trouble(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after  = Pt(1)

        items = [
            ("setInterval open-handle warning in Jest:",
             " The rate-limiter cleanup interval kept Jest from exiting cleanly. Fixed by calling .unref() on the returned timer object so it does not prevent process exit."),
            ("AbortController signal parameter:",
             " The @google/generative-ai SDK passes the signal option through to the underlying fetch call; the controller.abort() successfully cancels in-flight requests within the 10s window."),
            ("jest.mock hoisting:",
             " jest.mock() calls are hoisted to the top of the test file by Jest's Babel transform. The mock factory must not reference out-of-scope variables; the _mockGenerateContent pattern attaches the mock function as a property of the mocked constructor for cross-test access."),
            ("Rate limit isolation between tests:",
             " The in-memory rateLimitMap persists across tests within a suite. Each test uses a unique title string to avoid collisions, and process.env.GEMINI_API_KEY is deleted in afterEach() to reset the client state."),
        ]
        for lbl, txt in items:
            pt = cell.add_paragraph()
            pt.paragraph_format.space_before = Pt(1)
            pt.paragraph_format.space_after  = Pt(1)
            rt = pt.add_run("• " + lbl)
            rt.font.bold = True; rt.font.size = Pt(8.5)
            pt.add_run(txt).font.size = Pt(8)

    add_row(t3, "Troubleshooting & Learnings:", build_trouble)

    def build_links(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after  = Pt(1)

        links = [
            ("GitHub Repository: ", "https://github.com/tirth266/myportfolio"),
            ("Commit (feat P13): ", "https://github.com/tirth266/myportfolio/commit/<hash>"),
            ("AI Routes File: ",    "https://github.com/tirth266/myportfolio/blob/main/backend/routes/aiRoutes.js"),
            ("AI Controller: ",     "https://github.com/tirth266/myportfolio/blob/main/backend/controllers/aiController.js"),
            ("AI Test Suite: ",     "https://github.com/tirth266/myportfolio/blob/main/backend/tests/ai.test.js"),
            ("GitHub Actions: ",    "https://github.com/tirth266/myportfolio/actions"),
            ("Gemini API Keys: ",   "https://aistudio.google.com/app/apikey"),
        ]
        for lbl, url in links:
            pl = cell.add_paragraph()
            pl.paragraph_format.space_before = Pt(0.5)
            pl.paragraph_format.space_after  = Pt(0.5)
            rl = pl.add_run(lbl)
            rl.font.bold = True; rl.font.size = Pt(8.5)
            ru = pl.add_run(url)
            ru.font.size = Pt(8)
            ru.font.color.rgb = RGBColor(30, 64, 175)

    add_row(t3, "GitHub & Reference Links:", build_links)

    # ── Save DOCX ─────────────────────────────────────────────────────────────

    docx_path = os.path.join(base_dir, "24AIML060_AWDF-P13.docx")
    doc.save(docx_path)
    print(f"DOCX created: {docx_path}")

    # ── Convert to PDF via Word automation ───────────────────────────────────

    pdf_path = os.path.join(base_dir, "24AIML060_AWDF-P13.pdf")
    try:
        import win32com.client
        import pythoncom
        pythoncom.CoInitialize()
        word     = win32com.client.DispatchEx("Word.Application")
        word.Visible = False
        doc_obj  = word.Documents.Open(docx_path)
        doc_obj.SaveAs(pdf_path, FileFormat=17)
        doc_obj.Close()
        word.Quit()
        print(f"PDF created via Word: {pdf_path}")
    except Exception as e:
        print(f"Word automation error (PDF skipped): {e}")


if __name__ == "__main__":
    create_p13_report()
