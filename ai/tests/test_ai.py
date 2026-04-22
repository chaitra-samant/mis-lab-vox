import pytest
from fastapi.testclient import TestClient
import os

# We set up mock environment variables before importing main to ensure it uses mock paths
os.environ["GROQ_API_KEY"] = "mock_key"
os.environ["VITE_SUPABASE_URL"] = "mock_url"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "mock_key"

from main import app
from batch import run_clustering, run_churn_analysis

client = TestClient(app)

def test_ai_01_semantic_routing():
    """
    AI-01: Semantic Routing
    Run known text samples against classification endpoint.
    """
    response = client.post("/analyze", json={
        "text": "I was overcharged on my last statement by $50.",
        "category": "Billing"
    })
    assert response.status_code == 200
    data = response.json()
    assert "category" in data
    assert "urgency" in data
    assert data["category"] == "Billing"

def test_ai_02_sentiment_edge_case():
    """
    AI-02: Sentiment Edge Case
    Feed explicitly sarcastic text.
    """
    response = client.post("/analyze", json={
        "text": "Great job, you guys just lost my money. Best bank ever."
    })
    assert response.status_code == 200
    data = response.json()
    assert data["sentiment"] == "Negative"
    assert data["sentiment_score"] < 0
    assert data["financial_loss_estimate"] == 100.0

def test_ai_03_token_limit_handler():
    """
    AI-03: Token Limit Handler
    Feed 10,000-word spam text. AI safely truncates/handles without HTTP 500.
    """
    spam_text = "spam " * 15000  # Roughly 75,000 chars
    response = client.post("/analyze", json={
        "text": spam_text
    })
    # Our API throws a 400 for anything over 50,000 chars, protecting the LLM
    assert response.status_code == 400
    assert "too long" in response.json()["detail"].lower()
    
    # If it's 20,000 chars, it should succeed but truncate internally to 10k tokens
    spam_text_2 = "spam " * 5000 # 25,000 chars
    response2 = client.post("/analyze", json={
        "text": spam_text_2
    })
    assert response2.status_code == 200

def test_ai_04_clustering_batch():
    """
    AI-04: Clustering Batch
    Execute DB embedding generation script.
    """
    res = run_clustering()
    assert "clusters_created" in res
    assert res["clusters_created"] >= 0

def test_ai_05_payload_format():
    """
    AI-05: AI Payload Format
    Verify API response shapes strictly match required JSON Schema.
    """
    response = client.post("/analyze", json={
        "text": "My card is blocked."
    })
    assert response.status_code == 200
    data = response.json()
    
    # Check all required keys exist and types are correct
    expected_keys = {"category", "urgency", "sentiment", "sentiment_score", "summary", "financial_loss_estimate"}
    assert set(data.keys()) == expected_keys
    assert isinstance(data["sentiment_score"], float)
    assert isinstance(data["summary"], str)

def test_churn_batch():
    """
    Test churn script execution
    """
    res = run_churn_analysis()
    assert "customers_updated" in res
    assert res["customers_updated"] >= 0
