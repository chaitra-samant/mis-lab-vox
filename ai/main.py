from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from services import analyze_complaint_pipeline

app = FastAPI(title="AuraBank AI Microservice")

class ComplaintInput(BaseModel):
    text: str
    category: Optional[str] = None

class ComplaintAnalysis(BaseModel):
    category: str
    urgency: str
    sentiment: str
    sentiment_score: float
    summary: str
    financial_loss_estimate: Optional[float] = None

@app.post("/analyze", response_model=ComplaintAnalysis)
async def analyze_complaint(complaint: ComplaintInput):
    if len(complaint.text) > 50000:
        raise HTTPException(status_code=400, detail="Text too long")
        
    try:
        # Pass to the LangChain pipeline
        result = analyze_complaint_pipeline(complaint.text, complaint.category)
        return result
    except Exception as e:
        # Log the error, maybe truncate if it's token limit, but the pipeline should handle it
        raise HTTPException(status_code=500, detail=str(e))
