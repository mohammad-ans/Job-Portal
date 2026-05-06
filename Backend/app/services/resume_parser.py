import io


def extract_text(file_bytes: bytes, filename: str) -> str:
    name = filename.lower()
    if name.endswith(".pdf"):
        return _extract_pdf(file_bytes)
    if name.endswith(".docx") or name.endswith(".doc"):
        return _extract_docx(file_bytes)
    return ""


def _extract_pdf(file_bytes: bytes) -> str:
    from pdfminer.high_level import extract_text as _pdf_extract
    try:
        return _pdf_extract(io.BytesIO(file_bytes)) or ""
    except Exception:
        return ""


def _extract_docx(file_bytes: bytes) -> str:
    import docx
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join(para.text for para in doc.paragraphs)
    except Exception:
        return ""
