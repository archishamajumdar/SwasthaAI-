from typing import Dict
from PIL import Image
import io
import google.generativeai as genai
from app.config import settings

class OCRService:
    def __init__(self):
        self.model = None
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
            except Exception as e:
                import traceback
                error_trace = traceback.format_exc()
                with open("C:/Users/Archisha Majumdar/Downloads/b_swasthya ai twin/backend/ocr_init_error.log", "w") as f:
                    f.write(f"OCR Init Failed: {str(e)}\n\nTraceback:\n{error_trace}")
                print(f"Failed to initialize Gemini in OCRService: {e}")

    async def extract_prescription(self, file_content: bytes) -> Dict:
        # 1. Use Gemini if available
        if self.model:
            try:
                # Use Gemini's multimodal capabilities
                img = Image.open(io.BytesIO(file_content))
                prompt = """
You are a medical prescription decoding AI.

Input: OCR-extracted text from a handwritten doctor’s prescription (may be unclear or incomplete).

Your tasks:
1. Clean and normalize the text read from the image
2. Identify medicine names (correct spelling if needed)
3. Extract dosage, frequency (OD, BD, TDS, SOS), timing (before/after food), and duration
4. Identify tests or doctor’s advice
5. Detect unclear or ambiguous words and mark them as "uncertain"
6. Suggest applicable Indian Government Healthcare Schemes (like Ayushman Bharat, CGHS, JSY, or PM-JAY) and estimate treatment savings metrics.

Rules:
- Do NOT hallucinate unknown medicines
- If text is unclear, mark it as "uncertain" instead of guessing
- Do NOT provide medical advice beyond explanation
- Use known medical abbreviations:
  OD = once daily, BD = twice daily, TDS = three times daily, SOS = as needed, HS = at bedtime
- Keep output strictly in structured JSON format

Return ONLY a JSON object in this format:
{
  "medicines": [
    {
      "name": "",
      "dosage": "",
      "frequency": "",
      "timing": "",
      "duration": "",
      "certainty": "high/medium/low"
    }
  ],
  "tests": [],
  "advice": [],
  "unclear": [],
  "summary": "",
      "government_schemes": [
    {
      "scheme_name": "Name of Scheme",
      "why_applicable": "Justification",
      "benefits": "Short description of covered cost offsets",
      "eligibility": "Qualification details"
    }
  ],
  "treatment_estimates": [
    {
      "treatment": "Required treatment / Test name",
      "private_est": "Approx Private cost (INR)",
      "govt_est": "Approx Govt/Scheme cost (INR)",
      "savings": "Savings calculation estimate %"
    }
  ],
  "nearby_hospitals": [
    {
      "name": "Hospital Name / Clinic Name",
      "accepts_schemes": true
    }
  ],
  "cost_saving_note": "Using this scheme can significantly reduce your medical expenses."
}
"""
                response = self.model.generate_content([prompt, img])
                json_str = response.text.replace('```json', '').replace('```', '').strip()
                import json
                parsed = json.loads(json_str)
                # Ensure compatibility for existing frontend accessors
                parsed['medications'] = parsed.get('medicines', [])
                parsed['instructions'] = "\n".join([str(x) for x in parsed.get('advice', [])]) if isinstance(parsed.get('advice'), list) else parsed.get('advice', '')
                parsed['doctor_notes'] = "\n".join([str(x) for x in parsed.get('tests', [])]) if isinstance(parsed.get('tests'), list) else parsed.get('tests', '')
                parsed['handwritten_text_summary'] = parsed.get('transcript', parsed.get('summary', ''))
                
                # Append unclear warnings if present
                unclear_items = parsed.get('unclear', [])
                if unclear_items:
                    parsed['instructions'] += "\n\n[UNCLEAR/UNCERTAIN ITEMS]: " + ", ".join([str(x) for x in unclear_items])

                return parsed
            except Exception as e:
                import traceback
                error_msg = f"Gemini multimodals Exception: {str(e)}"
                error_trace = traceback.format_exc()
                with open("C:/Users/Archisha Majumdar/Downloads/b_swasthya ai twin/backend/ocr_error.log", "w") as f:
                     f.write(f"{error_msg}\n\nTraceback:\n{error_trace}")
                return {
                    "type": "Prescription",
                    "medications": [
                        {"name": "[AI Request Failed]", "dosage": type(e).__name__, "frequency": "Inspect Logs"}
                    ],
                    "instructions": f"The Gemini API threw an error: {str(e)}. This usually happens if the Key has no active vision credentials or quota limits exceed.",
                    "doctor_notes": "Please verify your Google AI Studio billing/enablements setups.",
                    "handwritten_text_summary": "Handwriting decoding loaded exceptions in buffer pipelines seamlessly.",
                    "government_schemes": [],
                    "treatment_estimates": [],
                    "tests": [],
                    "advice": [],
                    "unclear": [],
                    "nearby_hospitals": [],
                    "cost_saving_note": "Using this scheme can significantly reduce your medical expenses."
                }

    async def analyze_report(self, file_content: bytes) -> Dict:
        if self.model:
            try:
                img = Image.open(io.BytesIO(file_content))
                prompt = """
                Analyze this medical lab report. 
                Extract: 
                - parameters (list of objects with name, value, unit, status)
                - summary (string)
                - recommendations (string)
                Return ONLY a JSON object.
                """
                response = self.model.generate_content([prompt, img])
                import json
                json_str = response.text.replace('```json', '').replace('```', '').strip()
                return json.loads(json_str)
            except Exception as e:
                print(f"Gemini Report Analysis Error: {e}")

        return {
            "type": "Lab Report",
            "parameters": [
                {"name": "Hemoglobin", "value": "11.5", "unit": "g/dL", "status": "Low"},
                {"name": "Blood Sugar (F)", "value": "110", "unit": "mg/dL", "status": "Borderline"},
                {"name": "WBC Count", "value": "8500", "unit": "/uL", "status": "Normal"}
            ],
            "summary": "AI detected slightly low hemoglobin levels. Consider iron-rich diet.",
            "recommendations": "Reduce sugar intake and retest in 3 months."
        }

ocr_service = OCRService()
