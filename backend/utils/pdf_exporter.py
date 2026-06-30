import html

from odoo.exceptions import UserError


def build_pdf(resource, headers, rows):
    try:
        import pdfkit
    except ImportError as exc:
        raise UserError("Can cai thu vien pdfkit de export PDF.") from exc

    table_head = "".join(f"<th>{html.escape(str(header))}</th>" for header in headers)
    table_rows = []
    for row in rows:
        cells = "".join(f"<td>{html.escape(str(value or ''))}</td>" for value in row)
        table_rows.append(f"<tr>{cells}</tr>")

    html_content = f"""
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; font-size: 12px; }}
            h1 {{ font-size: 20px; margin-bottom: 16px; }}
            table {{ border-collapse: collapse; width: 100%; }}
            th, td {{ border: 1px solid #333; padding: 6px; text-align: left; }}
            th {{ background: #f2f2f2; }}
        </style>
    </head>
    <body>
        <h1>{html.escape(resource)} export</h1>
        <table>
            <thead><tr>{table_head}</tr></thead>
            <tbody>{''.join(table_rows)}</tbody>
        </table>
    </body>
    </html>
    """

    try:
        return pdfkit.from_string(html_content, False)
    except OSError as exc:
        raise UserError("Can cai wkhtmltopdf tren may de pdfkit tao file PDF.") from exc
