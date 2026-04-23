from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import os

# Load environment variables from the root .env.local
load_dotenv("../.env.local")

from services import analyze_complaint_pipeline
from typing import List, Dict, Any
from services import (
    generate_suggested_response, 
    calculate_churn_risk, 
    perform_semantic_search, 
    generate_ai_suggestions,
    generate_cluster_themes
)
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
    department: str
    financial_loss_estimate: Optional[float] = None
class SuggestionRequest(BaseModel):
    text: str

class SuggestionResponse(BaseModel):
    title: str
    description: str

class SemanticSearchRequest(BaseModel):
    query: str
    complaint_data: List[Dict[str, Any]]

class SemanticSearchResponse(BaseModel):
    summary: str
    relevant_complaint_ids: List[str]

class ChurnRiskRequest(BaseModel):
    customer_complaints: List[Dict[str, Any]]

class ClusterThemeRequest(BaseModel):
    complaint_groups: List[Dict[str, Any]]

@app.post("/suggestions", response_model=List[SuggestionResponse])
async def get_ai_suggestions(request: SuggestionRequest):
    """Generate AI-powered FAQ suggestions for customers."""
    try:
        suggestions = generate_ai_suggestions(request.text)
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/semantic-search", response_model=SemanticSearchResponse)
async def semantic_search(request: SemanticSearchRequest):
    """Perform semantic search on complaint data."""
    try:
        result = perform_semantic_search(request.query, request.complaint_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/churn-risk", response_model=dict)
async def calculate_churn(request: ChurnRiskRequest):
    """Calculate churn risk score for a customer."""
    try:
        score = calculate_churn_risk(request.customer_complaints)
        return {"churn_risk_score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cluster-themes", response_model=List[dict])
async def get_cluster_themes(request: ClusterThemeRequest):
    """Generate thematic names for complaint clusters."""
    try:
        themes = generate_cluster_themes(request.complaint_groups)
        return themes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/suggested-response", response_model=dict)
async def get_suggested_response(
    category: str, 
    sentiment: str, 
    urgency: str, 
    summary: str
):
    """Generate suggested response template for employees."""
    try:
        response = generate_suggested_response(category, sentiment, urgency, summary)
        return {"suggested_response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
