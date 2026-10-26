import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_p12_report():
    doc = docx.Document()

    # Page Margins: 0.5 in
    for section in doc.sections:
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)

    base_dir = r"C:\Users\Dell\OneDrive\Desktop\Mern\Myportfolio\PRACTIACL REPORT"
    logo_path = os.path.join(base_dir, "extracted_p6", "p6_page0_img2.png")
    shots_dir = os.path.join(base_dir, "screenshots_p12")

    def set_cell_border(cell, **kwargs):
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>\n'
            f'<w:top w:val="{kwargs.get("top", "single")}" w:sz="{kwargs.get("top_sz", "4")}" w:space="0" w:color="{kwargs.get("top_color", "000000")}"/>\n'
            f'<w:left w:val="{kwargs.get("left", "single")}" w:sz="{kwargs.get("left_sz", "4")}" w:space="0" w:color="{kwargs.get("left_color", "000000")}"/>\n'
            f'<w:bottom w:val="{kwargs.get("bottom", "single")}" w:sz="{kwargs.get("bottom_sz", "4")}" w:space="0" w:color="{kwargs.get("bottom_color", "000000")}"/>\n'
            f'<w:right w:val="{kwargs.get("right", "single")}" w:sz="{kwargs.get("right_sz", "4")}" w:space="0" w:color="{kwargs.get("right_color", "000000")}"/>\n'
            f'</w:tcBorders>'
        )
        tcPr.append(tcBorders)

    def set_cell_background(cell, fill_hex):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        tcPr.append(shd)

    # -------------------------------------------------------------
    # HEADER (Matching P6, P7, P8, P9, P10, P11)
    # -------------------------------------------------------------
    p_id = doc.add_paragraph()
    p_id.paragraph_format.space_before = Pt(0)
    p_id.paragraph_format.space_after = Pt(2)
    run_id = p_id.add_run("Student ID: 24AIML060")
    run_id.font.name = "Arial"
    run_id.font.size = Pt(11)
    run_id.font.bold = True

    header_table = doc.add_table(rows=1, cols=2)
    header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    header_table.autofit = False
    header_table.columns[0].width = Inches(1.1)
    header_table.columns[1].width = Inches(6.4)

    row = header_table.rows[0]
    cell_logo = row.cells[0]
    cell_logo.width = Inches(1.1)
    cell_logo.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    if os.path.exists(logo_path):
        p_logo = cell_logo.paragraphs[0]
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(0)
        p_logo.paragraph_format.space_after = Pt(0)
        p_logo.add_run().add_picture(logo_path, width=Inches(0.95))

    cell_text = row.cells[1]
    cell_text.width = Inches(6.4)
    cell_text.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p_uni = cell_text.paragraphs[0]
    p_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_uni.paragraph_format.space_before = Pt(0)
    p_uni.paragraph_format.space_after = Pt(1)

    r1 = p_uni.add_run("CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY\n")
    r1.font.name = "Arial"
    r1.font.size = Pt(12)
    r1.font.bold = True

    r2 = p_uni.add_run("FACULTY OF TECHNOLOGY AND ENGINEERING\nB. TECH (IT/CE/CSE/AIML)\n")
    r2.font.name = "Arial"
    r2.font.size = Pt(10)
    r2.font.bold = True

    r3 = p_uni.add_run("Subject: Advanced Web Development Frameworks (ITUE301) | Semester: 5th")
    r3.font.name = "Arial"
    r3.font.size = Pt(10)
    r3.font.bold = True

    p_gap = doc.add_paragraph()
    p_gap.paragraph_format.space_before = Pt(2)
    p_gap.paragraph_format.space_after = Pt(4)

    # -------------------------------------------------------------
    # 2-COLUMN TABLE BUILDER HELPER
    # -------------------------------------------------------------
    def create_section_table():
        tbl = doc.add_table(rows=0, cols=2)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        return tbl

    def add_row(tbl, label, content_fn):
        r = tbl.add_row()
        c_lbl = r.cells[0]
        c_cnt = r.cells[1]
        c_lbl.width = Inches(1.85)
        c_cnt.width = Inches(5.65)

        set_cell_border(c_lbl, top="single", bottom="single", left="single", right="single", top_sz="6", bottom_sz="6", left_sz="6", right_sz="6")
        set_cell_border(c_cnt, top="single", bottom="single", left="single", right="single", top_sz="6", bottom_sz="6", left_sz="6", right_sz="6")
        set_cell_background(c_lbl, "f4f4f5")

        p = c_lbl.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        rl = p.add_run(label)
        rl.font.name = "Arial"
        rl.font.size = Pt(10)
        rl.font.bold = True

        content_fn(c_cnt)
        return r

    # -------------------------------------------------------------
    # TABLE 1: STATEMENT, OBJECTIVE, THEORY, ARCHITECTURE (PAGE 1)
    # -------------------------------------------------------------
    table_p1 = create_section_table()

    def build_stmt(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        rt = p.add_run("Practical 12: CI/CD Pipeline with GitHub Actions\n")
        rt.font.bold = True
        rt.font.size = Pt(10.5)

        bullets = [
            "Objective: Automate testing and deployment-related validation of the existing Task Management application using a Continuous Integration (CI) pipeline with GitHub Actions.",
            "Architected a declarative workflow (.github/workflows/ci.yml) targeting pushes and pull requests to the main branch with automated triggers and GitHub Actions status reporting.",
            "Configured monorepo-aware parallel validation jobs (Backend API Automated Tests and Frontend Build & Validation) running on ubuntu-latest with Node.js 20 and npm dependency caching via package-lock.json.",
            "Developed an automated integration test suite (backend/tests/api.test.js) using Jest and Supertest that tests root health (/), authentication guards (/api/tasks), cache statistics (/api/debug/cache-stats), and 404 handlers without requiring external databases.",
            "Demonstrated a genuine pipeline failure by introducing a deliberate assertion error (Commit c293d5e, Run #40315087433), recording GitHub Actions non-zero exit code reporting, and restoring green status (Commit 34e597a, Run #40315324202).",
            "Added an active GitHub Actions CI status badge and comprehensive Practical 12 documentation to the repository README.md with verified links."
        ]
        for b in bullets:
            pb = cell.add_paragraph()
            pb.paragraph_format.space_before = Pt(1)
            pb.paragraph_format.space_after = Pt(1)
            pb.paragraph_format.left_indent = Inches(0.2)
            rb = pb.add_run("• " + b)
            rb.font.size = Pt(9.5)

    add_row(table_p1, "Practical Statement & Objective:", build_stmt)

    def build_theory(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.add_run("CI/CD Fundamentals & Pipeline Architecture:\n").font.bold = True

        pts = [
            ("Continuous Integration (CI):", " A software engineering practice where developers frequently merge code changes into a central repository. Every push triggers automated builds, dependency resolution, linting, and unit/integration test suites to detect regressions immediately."),
            ("Continuous Deployment (CD):", " The automated extension of CI where code changes that pass all pipeline gates are automatically provisioned and deployed to staging or production environments without manual human intervention."),
            ("Practical Scope Distinction:", " This practical explicitly demonstrates Continuous Integration (automated testing, build compilation, and status checks). It validates deployment readiness but does not constitute full Continuous Deployment since automated server provisioning/deployment is intentionally separated."),
            ("Pipeline Architecture:", " Developer commits code → git push origin main → GitHub Webhook triggers GitHub Actions runner (Ubuntu VM) → Checkout repository (actions/checkout@v4) → Setup Node.js 20 with npm lockfile caching → Parallel Jobs: [1] Backend: npm install + Jest API integration tests; [2] Frontend: npm install + Vite production build → Pass/Fail exit code evaluation → Status badge update.")
        ]
        for label, desc in pts:
            pb = cell.add_paragraph()
            pb.paragraph_format.space_before = Pt(1)
            pb.paragraph_format.space_after = Pt(1)
            pb.paragraph_format.left_indent = Inches(0.15)
            r_lbl = pb.add_run("• " + label)
            r_lbl.font.bold = True
            r_lbl.font.size = Pt(9.5)
            r_desc = pb.add_run(desc)
            r_desc.font.size = Pt(9)

    add_row(table_p1, "Theory & Architecture:", build_theory)

    # PAGE BREAK TO SCREENSHOTS
    doc.add_page_break()

    # -------------------------------------------------------------
    # TABLE 2: SCREENSHOTS & EVIDENCE (PAGES 2 - 6)
    # -------------------------------------------------------------
    table_shots = create_section_table()

    def add_screenshot_item(cell, title, img_filename):
        p = cell.add_paragraph()
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(title)
        r.font.bold = True
        r.font.size = Pt(9.5)

        img_path = os.path.join(shots_dir, img_filename)
        if os.path.exists(img_path):
            p_img = cell.add_paragraph()
            p_img.paragraph_format.space_before = Pt(1)
            p_img.paragraph_format.space_after = Pt(4)
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.add_run().add_picture(img_path, width=Inches(4.65))
        else:
            p_box = cell.add_paragraph()
            p_box.add_run(f"[ Missing Screenshot: {img_filename} ]")

    def build_shots(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        p.add_run("GitHub Actions CI/CD Pipeline Evidence:\n").font.bold = True

        add_screenshot_item(cell, "Figure 1: Code: GitHub Actions Workflow (.github/workflows/ci.yml)", "01_code_ci_workflow_yaml.png")
        add_screenshot_item(cell, "Figure 2: Code: Express API Automated Test Suite (backend/tests/api.test.js)", "02_code_api_integration_tests.png")
        add_screenshot_item(cell, "Figure 3: Terminal: Local Jest Automated Test Execution (6/6 passing in 1.9s)", "03_terminal_local_test_passing.png")
        add_screenshot_item(cell, "Figure 4: Terminal: Deliberate Failure Demonstration & Commit c293d5e", "04_terminal_deliberate_failure.png")
        add_screenshot_item(cell, "Figure 5: GitHub Actions UI: Deliberate Failed Workflow Run #40315087433", "05_github_actions_failed_run.png")
        add_screenshot_item(cell, "Figure 6: GitHub Actions UI: Failed Job Step Log (Assertion Error: Expected 201, Received 200)", "06_github_actions_failed_logs.png")
        add_screenshot_item(cell, "Figure 7: GitHub Actions UI: Successful Passing Workflow Run #40315324202 (Green Checkmarks)", "07_github_actions_successful_run.png")
        add_screenshot_item(cell, "Figure 8: GitHub Actions UI: Successful Backend Job Completed Steps & Test Output", "08_github_actions_successful_logs.png")
        add_screenshot_item(cell, "Figure 9: GitHub Actions UI: Workflow Runs History (Passing, Deliberate Failure, Restored)", "09_github_actions_runs_history.png")
        add_screenshot_item(cell, "Figure 10: GitHub UI: Repository README with Passing CI/CD Pipeline Badge", "10_github_readme_badge.png")

    add_row(table_shots, "Screenshots & Evidence:", build_shots)

    # PAGE BREAK TO ANALYSIS & QUESTIONS
    doc.add_page_break()

    # -------------------------------------------------------------
    # TABLE 3: RUNS SUMMARY, VIVA QUESTIONS, TROUBLESHOOTING, LINKS
    # -------------------------------------------------------------
    table_analysis = create_section_table()

    def build_runs_table(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.add_run("Verified GitHub Actions Runs Summary:\n").font.bold = True

        runs_table = cell.add_table(rows=4, cols=6)
        runs_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        runs_table.autofit = False

        headers = ["Run ID", "Commit", "Status", "Backend Job", "Frontend Job", "Duration"]
        widths = [Inches(1.0), Inches(0.8), Inches(0.8), Inches(1.1), Inches(1.1), Inches(0.85)]

        hdr_row = runs_table.rows[0]
        for i, h in enumerate(headers):
            c = hdr_row.cells[i]
            c.width = widths[i]
            set_cell_border(c, top="single", bottom="single", left="single", right="single", top_sz="4", bottom_sz="4", left_sz="4", right_sz="4")
            set_cell_background(c, "e2e8f0")
            ph = c.paragraphs[0]
            ph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            ph.paragraph_format.space_before = Pt(2)
            ph.paragraph_format.space_after = Pt(2)
            rh = ph.add_run(h)
            rh.font.name = "Arial"
            rh.font.size = Pt(8.5)
            rh.font.bold = True

        run_data = [
            ("40314911747", "f180900", "SUCCESS", "PASS (16s)", "PASS (17s)", "21s"),
            ("40315087433", "c293d5e", "FAILURE", "FAIL (16s)", "PASS (15s)", "21s"),
            ("40315324202", "34e597a", "SUCCESS", "PASS (16s)", "PASS (12s)", "21s")
        ]

        for row_idx, data in enumerate(run_data, start=1):
            r = runs_table.rows[row_idx]
            for col_idx, val in enumerate(data):
                c = r.cells[col_idx]
                c.width = widths[col_idx]
                set_cell_border(c, top="single", bottom="single", left="single", right="single", top_sz="4", bottom_sz="4", left_sz="4", right_sz="4")
                if "FAIL" in val:
                    set_cell_background(c, "fee2e2")
                elif "SUCCESS" in val or "PASS" in val:
                    set_cell_background(c, "dcfce7")
                else:
                    set_cell_background(c, "ffffff")
                
                pv = c.paragraphs[0]
                pv.alignment = WD_ALIGN_PARAGRAPH.CENTER
                pv.paragraph_format.space_before = Pt(2)
                pv.paragraph_format.space_after = Pt(2)
                rv = pv.add_run(val)
                rv.font.name = "Arial"
                rv.font.size = Pt(8.5)
                if val in ["SUCCESS", "FAILURE", "PASS (16s)", "FAIL (16s)"]:
                    rv.font.bold = True

    add_row(table_analysis, "Pipeline Runs Summary:", build_runs_table)

    def build_qa(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(1)

        qas = [
            ("Continuous Integration vs. Continuous Deployment & Practical Scope:",
             "Continuous Integration (CI) is the practice of automatically integrating code changes frequently, verifying each push with automated builds and test suites. Continuous Deployment (CD) automatically provisions and deploys passing builds directly to production without human intervention. This practical specifically demonstrates CI (automated test validation and build compilation); it does not deploy to production servers."),
            ("Early Detection via Automated Testing on Push:",
             "Testing on every push catches regressions immediately when code context is fresh and changes are small. In contrast, manual testing before a release batches weeks of changes, making defect root-cause analysis significantly harder and delaying releases. CI provides instant feedback."),
            ("Incorrect Test File Path vs. Genuine Assertion Failure:",
             "An incorrect test path fails at discovery ('No tests found' or 'Cannot find module') without executing test logic. A genuine assertion failure executes test code, but actual output differs from expected (e.g., received 200 vs. expected 201). Both return non-zero exit codes in CI, but their root causes differ."),
            ("Dependency Caching in Monorepos:",
             "actions/setup-node with cache: 'npm' keyed to package-lock.json restores node_modules from GitHub's internal cache in seconds rather than redownloading packages on every push, saving minutes per run.")
        ]

        for q, a in qas:
            pq = cell.add_paragraph()
            pq.paragraph_format.space_before = Pt(1)
            pq.paragraph_format.space_after = Pt(0.5)
            pq.paragraph_format.keep_with_next = True
            rq = pq.add_run("• " + q + "\n")
            rq.font.bold = True
            rq.font.size = Pt(8.5)
            ra = pq.add_run(a)
            ra.font.size = Pt(8)

    add_row(table_analysis, "Key Questions / Viva Analysis:", build_qa)

    def build_troubleshooting(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(1)

        troubles = [
            ("Test Runner Collision (Jest vs. node:test):", " The backend had existing tests for Node's 'node:test' harness needing MongoDB. Resolved by targeting 'jest tests/api.test.js --detectOpenHandles --forceExit' in package.json test script."),
            ("Database Decoupling in CI:", " Real DB connections cause CI flakiness. Testing through Express and Supertest under NODE_ENV=test (skipping MongoDB connection) validated endpoints deterministically with zero DB dependency."),
            ("Exit Code Enforcement:", " Verified assertion failures properly propagate exit code 1 to the shell, ensuring GitHub Actions runner registers failures immediately and halts downstream steps.")
        ]
        for t, s in troubles:
            pt = cell.add_paragraph()
            pt.paragraph_format.space_before = Pt(0.5)
            pt.paragraph_format.space_after = Pt(0.5)
            rt = pt.add_run("• " + t)
            rt.font.bold = True
            rt.font.size = Pt(8.5)
            rs = pt.add_run(" " + s)
            rs.font.size = Pt(8)

    add_row(table_analysis, "Troubleshooting & Learnings:", build_troubleshooting)

    def build_gh(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(1)
        
        links = [
            ("GitHub Repository URL: ", "https://github.com/tirth266/myportfolio.git"),
            ("GitHub Actions Dashboard: ", "https://github.com/tirth266/myportfolio/actions"),
            ("Passing Run #40314911747: ", "https://github.com/tirth266/myportfolio/actions/runs/40314911747"),
            ("Failing Run #40315087433: ", "https://github.com/tirth266/myportfolio/actions/runs/40315087433"),
            ("Corrected Run #40315324202: ", "https://github.com/tirth266/myportfolio/actions/runs/40315324202"),
            ("Workflow YAML: ", "https://github.com/tirth266/myportfolio/blob/main/.github/workflows/ci.yml")
        ]
        for lbl, url in links:
            pl = cell.add_paragraph()
            pl.paragraph_format.space_before = Pt(0.5)
            pl.paragraph_format.space_after = Pt(0.5)
            rl = pl.add_run(lbl)
            rl.font.bold = True
            rl.font.size = Pt(8.5)
            ru = pl.add_run(url)
            ru.font.size = Pt(8)
            ru.font.color.rgb = RGBColor(30, 64, 175)

    add_row(table_analysis, "Github Links & Verification:", build_gh)

    # Save DOCX
    docx_path = os.path.join(base_dir, "24AIML060_AWDF-P12.docx")
    doc.save(docx_path)
    print(f"DOCX created: {docx_path}")

    # Convert to PDF
    pdf_path = os.path.join(base_dir, "24AIML060_AWDF-P12.pdf")
    try:
        import win32com.client
        import pythoncom
        pythoncom.CoInitialize()
        word = win32com.client.DispatchEx("Word.Application")
        word.Visible = False
        doc_obj = word.Documents.Open(docx_path)
        doc_obj.SaveAs(pdf_path, FileFormat=17)
        doc_obj.Close()
        word.Quit()
        print(f"PDF created via Word: {pdf_path}")
    except Exception as e:
        print(f"Word automation error: {e}")

if __name__ == "__main__":
    create_p12_report()
