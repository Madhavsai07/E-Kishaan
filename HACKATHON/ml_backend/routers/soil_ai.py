"""
AgriSmart ML Backend — Soil Health AI & NPK Recommendation Engine
==================================================================
AI-powered Soil Health Scoring and Agronomic NPK & Crop Optimizer.
"""

from typing import Dict, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/soil", tags=["Soil Intelligence AI"])


class SoilAnalysisRequest(BaseModel):
    district: str
    ph: float
    organic_carbon: float
    nitrogen: float
    phosphorus: float
    potassium: float
    rainfall_mm: Optional[float] = 350.0
    target_crop: Optional[str] = "Wheat"


class FertilizerDosage(BaseModel):
    fertilizer_name: str
    dosage_kg_per_acre: float
    application_stage: str
    frequency: str


class SoilAnalysisResponse(BaseModel):
    district: str
    soil_health_score: int
    health_status: str
    recommended_crops: List[Dict[str, str]]
    fertilizers: List[FertilizerDosage]
    water_requirement_schedule: str
    ai_insights: List[str]


@router.post("/analyze", response_model=SoilAnalysisResponse)
async def analyze_soil_health(data: SoilAnalysisRequest):
    """
    Computes ICAR-weighted Soil Health Score (0-100) and calculates precise NPK fertilizer dosage.
    """
    score = 100
    insights = []

    # pH penalty & assessment
    if data.ph < 6.5:
        score -= 15
        insights.append(f"Soil is acidic (pH {data.ph}). Apply Agricultural Lime to raise pH to 6.8.")
    elif data.ph > 8.0:
        score -= 15
        insights.append(f"Soil is alkaline (pH {data.ph}). Apply Gypsum (50 kg/acre) to reduce alkalinity.")

    # Organic carbon penalty
    if data.organic_carbon < 0.5:
        score -= 18
        insights.append(f"Low Organic Carbon ({data.organic_carbon}%). Apply Farm Yard Manure (FYM) or Vermicompost (2 tons/acre).")
    elif data.organic_carbon < 0.75:
        score -= 8
        insights.append(f"Moderate Organic Carbon ({data.organic_carbon}%). Incorporate green manure crops like Dhaincha/Sunhemp.")

    # NPK penalties
    if data.nitrogen < 70:
        score -= 15
        insights.append(f"Nitrogen deficit ({data.nitrogen} kg/ha). Increase Urea split application at 21 and 42 days.")
    if data.phosphorus < 20:
        score -= 10
        insights.append(f"Phosphorus deficit ({data.phosphorus} kg/ha). Apply DAP as basal dose at sowing.")
    if data.potassium < 150:
        score -= 10
        insights.append(f"Potassium deficit ({data.potassium} kg/ha). Apply MOP to enhance disease resistance.")

    score = max(25, min(98, score))

    if score >= 85:
        status = "Excellent"
    elif score >= 70:
        status = "Good"
    elif score >= 55:
        status = "Moderate"
    elif score >= 40:
        status = "Poor"
    else:
        status = "Critical"

    # Calculate dynamic fertilizer dosage
    urea_kg = round(max(30.0, (120.0 - data.nitrogen * 0.75) * 1.15), 1)
    dap_kg = round(max(25.0, (55.0 - data.phosphorus * 1.1) * 1.4), 1)
    mop_kg = round(max(15.0, (40.0 - data.potassium * 0.12) * 1.1), 1)

    fertilizers = [
        FertilizerDosage(
            fertilizer_name="Urea",
            dosage_kg_per_acre=urea_kg,
            application_stage="Split dose: 50% Basal, 25% Crown Root, 25% Tillering",
            frequency="3 Splits",
        ),
        FertilizerDosage(
            fertilizer_name="DAP (Di-ammonium Phosphate)",
            dosage_kg_per_acre=dap_kg,
            application_stage="Full dose at Sowing / Land Preparation",
            frequency="Single Basal",
        ),
        FertilizerDosage(
            fertilizer_name="MOP (Muriate of Potash)",
            dosage_kg_per_acre=mop_kg,
            application_stage="Basal Dose at Sowing",
            frequency="Single Basal",
        ),
        FertilizerDosage(
            fertilizer_name="Organic Vermicompost",
            dosage_kg_per_acre=1500.0 if data.organic_carbon < 0.5 else 800.0,
            application_stage="15 Days Prior to Sowing",
            frequency="Annual",
        ),
    ]

    crops = [
        {"crop": "Wheat", "expected_yield": "24-28 quintal/acre", "suitability": "High", "water_req": "380 mm"},
        {"crop": "Basmati Rice", "expected_yield": "20-25 quintal/acre", "suitability": "Medium", "water_req": "450 mm"},
        {"crop": "Maize", "expected_yield": "22-26 quintal/acre", "suitability": "High", "water_req": "320 mm"},
    ]

    return SoilAnalysisResponse(
        district=data.district,
        soil_health_score=score,
        health_status=status,
        recommended_crops=crops,
        fertilizers=fertilizers,
        water_requirement_schedule="4-5 Irrigations at critical growth stages (CRI, Tillering, Flowering, Grain Filling)",
        ai_insights=insights,
    )
