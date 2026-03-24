from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, medical, healthcare, reminders, goals
from app.database import connect_to_mongo, close_mongo_connection
from app.config import settings

app = FastAPI(
    title="SwasthyaAI Twin+ Backend",
    description="Scalable backend for AI Healthcare System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(medical.router)
app.include_router(healthcare.router)
app.include_router(reminders.router)
app.include_router(goals.router)

@app.get("/")
async def root():
    return {"message": "Welcome to SwasthyaAI Twin+ API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
