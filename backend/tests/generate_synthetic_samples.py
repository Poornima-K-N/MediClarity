import os
import io
import pymupdf
from PIL import Image, ImageDraw, ImageFont

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
FIXTURES_DIR = os.path.join(TESTS_DIR, "fixtures")

os.makedirs(FIXTURES_DIR, exist_ok=True)

def create_synthetic_digital_pdf():
    """Generates a 1-page digital PDF with clean vector text."""
    path = os.path.join(FIXTURES_DIR, "synthetic_digital_report.pdf")
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842) # A4
    text = (
        "MEDICLARITY SYNTHETIC DEMONSTRATION REPORT\n"
        "PATIENT ID: DEMO-991823 (NON-CLINICAL SYNTHETIC SAMPLE)\n\n"
        "COMPLETE BLOOD COUNT (CBC) RESULTS:\n"
        "1. Hemoglobin: 14.5 g/dL (Reference: 13.5 - 17.5 g/dL) [NORMAL]\n"
        "2. White Blood Cell (WBC): 6,900 /mcL (Reference: 4,500 - 11,000) [NORMAL]\n"
        "3. Platelets: 250,000 /mcL (Reference: 150,000 - 450,000) [NORMAL]\n"
        "4. Hematocrit: 43.2% (Reference: 41.0 - 50.0%) [NORMAL]\n\n"
        "CLINICAL NOTE: Synthetic test document for MediClarity AI Module 2."
    )
    page.insert_text((50, 80), text, fontsize=12, fontname="helv")
    doc.save(path)
    doc.close()
    return path


def create_synthetic_scanned_pdf():
    """
    Generates a 1-page scanned PDF with NO digital text stream.
    The text is rendered onto a bitmap image and inserted as a full-page image.
    """
    path = os.path.join(FIXTURES_DIR, "synthetic_scanned_report.pdf")
    
    # 1. Render image with text
    img = Image.new('RGB', (800, 1100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    text = (
        "MEDICLARITY SYNTHETIC SCANNED PRESCRIPTION\n\n"
        "Rx: Amoxicillin 500mg\n"
        "Sig: Take 1 capsule three times daily with meals for 7 days\n"
        "Dispense: 21 capsules\n"
        "Refills: 0 (Zero)\n\n"
        "Dr. Synthetic Physician (Demo Record - Non-Clinical)"
    )
    draw.text((60, 100), text, fill=(20, 20, 20))

    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG', quality=85)
    img_bytes.seek(0)

    # 2. Insert image into PDF with NO text stream
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)
    page.insert_image(pymupdf.Rect(0, 0, 595, 842), stream=img_bytes.getvalue())
    doc.save(path)
    doc.close()
    return path


def create_synthetic_hybrid_pdf():
    """
    Generates a 2-page hybrid PDF:
    - Page 1: Digital text (CBC panel)
    - Page 2: Scanned bitmap image (Lipid panel note)
    """
    path = os.path.join(FIXTURES_DIR, "synthetic_hybrid_report.pdf")
    doc = pymupdf.open()

    # Page 1: Digital text
    page1 = doc.new_page(width=595, height=842)
    p1_text = (
        "MEDICLARITY SYNTHETIC HYBRID DOCUMENT - PAGE 1\n"
        "Digital Pathology Section: Electrolyte Panel\n"
        "Sodium: 140 mEq/L (Normal)\n"
        "Potassium: 4.2 mEq/L (Normal)\n"
        "Chloride: 101 mEq/L (Normal)\n"
        "Synthetic demo data for hybrid OCR evaluation."
    )
    page1.insert_text((50, 80), p1_text, fontsize=12, fontname="helv")

    # Page 2: Bitmap image only (Scanned)
    img = Image.new('RGB', (800, 1100), color=(250, 250, 250))
    draw = ImageDraw.Draw(img)
    p2_text = (
        "PAGE 2: SCANNED DOCTOR CONSULTATION NOTE\n\n"
        "Lipid Assessment: Total Cholesterol 192 mg/dL\n"
        "HDL Cholesterol: 54 mg/dL\n"
        "Patient advised on dietary balance.\n"
        "Synthetic demo test document."
    )
    draw.text((60, 100), p2_text, fill=(30, 30, 30))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG', quality=85)
    img_bytes.seek(0)

    page2 = doc.new_page(width=595, height=842)
    page2.insert_image(pymupdf.Rect(0, 0, 595, 842), stream=img_bytes.getvalue())

    doc.save(path)
    doc.close()
    return path


def create_synthetic_image():
    """Generates a synthetic prescription PNG image."""
    path = os.path.join(FIXTURES_DIR, "synthetic_prescription.png")
    img = Image.new('RGB', (850, 450), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    text = (
        "MEDICLARITY CLINIC - SYNTHETIC PRESCRIPTION DEMO\n\n"
        "Rx: Metformin 500 mg Tablets\n"
        "Directions: Take 1 tablet twice daily with food\n"
        "Quantity: 60 Tablets\n"
        "Notes: Educational preview only. Not real patient data."
    )
    draw.text((40, 50), text, fill=(15, 15, 15))
    img.save(path, format='PNG')
    return path


def create_corrupt_file():
    """Creates a corrupted file disguised as PDF."""
    path = os.path.join(FIXTURES_DIR, "corrupt_file.pdf")
    with open(path, 'wb') as f:
        f.write(b"%PDF-1.4 Damaged and completely unreadable garbage data 1234567890")
    return path


def generate_all():
    print("Generating synthetic demo test fixtures in tests/fixtures/...")
    d_pdf = create_synthetic_digital_pdf()
    s_pdf = create_synthetic_scanned_pdf()
    h_pdf = create_synthetic_hybrid_pdf()
    img = create_synthetic_image()
    corrupt = create_corrupt_file()
    print("Generated:")
    print(f" - {d_pdf}")
    print(f" - {s_pdf}")
    print(f" - {h_pdf}")
    print(f" - {img}")
    print(f" - {corrupt}")

if __name__ == '__main__':
    generate_all()
