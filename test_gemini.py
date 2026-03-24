import os
import google.generativeai as genai

KEY = "AIzaSyC4_TivSB5rCOhc-dUCsP4fC74kzUtwnRs"
print(f"Testing Gemini configuration using key length: {len(KEY)}")

try:
    genai.configure(api_key=KEY)
    print("Listing available models to file...")
    with open("C:/Users/Archisha Majumdar/Downloads/b_swasthya ai twin/models_output.txt", "w") as f:
        f.write("Available Models for this Key:\n")
        for m in genai.list_models():
            f.write(f"- {m.name} ({', '.join(m.supported_generation_methods)})\n")
    print("SUCCESS: written to file")
except Exception as e:
    print(f"ERROR: {e}")
