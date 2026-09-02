#!/usr/bin/env python3
"""
JEEVAN-AIR | Software Documentation PDF Builder
Team ZYNTAX — SIH26177 (Qualcomm Inc)
Builds the complete 35-section technical specification document and compiles it to PDF via Chrome headless.
"""

import os
import subprocess
import fitz  # PyMuPDF for inspection

html_path = "/Users/sheshagiri/jeevan air/docs/doc_pdf_source.html"
pdf_path = "/Users/sheshagiri/jeevan air/JEEVAN-AIR_Software_Documentation.pdf"

# HTML styling optimized for A4 print
css = """
@page {
  size: A4 portrait;
  margin: 18mm 16mm 18mm 16mm;
  @bottom-right {
    content: "Page " counter(page);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 8pt;
    color: #64748b;
  }
  @bottom-left {
    content: "JEEVAN-AIR (SIH26177) • Team ZYNTAX • Technical Documentation";
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 8pt;
    color: #64748b;
  }
}

* { box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1e293b;
  line-height: 1.55;
  font-size: 9.5pt;
}

/* Cover Page */
.cover-page {
  page-break-after: always;
  height: 98vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 20px;
  background: linear-gradient(145deg, #090e17 0%, #0f172a 50%, #1e293b 100%);
  color: #f8fafc;
  border-radius: 12px;
  border: 2px solid #334155;
}
.cover-top {
  border-bottom: 2px solid #0284c7;
  padding-bottom: 25px;
}
.cover-badge {
  display: inline-block;
  background: #0284c7;
  color: #ffffff;
  padding: 5px 14px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 9pt;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 15px;
}
.cover-title {
  font-size: 34pt;
  font-weight: 900;
  color: #38bdf8;
  letter-spacing: -0.5px;
  margin: 0;
  line-height: 1.1;
}
.cover-subtitle {
  font-size: 15pt;
  color: #94a3b8;
  font-weight: 500;
  margin-top: 8px;
}
.cover-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 30px 0;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
}
.cover-meta-item {
  display: flex;
  flex-direction: column;
}
.meta-label {
  font-size: 8pt;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}
.meta-val {
  font-size: 12pt;
  font-weight: 800;
  color: #f1f5f9;
  margin-top: 4px;
}
.meta-val.cyan { color: #38bdf8; }
.meta-val.emerald { color: #34d399; }
.meta-val.amber { color: #fbbf24; }

.cover-disclaimer {
  background: rgba(245, 158, 11, 0.1);
  border-left: 4px solid #f59e0b;
  padding: 14px 18px;
  border-radius: 0 8px 8px 0;
}
.cover-disclaimer p {
  font-size: 8.5pt;
  color: #fde68a;
  margin: 0;
  line-height: 1.45;
}
.cover-footer {
  border-top: 1px solid #334155;
  padding-top: 15px;
  display: flex;
  justify-content: space-between;
  font-size: 8pt;
  color: #64748b;
}

/* Headings */
h1 {
  color: #0f172a;
  font-size: 17pt;
  font-weight: 800;
  border-bottom: 2px solid #0284c7;
  padding-bottom: 5px;
  margin-top: 24px;
  margin-bottom: 12px;
  page-break-after: avoid;
}
h2 {
  color: #0369a1;
  font-size: 13pt;
  font-weight: 700;
  margin-top: 18px;
  margin-bottom: 8px;
  page-break-after: avoid;
}
h3 {
  color: #334155;
  font-size: 10.5pt;
  font-weight: 700;
  margin-top: 12px;
  margin-bottom: 6px;
  page-break-after: avoid;
}

p {
  margin-bottom: 8px;
  text-align: justify;
}

/* Tags / Badges */
.tag {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 7.5pt;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tag-impl { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
.tag-sim  { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
.tag-plan { background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe; }

/* Callout Boxes */
.callout {
  padding: 10px 14px;
  border-radius: 6px;
  margin: 12px 0;
  font-size: 9pt;
  page-break-inside: avoid;
}
.callout-amber {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  color: #92400e;
}
.callout-blue {
  background: #f0f9ff;
  border-left: 4px solid #0284c7;
  color: #075985;
}
.callout-emerald {
  background: #f0fdf4;
  border-left: 4px solid #10b981;
  color: #065f46;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 8.5pt;
  page-break-inside: avoid;
}
th {
  background: #0f172a;
  color: #ffffff;
  padding: 7px 10px;
  font-weight: 700;
  text-align: left;
  border: 1px solid #1e293b;
}
td {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  vertical-align: top;
}
tr:nth-child(even) td {
  background: #f8fafc;
}

/* Code & Pre */
pre {
  background: #090d16;
  color: #38bdf8;
  padding: 10px 14px;
  border-radius: 6px;
  font-family: "JetBrains Mono", Courier, monospace;
  font-size: 8pt;
  line-height: 1.4;
  overflow-x: auto;
  border: 1px solid #1e293b;
  margin: 10px 0;
  page-break-inside: avoid;
}
code {
  font-family: "JetBrains Mono", Courier, monospace;
  background: #f1f5f9;
  color: #0f172a;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 8.5pt;
}

/* Section Divider */
.page-break {
  page-break-after: always;
}

/* Diagram Container */
.diagram-box {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  text-align: center;
  page-break-inside: avoid;
}
.diagram-caption {
  font-size: 8pt;
  color: #64748b;
  font-weight: 600;
  margin-top: 6px;
}

ul, ol {
  margin-left: 20px;
  margin-bottom: 8px;
}
li {
  margin-bottom: 3px;
}
"""

print("Compiling full 35-section HTML document...")
os.system("python3 /Users/sheshagiri/jeevan\\ air/docs/build_full_pdf_html.py")

print("Rendering PDF via Google Chrome Headless...")
cmd = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    html_path
]
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("Chrome error:", res.stderr)
else:
    print("Chrome PDF render complete.")

if os.path.exists(pdf_path):
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"Generated PDF: {pdf_path} ({size_kb:.1f} KB)")
    
    # Inspect pages with PyMuPDF
    doc = fitz.open(pdf_path)
    page_count = len(doc)
    print(f"Total PDF pages: {page_count}")
    
    # Render first 3 pages and last page to check formatting
    qa_dir = "/Users/sheshagiri/jeevan air/screenshots/pdf_qa"
    os.makedirs(qa_dir, exist_ok=True)
    for i in [0, 1, 2, min(5, page_count-1), page_count-1]:
        page = doc.load_page(i)
        pix = page.get_pixmap(dpi=150)
        pix.save(f"{qa_dir}/page_{i+1}.png")
    print(f"QA snapshots saved to {qa_dir}")
else:
    print("ERROR: PDF was not generated.")
