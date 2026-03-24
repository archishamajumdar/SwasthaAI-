import os
import random
import json
import re
from typing import List, Dict, Optional
import google.generativeai as genai
from openai import OpenAI
from app.config import settings

class SymptomAnalyzer:
    def __init__(self):
        # Advanced symptom-disease mapping for fallback and background scoring
        self.knowledge_base = {
            "respiratory": {
                "symptoms": ["fever", "cough", "sore throat", "shortness of breath", "loss of taste", "loss of smell", "sneezing", "runny nose", "wheezing", "chest tightness", "phlegm", "blood in sputum"],
                "conditions": [
                    {"name": "Allergies", "prob": "possible", "triggers": ["sneezing", "itchy eyes"]},
                    {"name": "COVID-19", "prob": "less likely", "triggers": ["loss of taste", "loss of smell", "high fever"]},
                    {"name": "Influenza (Flu)", "prob": "likely", "triggers": ["body ache", "high fever"]},
                    {"name": "Asthma", "prob": "possible", "triggers": ["wheezing", "chest tightness", "shortness of breath"]},
                    {"name": "Pneumonia", "prob": "less likely", "triggers": ["high fever", "productive cough", "shortness of breath"]},
                    {"name": "Tuberculosis", "prob": "less likely", "triggers": ["blood in sputum", "weight loss", "night sweats"]}
                ]
            },
            "cardiovascular": {
                "symptoms": ["chest pain", "chest pressure", "shortness of breath", "palpitations", "dizziness", "fainting", "swollen legs"],
                "conditions": [
                    {"name": "Heart Attack", "prob": "high risk", "triggers": ["chest pressure", "radiating pain", "sweating"]},
                    {"name": "Arrhythmia", "prob": "less likely", "triggers": ["palpitations", "dizziness"]},
                    {"name": "Heart Failure", "prob": "possible", "triggers": ["swollen legs", "shortness of breath lying down"]}
                ]
            },
            "gastrointestinal": {
                "symptoms": ["stomach ache", "nausea", "vomiting", "diarrhea", "constipation", "bloating", "heartburn", "loss of appetite"],
                "conditions": [
                    {"name": "Food Poisoning", "prob": "likely", "triggers": ["vomiting", "diarrhea"]},
                    {"name": "Acid Reflux (GERD)", "prob": "likely", "triggers": ["heartburn", "acid taste"]},
                    {"name": "Gastroenteritis", "prob": "possible", "triggers": ["nausea", "stomach pain", "diarrhea"]},
                    {"name": "Appendicitis", "prob": "high risk", "triggers": ["sharp lower right pain", "fever", "nausea"]},
                    {"name": "Peptic Ulcer", "prob": "less likely", "triggers": ["burning stomach pain", "bloating"]}
                ]
            },
            "neurological": {
                "symptoms": ["headache", "dizziness", "numbness", "tingling", "confusion", "memory loss", "seizures", "blurred vision"],
                "conditions": [
                    {"name": "Migraine", "prob": "likely", "triggers": ["pulsing headache", "sensitivity to light"]},
                    {"name": "Tension Headache", "prob": "likely", "triggers": ["headache", "neck pain"]},
                    {"name": "Stroke", "prob": "high risk", "triggers": ["sudden numbness", "confusion", "trouble speaking"]},
                    {"name": "Epilepsy", "prob": "less likely", "triggers": ["seizures", "convulsions"]}
                ]
            },
            "musculoskeletal": {
                "symptoms": ["joint pain", "muscle pain", "back pain", "stiffness", "swelling", "limited mobility", "muscle weakness"],
                "conditions": [
                    {"name": "Arthritis", "prob": "likely", "triggers": ["joint pain", "stiffness", "swelling"]},
                    {"name": "Muscle Strain", "prob": "likely", "triggers": ["muscle pain", "recent injury"]},
                    {"name": "Sciatica", "prob": "possible", "triggers": ["back pain radiating to leg", "numbness", "tingling"]},
                    {"name": "Osteoporosis", "prob": "less likely", "triggers": ["bone fracture", "back pain"]}
                ]
            },
            "dermatological": {
                "symptoms": ["rash", "itching", "redness", "blisters", "dry skin", "hives"],
                "conditions": [
                    {"name": "Eczema", "prob": "likely", "triggers": ["dry skin", "itching", "redness"]},
                    {"name": "Contact Dermatitis", "prob": "possible", "triggers": ["rash", "blisters"]},
                    {"name": "Urticaria (Hives)", "prob": "less likely", "triggers": ["hives", "welts"]},
                    {"name": "Psoriasis", "prob": "less likely", "triggers": ["scaly patches", "redness"]}
                ]
            },
            "endocrine": {
                "symptoms": ["excessive thirst", "frequent urination", "weight gain", "weight loss", "fatigue", "hair loss"],
                "conditions": [
                    {"name": "Type 2 Diabetes", "prob": "likely", "triggers": ["excessive thirst", "frequent urination"]},
                    {"name": "Hypothyroidism", "prob": "less likely", "triggers": ["weight gain", "fatigue", "cold intolerance"]},
                    {"name": "Hyperthyroidism", "prob": "less likely", "triggers": ["weight loss", "rapid heartbeat"]}
                ]
            },
            "infectious": {
                "symptoms": ["fever", "chills", "sweats", "muscle ache", "fatigue", "swollen lymph nodes"],
                "conditions": [
                    {"name": "Viral Infection", "prob": "likely", "triggers": ["fever", "fatigue"]},
                    {"name": "Malaria", "prob": "less likely", "triggers": ["high fever", "chills", "sweats"]},
                    {"name": "Dengue", "prob": "less likely", "triggers": ["high fever", "severe joint pain", "rash"]},
                    {"name": "Typhoid", "prob": "less likely", "triggers": ["prolonged fever", "abdominal pain"]}
                ]
            }
        }
        
        # Initialize Gemini Model for AI Symptom Analysis
        self.gemini_model = None
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
            except Exception as e:
                print(f"Failed to initialize Gemini in SymptomAnalyzer: {e}")
                
    async def analyze(self, symptoms: str, age: int = 25, gender: str = "Not Specified") -> Dict:
        if hasattr(self, 'gemini_model') and self.gemini_model:
            try:
                prompt = f"""
                You are an expert medical AI specializing in Disease Prediction and Urgency assessments.
                Analyze the following symptoms for a {age} year old {gender} patient:
                Symptoms: {symptoms}
                
                Task:
                1. Predict up to 3 possible conditions with probability (e.g., "high risk", "likely", "possible", "less likely") and numeric score (0 to 1). DO NOT guess generic "Common Cold" unless fully compliant; provide clinical predictions accurately.
                2. Determine urgency level with a color tag: "🟢 Low", "🟡 Medium", "🟠 High", "🔴 Emergency".
                3. Suggest brief advice/Next steps based on urgency.
                4. Set `is_emergency` to true if symptoms are life-threatening (chest pain, breathing issues, severe bleeding, unconsciousness).
                
                Return ONLY a JSON object with this exact structure:
                {{
                  "predicted_diseases": [
                    {{"disease": "Name of Condition", "probability": 0.85, "prob_text": "likely"}}
                  ],
                  "urgency_level": "🟢 Low / 🟡 Medium / 🟠 High / 🔴 Emergency",
                  "advice": "Rest and hydrate. Consult a GP if persistent.",
                  "is_emergency": false
                }}
                """
                response = self.gemini_model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                import json
                parsed = json.loads(response.text)
                # Ensure urgency colors are properly mapped or available
                if parsed.get('urgency_level') and '🟢' not in parsed['urgency_level'] and '🟠' not in parsed['urgency_level'] and '🔴' not in parsed['urgency_level'] and '🟡' not in parsed['urgency_level']:
                    level = parsed['urgency_level'].lower()
                    if 'emer' in level: parsed['urgency_level'] = '🔴 Emergency'
                    elif 'high' in level: parsed['urgency_level'] = '🟠 High'
                    elif 'med' in level: parsed['urgency_level'] = '🟡 Medium'
                    else: parsed['urgency_level'] = '🟢 Low'
                return parsed
            except Exception as e:
                print(f"Gemini Analyzer Error, falling back: {e}")

        symptoms_lower = symptoms.lower().strip()
        
        # 1. Greeting Check
        greetings = ["hi", "hello", "hey", "how are you"]
        if symptoms_lower in greetings or len(symptoms_lower) < 3:
            return {
                "predicted_diseases": [],
                "urgency_level": "🟢 Low",
                "advice": "Please describe your symptoms briefly.",
                "is_emergency": False
            }

        matched_conditions = []
        is_emergency = any(t in symptoms_lower for t in ["chest pain", "difficulty breathing", "unconsciousness", "severe bleeding"])
        
        prob_map = {"high risk": 0.90, "more likely": 0.80, "likely": 0.70, "possible": 0.50, "less likely": 0.30}

        for cat, data in self.knowledge_base.items():
            matches = [s for s in data["symptoms"] if s in symptoms_lower]
            if matches:
                for cond in data["conditions"]:
                    score = len(matches)
                    primary_trigger = any(t in symptoms_lower for t in cond.get("triggers", []))
                    if primary_trigger: score += 5
                    if cond["prob"] in ["high risk", "less likely"] and not primary_trigger: score -= 2

                    if score > 0:
                        matched_conditions.append({
                            "name": cond["name"], 
                            "prob_text": cond["prob"],
                            "probability": prob_map.get(cond["prob"], 0.5),
                            "score": score
                        })

        matched_conditions = sorted(matched_conditions, key=lambda x: x["score"], reverse=True)[:3]
        
        if is_emergency: urgency, level = "🔴 Emergency", "Emergency"
        elif any(s in symptoms_lower for s in ["severe pain", "vision", "numbness"]): urgency, level = "🟠 High", "High"
        elif any(s in symptoms_lower for s in ["fever", "cough"]): urgency, level = "🟡 Medium", "Medium"
        else: urgency, level = "🟢 Low", "Low"

        action = "Next steps:\n"
        if level == "Emergency": action += "- Call 108/911 immediately."
        elif level == "High": action += "- Visit a doctor today."
        elif level == "Medium": action += "- Consult a GP if persistent."
        else: action += "- Rest and hydrate."

        return {
            "predicted_diseases": [{"disease": c["name"], "probability": c["probability"], "prob_text": c["prob_text"]} for c in matched_conditions],
            "urgency_level": urgency,
            "advice": action,
            "is_emergency": is_emergency
        }

class AIHealthAssistant:
    def __init__(self):
        self.analyzer = SymptomAnalyzer()
        self.client = None
        if settings.OPENAI_API_KEY:
            try:
                self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception as e:
                print(f"Failed to initialize OpenAI client: {e}")
        
        # Gemini Integration
        self.gemini_model = None
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")

        self.master_prompt = """
You are SwasthyaAI Twin+, an advanced AI-powered healthcare assistant and an expert in Indian healthcare schemes and policies.

Your role is to:
- Analyze user symptoms, medical history, and inputs
- Predict possible diseases (not give final diagnosis)
- Classify urgency: Low, Moderate, High, Emergency
- Suggest next steps (home care / doctor visit / hospital)
- Recommend nearby hospitals/doctors based on user location
- Explain reasoning in simple, clear language
- Suggest relevant Indian government healthcare schemes (Ayushman Bharat, CGHS, ESI, State-specific schemes)
- Explain eligibility criteria, benefits, and how to apply for the schemes
- Suggest nearest hospitals where the suggested schemes are accepted

Rules:
- Never give absolute diagnosis, only probability-based insights
- Always ask follow-up questions if data is insufficient
- Be medically cautious and safe
- If symptoms are severe (chest pain, breathing issues, unconsciousness), mark as EMERGENCY
- Always prioritize schemes based on: User eligibility, Medical urgency, Cost coverage
- If cost is high: Strongly recommend schemes that reduce financial burden. Highlight free treatment options.
- If cost is low: Suggest optional schemes but do not overemphasize.
- Always provide a `treatment_estimates` array estimating realistic costs for Required treatments/tests in India (Private maps vs Govt) with approximate savings % calculation.
- Always mention: "Using this scheme can significantly reduce your medical expenses."
- Provide structured output in JSON format.

You also have access to:
- User medical history, Age, Income group, Location, Gender
- Symptom database (Vector DB)
- ML prediction outputs
- Nearby hospital database

Act like a highly knowledgeable, calm, and precise doctor assistant. Keep response simple, structured, and helpful.

Output Format:
{
  "possible_conditions": [
    {"name": "...", "probability": "..."}
  ],
  "urgency_level": "...",
  "reasoning": "...",
  "recommended_action": "...",
  "doctor_type": "...",
  "confidence_score": "...",
  "treatment_estimates": [
    {
      "treatment": "...",
      "private_est": "...",
      "govt_est": "...",
      "savings": "..."
    }
  ],
  "government_schemes": [
    {
      "scheme_name": "...",
      "why_applicable": "...",
      "benefits": "...",
      "eligibility": "...",
      "how_to_apply": "..."
    }
  ],
  "nearby_hospitals": [
    {
      "name": "...",
      "accepts_schemes": true/false
    }
  ],
  "cost_saving_note": "Using this scheme can significantly reduce your medical expenses."
}
"""

    async def get_response(self, message: str, user_id: str = None, history: str = "") -> str:
        msg = message.lower().strip()
        
        # 1. Check for Blood Pressure recording
        bp_match = re.search(r'(\d{2,3})[/\s](\d{2,3})', msg)
        if bp_match:
            systolic = int(bp_match.group(1))
            diastolic = int(bp_match.group(2))
            from app.services.twin_service import twin_engine
            await twin_engine.record_vital("blood_pressure", f"{systolic}/{diastolic}")
            return f"I have recorded your Blood Pressure as {systolic}/{diastolic}. Your digital twin is being updated. How else can I help?"

        # 2. Use Gemini if available
        if self.gemini_model:
            try:
                full_prompt = f"{self.master_prompt}\n\nPatient Medical History: {history}\n\nUser Question/Symptoms: {message}"
                response = self.gemini_model.generate_content(
                    full_prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                return response.text
            except Exception as e:
                print(f"Gemini Error, falling back: {e}")

        # 3. Use OpenAI as secondary
        if self.client:
            try:
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": self.master_prompt},
                        {"role": "user", "content": message}
                    ],
                    temperature=0.5,
                    max_tokens=600,
                    response_format={"type": "json_object"}
                )
                return response.choices[0].message.content
            except Exception as e:
                print(f"OpenAI Error, falling back: {e}")

        # 4. Fallback to Local Smart Simulation (NOW CONCISE)
        analysis = await self.analyzer.analyze(message)
        
        if not analysis["predicted_diseases"] and any(greet in msg for greet in ["hi", "hello"]):
            return "Hello. How can I help with your health today?"

        diseases = ", ".join([d['disease'] for d in analysis['predicted_diseases']]) if analysis['predicted_diseases'] else "General discomfort"
        resp = f"ASSESSMENT: {diseases}.\n"
        resp += f"ADVICE:\n{analysis['advice'].replace('Next steps:', '').strip()}\n"
        resp += f"URGENCY: {analysis['urgency_level']}"
        return resp

symptom_analyzer = SymptomAnalyzer()
ai_assistant = AIHealthAssistant()
