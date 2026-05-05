from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import ChatRequest, ChatResponse
from workflow import run_workflow


app = FastAPI(title="AZD Support Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        conversation_id, response = run_workflow(request.message)
        return ChatResponse(conversation_id=conversation_id, response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
