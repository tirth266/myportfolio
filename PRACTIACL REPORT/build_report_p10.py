import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_p10_report():
    doc = docx.Document()

    # Page Margins: 0.5 in
    for section in doc.sections:
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)

    base_dir = r"C:\Users\Dell\OneDrive\Desktop\Mern\Myportfolio\PRACTIACL REPORT"
    logo_path = os.path.join(base_dir, "extracted_p6", "p6_page0_img2.png")
    shots_dir = os.path.join(base_dir, "screenshots_p10")

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
    # HEADER (Matching P6, P7, P8, P9)
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
    # MASTER 2-COLUMN TABLE
    # -------------------------------------------------------------
    table = doc.add_table(rows=0, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    def add_row(label, content_fn):
        r = table.add_row()
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

    # Row 1: Practical Statement
    def build_stmt(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        rt = p.add_run("Practical 10: Asynchronous Processing with Event-Driven Architecture\n")
        rt.font.bold = True
        rt.font.size = Pt(10.5)

        bullets = [
            "Created a centralized EventEmitter module (events/emitter.js) using Node.js built-in 'node:events' to decouple background tasks from request-response cycles.",
            "Implemented background event listeners (events/listeners.js) for email dispatch simulation (2s delay) and audit logging that execute asynchronously after HTTP response.",
            "Built synchronous baseline endpoint (POST /api/messages/sync) with inline 2-second blocking delay to measure before-optimization response time (~2,207 ms avg).",
            "Converted main contact endpoint (POST /api/messages) to emit 'messageReceived' event and respond immediately with 201, achieving ~19 ms average response time (99.1% improvement).",
            "Demonstrated fault tolerance with a deliberately crashing listener (POST /api/messages/fault-test) that proves background errors never affect the HTTP response or crash the server."
        ]
        for b in bullets:
            pb = cell.add_paragraph()
            pb.paragraph_format.space_before = Pt(1)
            pb.paragraph_format.space_after = Pt(1)
            pb.paragraph_format.left_indent = Inches(0.2)
            rb = pb.add_run("  " + b)
            rb.font.size = Pt(9.5)

    add_row("Practical Statement:", build_stmt)

    # Helper: Add embedded screenshot image
    def add_screenshot_item(cell, title, img_filename):
        p = cell.add_paragraph()
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(title)
        r.font.bold = True
        r.font.size = Pt(9.5)

        img_path = os.path.join(shots_dir, img_filename)
        if os.path.exists(img_path):
            p_img = cell.add_paragraph()
            p_img.paragraph_format.space_before = Pt(1)
            p_img.paragraph_format.space_after = Pt(2)
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.add_run().add_picture(img_path, width=Inches(4.65))
        else:
            p_box = cell.add_paragraph()
            p_box.add_run(f"[ Missing Screenshot: {img_filename} ]")

    # Row 2: Screenshots section
    def build_shots(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.add_run("Verification & Benchmark Evidence:\n").font.bold = True

        add_screenshot_item(cell, "1. Synchronous Baseline: 3 POST /api/messages/sync readings (blocking 2s delay)", "01_sync_baseline_3_readings.png")
        add_screenshot_item(cell, "2. Code: EventEmitter module & background listeners", "02_code_emitter_listeners.png")
        add_screenshot_item(cell, "3. Code: Sync vs Async controller comparison (emit + immediate 201)", "03_code_async_controller.png")
        add_screenshot_item(cell, "4. Async Event-Driven: 3 POST /api/messages readings (instant response)", "04_async_3_readings.png")
        add_screenshot_item(cell, "5. Fault Tolerance: Background listener error isolation proof", "05_fault_tolerance_proof.png")
        add_screenshot_item(cell, "6. Server Console: Background listeners completing after HTTP response", "06_console_background_listeners.png")

        # 7. Comparison Table
        p_tbl_title = cell.add_paragraph()
        p_tbl_title.paragraph_format.space_before = Pt(6)
        p_tbl_title.paragraph_format.space_after = Pt(2)
        r_tt = p_tbl_title.add_run("7. Response Time Comparison Table (Measured Values):")
        r_tt.font.bold = True
        r_tt.font.size = Pt(9.5)

        comp_table = cell.add_table(rows=4, cols=5)
        comp_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        comp_table.autofit = False

        headers = ["Execution Mode", "Reading 1", "Reading 2", "Reading 3", "Average Time"]
        widths = [Inches(1.7), Inches(0.9), Inches(0.9), Inches(0.9), Inches(1.0)]

        hdr_row = comp_table.rows[0]
        for i, h in enumerate(headers):
            c = hdr_row.cells[i]
            c.width = widths[i]
            set_cell_background(c, "e4e4e7")
            set_cell_border(c, top="single", bottom="single", left="single", right="single", top_sz="4", bottom_sz="4", left_sz="4", right_sz="4")
            ph = c.paragraphs[0]
            ph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            rh = ph.add_run(h)
            rh.font.bold = True
            rh.font.size = Pt(8)

        data = [
            ("Synchronous (inline 2s)", "2,218 ms", "2,205 ms", "2,197 ms", "2,207 ms"),
            ("Async (event-driven)", "24 ms", "18 ms", "16 ms", "19 ms"),
            ("Performance Difference", "-2,194 ms", "-2,187 ms", "-2,181 ms", "-2,188 ms (99.1%)")
        ]

        for r_idx, row_data in enumerate(data):
            dr = comp_table.rows[r_idx + 1]
            for c_idx, val in enumerate(row_data):
                c = dr.cells[c_idx]
                c.width = widths[c_idx]
                set_cell_border(c, top="single", bottom="single", left="single", right="single", top_sz="4", bottom_sz="4", left_sz="4", right_sz="4")
                pd = c.paragraphs[0]
                if c_idx > 0:
                    pd.alignment = WD_ALIGN_PARAGRAPH.CENTER
                rd = pd.add_run(val)
                rd.font.size = Pt(8)
                if r_idx == 1 and c_idx > 0:
                    rd.font.bold = True
                    rd.font.color.rgb = RGBColor(22, 101, 52)
                if r_idx == 2 and c_idx in (1, 2, 3, 4):
                    rd.font.bold = True
                    rd.font.color.rgb = RGBColor(22, 101, 52)

    add_row("Screenshots :", build_shots)

    # Row 3: Key Questions
    def build_qa(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)

        qas = [
            ("How does the EventEmitter decouple the request-response cycle from slow background tasks?",
             "The EventEmitter acts as a message bus between the HTTP controller and background services. When the controller calls appEmitter.emit('messageReceived', doc), it places the event on the event loop and returns immediately without waiting for any listener to finish. The listeners execute asynchronously in their own microtask context, so the 2-second email simulation runs entirely after the 201 response has already been sent to the client. This decoupling means the client never experiences the latency of background operations."),
            ("What happens if a background event listener throws an unhandled error? How did you prevent it from crashing the server?",
             "If a listener throws an unhandled error inside an EventEmitter, by default Node.js would emit an 'error' event, and if uncaught, crash the process. I prevented this by wrapping every listener body in a try/catch block. The /api/messages/fault-test endpoint proves this: it emits 'testFaultyListener' which throws internally, but the error is caught and logged gracefully. The HTTP response still returns 201, and the server process continues running without interruption."),
            ("Why is this pattern superior to simply using setTimeout or setImmediate for background work?",
             "EventEmitter provides a structured, named-event architecture that separates concerns cleanly. With setTimeout, the background logic is tightly coupled to the controller function. With EventEmitter, multiple independent listeners can subscribe to the same event (e.g., both email dispatch and audit logging listen to 'messageReceived'), new listeners can be added without modifying the controller, and the pattern scales to complex workflows. It also aligns with Node.js conventions and makes the codebase more testable and maintainable.")
        ]

        for q, a in qas:
            pq = cell.add_paragraph()
            pq.paragraph_format.space_before = Pt(2)
            pq.paragraph_format.space_after = Pt(1)
            rq = pq.add_run("  " + q + "\n")
            rq.font.bold = True
            rq.font.size = Pt(9.5)
            ra = pq.add_run(a)
            ra.font.size = Pt(9)

    add_row("Key Questions / Analysis:", build_qa)

    # Row 4: GitHub Repo Link
    def build_gh(cell):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run("https://github.com/tirth266/myportfolio.git")
        r.font.bold = True
        r.font.size = Pt(10)

    add_row("Github Repo Link:", build_gh)

    # Save DOCX
    docx_path = os.path.join(base_dir, "24AIML060_AWDF-P10.docx")
    doc.save(docx_path)
    print(f"DOCX created: {docx_path}")

    # Convert to PDF
    pdf_path = os.path.join(base_dir, "24AIML060_AWDF-P10.pdf")
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
    create_p10_report()
