import asyncio
from app.services.ocr_service import OCRService

async def run():
    print("Initializing OCRService...")
    ocr = OCRService()
    print(f"OCR SERVICE MODEL IS: {ocr.model}")

asyncio.run(run())
