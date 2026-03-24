from typing import List, Dict, Any
import google.generativeai as genai
from app.config import settings

class HealthcareService:
    def __init__(self):
        self.model = None
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
            except Exception as e:
                print(f"Failed to initialize Gemini in HealthcareService: {e}")

        self.specialists = {
            "Common Cold": "General Physician",
            "Influenza": "General Physician",
            "COVID-19": "Infectious Disease Specialist",
            "Heart Attack": "Cardiologist",
            "Angina": "Cardiologist",
            "Pulmonary Embolism": "Pulmonologist",
            "Gastritis": "Gastroenterologist",
            "Food Poisoning": "Gastroenterologist",
            "Appendicitis": "General Surgeon",
            "Migraine": "Neurologist",
            "Hypertension": "Cardiologist",
            "Stroke": "Neurologist"
        }
        
        # Regional Hospital Data
        self.regional_hospitals = {
            "Santoshpur": [
                {"name": "Peerless Hospital", "type": "Private", "distance": "1.2 km"},
                {"name": "AMRI Hospital Dhakuria", "type": "Private", "distance": "2.5 km"}
            ],
            "Ruby": [
                {"name": "Ruby General Hospital", "type": "Private", "distance": "0.5 km"},
                {"name": "Fortis Hospital Anandapur", "type": "Private", "distance": "1.5 km"},
                {"name": "Desun Hospital", "type": "Private", "distance": "1.2 km"}
            ],
            "Garia": [
                {"name": "Hindustan Health Care", "type": "Private", "distance": "1.0 km"},
                {"name": "Remedy Hospital", "type": "Private", "distance": "2.0 km"}
            ],
            "Beleghata": [
                {"name": "ID & BG Hospital", "type": "Public", "distance": "0.8 km"},
                {"name": "Apollo Multispecialty", "type": "Private", "distance": "2.2 km"}
            ],
            "Tollygunge": [
                {"name": "M.R. Bangur Hospital", "type": "Public", "distance": "1.0 km"},
                {"name": "RSV Hospital", "type": "Private", "distance": "1.5 km"}
            ]
        }
        
        # Comprehensive Specialist Database
        self.doctors_by_specialty = {
            "Cardiologist": [
                {"name": "Dr. Shuvanan Ray", "hospital": "Fortis Hospital", "exp": "30+ years", "rating": 5.0, "specialty": "Interventional Cardiology"},
                {"name": "Dr. Swapan Kumar De", "hospital": "Apollo Multispeciality Hospitals", "exp": "32+ years", "rating": 4.9, "specialty": "Cardiac Sciences"},
                {"name": "Dr. Aritra Konar", "hospital": "Apollo Hospitals", "exp": "15+ years", "rating": 4.8, "specialty": "Complex Coronary Interventions"},
                {"name": "Dr. Ashok Dhar", "hospital": "Fortis Healthcare", "exp": "50+ years", "rating": 4.7, "specialty": "Interventional Cardiology"},
                {"name": "Dr. Sushan Mukhopadhyay", "hospital": "Apollo Hospitals", "exp": "29+ years", "rating": 4.8, "specialty": "Cardiac Sciences"},
                {"name": "Dr. Bikash Majumder", "hospital": "Apollo Multispeciality Hospitals", "exp": "20+ years", "rating": 4.6, "specialty": "General Cardiology"},
                {"name": "Dr. Sumanto Mukhopadhyay", "hospital": "Apollo Hospitals", "exp": "15+ years", "rating": 4.5, "specialty": "Interventional Cardiology"}
            ],
            "Endocrinologist": [
                {"name": "Dr. Sujit Bhattacharya", "hospital": "Fortis Healthcare", "exp": "33+ years", "rating": 4.9, "specialty": "Thyroid & Diabetes"},
                {"name": "Dr. Ravi Kant Saraogi", "hospital": "Apollo Hospitals", "exp": "32+ years", "rating": 5.0, "specialty": "DM-Endocrinology"},
                {"name": "Dr. Rachna Mazumder", "hospital": "Fortis Anandapur", "exp": "33+ years", "rating": 4.7, "specialty": "Hormonal Disorders"},
                {"name": "Dr. Debmalya Sanyal", "hospital": "Manipal Hospitals", "exp": "20+ years", "rating": 4.8, "specialty": "Endocine Disorders"},
                {"name": "Dr. Binayak Sinha", "hospital": "Fortis Healthcare", "exp": "32+ years", "rating": 4.9, "specialty": "Hormonal Disorders"},
                {"name": "Dr. Sujoy Majumdar", "hospital": "Apollo Multispeciality Hospitals", "exp": "25+ years", "rating": 4.6, "specialty": "General Endocrinology"}
            ],
            "Neurologist": [
                {"name": "Dr. Jayanta Roy", "hospital": "AMRI Hospitals, Mukundapur", "exp": "35+ years", "rating": 5.0, "specialty": "Stroke Neurology"},
                {"name": "Dr. Sumitava Samanta", "hospital": "Apollo 24|7 & Fortis Anandapur", "exp": "20+ years", "rating": 4.8, "specialty": "General Neurology"},
                {"name": "Dr. Debabrata Chakraborty", "hospital": "Apollo Gleneagles Hospitals", "exp": "21+ years", "rating": 4.9, "specialty": "Stroke Neurology"},
                {"name": "Dr. Shankar Prasad Nandi", "hospital": "Baguihati Clinic", "exp": "29+ years", "rating": 4.7, "specialty": "General Neurology"},
                {"name": "Dr. Koushik Dutta", "hospital": "Manipal Hospitals (AMRI)", "exp": "26+ years", "rating": 4.8, "specialty": "Stroke & Epilepsy"},
                {"name": "Dr. Amitabha Ghosh", "hospital": "Apollo Hospitals", "exp": "25+ years", "rating": 4.6, "specialty": "General Neurology"},
                {"name": "Dr. R.P. Sengupta", "hospital": "Institute of Neurosciences Kolkata", "exp": "40+ years", "rating": 5.0, "specialty": "Neuro Surgery"}
            ],
            "Ophthalmologist": [
                {"name": "Dr. Asit Ranjan Banerjee", "hospital": "Fortis Hospital", "exp": "54+ years", "rating": 5.0, "specialty": "Cataract & Lasik"},
                {"name": "Dr. Somdutt Prasad", "hospital": "Pushpanjali Eye Care", "exp": "25+ years", "rating": 4.9, "specialty": "Retina Specialist"},
                {"name": "Dr. Rupak Roy", "hospital": "Spectra Eye Hospital", "exp": "20+ years", "rating": 4.8, "specialty": "Eye Surgery"},
                {"name": "Dr. Bishwanath Dutta Chowdhury", "hospital": "Pushpanjali Eye Care", "exp": "30+ years", "rating": 4.7, "specialty": "Retinal Surgeries"},
                {"name": "Dr. Anindya Kishore Majumder", "hospital": "Pushpanjali Eye Care", "exp": "20+ years", "rating": 4.8, "specialty": "Cornea & Refractive"},
                {"name": "Dr. Subrata Dutta", "hospital": "Apollo Clinic", "exp": "22+ years", "rating": 4.6, "specialty": "Comprehensive Eye Care"},
                {"name": "Dr. Sangeeta Roy", "hospital": "Pushpanjali Eye Care", "exp": "15+ years", "rating": 4.5, "specialty": "MD Ophthalmology"}
            ],
            "Dermatologist": [
                {"name": "Dr. Madhumita Bhattacharya", "hospital": "Fortis Anandapur", "exp": "37+ years", "rating": 4.9, "specialty": "Clinical Dermatology"},
                {"name": "Dr. Surajit Gorai", "hospital": "Cosmetology Specialist", "exp": "15+ years", "rating": 5.0, "specialty": "Cosmetology & Aesthetics"},
                {"name": "Dr. Khushbu Tantia", "hospital": "La Derma Skin Clinic", "exp": "12+ years", "rating": 4.8, "specialty": "Hair Loss & Anti-aging"},
                {"name": "Dr. Dinesh Hawelia", "hospital": "Chittaranjan Avenue", "exp": "24+ years", "rating": 4.7, "specialty": "Aesthetic Dermatology"},
                {"name": "Dr. Niraj Jain", "hospital": "Skin & Hair Care Clinic", "exp": "12+ years", "rating": 4.7, "specialty": "Skin & Nail Conditions"},
                {"name": "Dr. Soumya Kanti Dutta", "hospital": "Desun Hospital", "exp": "18+ years", "rating": 4.6, "specialty": "Cosmetic Dermatology"},
                {"name": "Dr. Pradip Laha", "hospital": "Fortis Anandapur", "exp": "40+ years", "rating": 4.5, "specialty": "Clinical Dermatology"}
            ]
        }

    async def get_doctor_recommendations(self, disease: str, location: str) -> Dict:
        specialist_type = self.specialists.get(disease, disease if disease != "All" else "General Physician")
        
        # Prioritize real specialist data
        real_doctors = self.doctors_by_specialty.get(specialist_type, [])
        if not real_doctors and "ologist" in disease: # Handle cases like 'Cardiology' vs 'Cardiologist'
            for key in self.doctors_by_specialty:
                if key.startswith(disease[:5]):
                    real_doctors = self.doctors_by_specialty[key]
                    specialist_type = key
                    break

        # Get nearby hospitals based on location
        hospitals = self.regional_hospitals.get(location, [])
        if not hospitals:
            hospitals = [
                {"name": f"City Health Center ({location})", "type": "Public", "distance": "2.0 km"},
                {"name": f"Apollo Hospital ({location})", "type": "Private", "distance": "3.5 km"},
                {"name": f"Max Healthcare ({location})", "type": "Private", "distance": "4.2 km"}
            ]
            
        # Merge real doctors into the response
        nearby_doctors: List[Dict[str, Any]] = []
        if real_doctors:
            for d in real_doctors:
                nearby_doctors.append({
                    "name": d.get("name", "Unknown Doctor"),
                    "hospital": d.get("hospital", "Private Clinic"),
                    "exp": d.get("exp", "15+ years"),
                    "rating": d.get("rating", 4.5),
                    "specialty": d.get("specialty", specialist_type),
                    "type": "Private"
                })
        else:
            # Fallback mock doctors
            nearby_doctors = [{"name": h["name"], "type": h["type"], "distance": h.get("distance", "2.0 km"), "specialty": specialist_type} for h in hospitals]

        return {
            "specialist_type": specialist_type,
            "nearby_hospitals": hospitals,
            "doctors": nearby_doctors,
            "note": f"Please visit a {specialist_type} for further diagnosis."
        }

    async def get_schemes(self) -> Dict:
        if self.model:
            try:
                # Generate real generic medicine comparisons
                prompt = """
                Return a JSON with matching generic medicines and popular health schemes in India.
                For the "Ayushman Bharat PM-JAY" scheme, you MUST set the "link" field to EXACTLY "https://beneficiary.nha.gov.in/".
                
                Format: 
                {
                  "schemes": [{"title": "...", "category": "...", "description": "...", "link": "..."}],
                  "generic_medicines": [{"brand_name": "...", "generic_name": "...", "savings_percent": 60}]
                }
                """
                resp = self.model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                import json
                json_str = resp.text.replace('```json', '').replace('```', '').strip()
                return json.loads(json_str)
            except Exception as e:
                print(f"HealthcareService Gemini Error: {e}")

        return {
            "schemes": [
                {
                    "title": "Ayushman Bharat PM-JAY",
                    "category": "Government Scheme",
                    "description": "Provides health cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization.",
                    "link": "https://beneficiary.nha.gov.in/"
                },
                {
                    "title": "PM Bhartiya Janaushadhi Pariyojana",
                    "category": "Medicine Support",
                    "description": "Provides quality generic medicines at affordable prices through Janaushadhi Kendras.",
                    "link": "http://janaushadhi.gov.in/"
                }
            ],
            "generic_medicines": [
                {"brand_name": "Dolo 650", "generic_name": "Paracetamol 650mg", "savings_percent": 60},
                {"brand_name": "Augmentin", "generic_name": "Amoxycillin + Clavulanic Acid", "savings_percent": 70}
            ]
        }

healthcare_service = HealthcareService()
