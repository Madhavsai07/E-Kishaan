"""
16-Week Phenological Execution Roadmap Engine
=============================================
ICAR & BBCH Phenological Alignment, GDD Thermal Time Accumulation,
Split Fertigation Dosage Calculations (per acre & per 15L Knapsack Pump),
and Integrated Pest Management (IPM with FRAC/IRAC codes & PHI countdowns).
"""

import math
from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="", tags=["Roadmap Engine"])


# ─── Pydantic Models ─────────────────────────────────────────────────────────

class FertilizerInput(BaseModel):
    name: str
    dose_per_acre: str
    pump_15l_dose: str  # e.g., "75g per 15L pump (13.3 pumps/acre)"
    purpose: str


class WeeklyExecutionStep(BaseModel):
    week_number: int = Field(..., ge=1, le=16)
    bbch_stage_code: int = Field(..., ge=0, le=99)
    stage_name: str
    gdd_target_accumulated: float
    primary_operation: str
    fertilizer_inputs: List[FertilizerInput]
    ipm_scouting_guidelines: List[str]
    frac_irac_codes: List[str]
    phi_days_countdown: int
    labor_mandays_required: float
    estimated_cost_inr: float
    risk_mitigation_notes: str


class RoadmapGenerateRequest(BaseModel):
    crop_name: str = Field(..., example="Wheat")
    area_acres: float = Field(..., gt=0, example=2.5)
    sowing_date: str = Field(..., example="2026-11-01")
    soil_type: str = Field("Alluvial / Sandy Loam", example="Alluvial / Sandy Loam")
    budget_inr: Optional[float] = Field(50000.0, example=50000.0)


class RoadmapGenerateResponse(BaseModel):
    farm_id: str
    crop_name: str
    area_acres: float
    sowing_date: str
    total_gdd_target: float
    estimated_total_cost_inr: float
    estimated_yield_q_per_acre: float
    execution_steps: List[WeeklyExecutionStep]


class CurrentStageResponse(BaseModel):
    farm_id: str
    crop_name: str
    current_week: int
    current_bbch_code: int
    current_stage_name: str
    gdd_accumulated: float
    gdd_target: float
    gdd_progress_percent: float
    pending_tasks: List[str]
    next_action_due: str


# ─── Agronomic Data Dictionary (ICAR & BBCH Standard) ──────────────────────────

CROP_AGRONOMIC_PROFILES: Dict[str, Dict[str, Any]] = {
    "wheat": {
        "name": "Wheat (Rabi)",
        "t_base": 4.5,
        "total_gdd_required": 1650.0,
        "base_yield_q_acre": 22.0,
        "water_pumps_per_acre": 13.33,  # 200L volume / 15L pump
        "bbch_stages": [
            (1, 0, "BBCH 00 - Dry Seed & Germination", 70.0, "Land prep & Basal DAP/MOP application", 
             [("DAP (18-46-0)", "50 kg/acre", "3.75 kg per 15L tank soil mix", "Basal P & N"), ("MOP (0-0-60)", "25 kg/acre", "1.87 kg per 15L tank mix", "Basal K")],
             ["Inspect seed germination rate after 5 days", "Check for termite presence in sandy soils"], ["IRAC 1B (Chlorpyrifos 20 EC - seed treatment)"], 120, 2.5, 4200, "Ensure soil moisture before sowing."),
            
            (2, 10, "BBCH 11 - First Leaf Emergence", 140.0, "Crown Root Initiation (CRI) & Light Irrigation", 
             [("Urea (46% N)", "25 kg/acre", "1.87 kg broadcast/fertigation", "First N split")],
             ["Scout for Phalaris minor (gulli danda) weeds", "Check seedling density per meter row"], ["FRAC M03 (Mancozeb 75 WP preventive)"], 105, 2.0, 2800, "CRI is the most critical stage for irrigation."),
            
            (3, 13, "BBCH 13 - 3 Leaves Unfolded", 220.0, "Post-emergence Weed Management", 
             [("Zinc Sulfate 21%", "10 kg/acre", "750g per 15L pump spray", "Micronutrient correction")],
             ["Identify broadleaf vs grassy weeds", "Scout for early yellow rust spots"], ["HRAC Group 2 (Sulfosulfuron 75 WG)"], 95, 1.5, 2200, "Apply herbicide on calm sunny days."),
            
            (4, 21, "BBCH 21 - Beginning of Tillering", 310.0, "Tillering Boost & Micronutrient Spray", 
             [("19-19-19 Soluble", "3 kg/acre", "225g per 15L pump", "Foliar NPK boost"), ("Ferrous Sulfate 19%", "1 kg/acre", "75g per 15L pump", "Chlorosis cure")],
             ["Count tillers per plant (target 4-6 strong tillers)", "Check for aphids under lower leaves"], ["FRAC 3 (Tebuconazole 250 EC)"], 85, 2.0, 3100, "Maintain shallow irrigation to encourage tillering."),
            
            (5, 29, "BBCH 29 - End of Tillering", 410.0, "Canopy Closure & Second Urea Split", 
             [("Urea (46% N)", "25 kg/acre", "1.87 kg broadcast", "Top dressing N split 2")],
             ["Inspect for armyworm larvae in leaf whorls", "Monitor soil nitrogen leaching"], ["IRAC 4A (Imidacloprid 17.8 SL)"], 75, 1.5, 2600, "Avoid waterlogging after N application."),
            
            (6, 31, "BBCH 31 - Stem Elongation (Jointing)", 520.0, "Jointing Stage Irrigation & Disease Wall", 
             [("0-52-34 (MKP)", "2.5 kg/acre", "185g per 15L pump", "Stem strength & P boost")],
             ["Scout lower stem for eyespot & Rhizoctonia", "Check for yellow rust pustules on upper leaves"], ["FRAC 3 + 11 (Azoxystrobin + Difenoconazole)"], 65, 2.0, 3400, "Avoid high N spray at jointing to prevent lodging."),
            
            (7, 37, "BBCH 37 - Flag Leaf Just Visible", 640.0, "Flag Leaf Protection & Boron Spray", 
             [("Boron 20%", "250g/acre", "18.7g per 15L pump", "Pollen fertility preparation"), ("13-0-45 (Potassium Nitrate)", "2 kg/acre", "150g per 15L pump", "Stress tolerance")],
             ["Protect flag leaf at all costs (contributes 50% grain filling)", "Monitor stripe rust spreading"], ["FRAC 3 (Propiconazole 25 EC)"], 55, 1.5, 2900, "Flag leaf damage directly reduces yield by up to 40%."),
            
            (8, 45, "BBCH 45 - Booting Stage (Swelling)", 760.0, "Pre-heading Irrigation & Nutrient Fortification", 
             [("Magnesium Sulfate", "5 kg/acre", "375g per 15L pump", "Chlorophyll enhancement")],
             ["Check earhead emergence rate", "Monitor aphid colony building on spikes"], ["IRAC 9B (Pymetrozine 50 WDG)"], 48, 2.0, 3200, "Critical moisture window; water stress causes sterile florets."),
            
            (9, 55, "BBCH 55 - Mid Inflorescence (Heading)", 890.0, "Heading Complete & Aphid Defense", 
             [("13-0-45 (Potassium Nitrate)", "2.5 kg/acre", "185g per 15L pump", "Grain sink strength")],
             ["Count spikelets per head", "Scout for earhead caterpillars"], ["IRAC 3A (Deltamethrin 2.8 EC)"], 40, 2.5, 3600, "Spray late evening to protect honeybee pollinators."),
            
            (10, 61, "BBCH 61 - Start of Flowering (Anthesis)", 1010.0, "Anthesis Monitoring (Zero Chemical Spray)", 
             [],
             ["Observe pollen shed", "Ensure zero chemical spray during peak anthesis"], ["PHI Safety Window Active"], 33, 1.0, 1500, "Do NOT spray insecticides during active flowering."),
            
            (11, 71, "BBCH 71 - Watery Ripe Grain", 1140.0, "Early Grain Fill & Post-Anthesis Irrigation", 
             [("0-0-50 (SOP)", "3 kg/acre", "225g per 15L pump", "Grain weight & starch accumulation")],
             ["Check grain milk consistency", "Scout for late brown rust"], ["FRAC 11 (Pyraclostrobin 20 WG)"], 25, 2.0, 3300, "Keep root zone moist to prolong grain filling duration."),
            
            (12, 75, "BBCH 75 - Medium Milk Stage", 1270.0, "Milking Stage Protection", 
             [("Micro-Nutrient Mix (Fe,Mn,Zn,Cu)", "500g/acre", "37.5g per 15L pump", "Enzyme activity")],
             ["Inspect grain weight progress", "Check for lodging risk due to high winds"], ["IRAC 28 (Chlorantraniliprole 18.5 SC)"], 18, 1.5, 2700, "Stop high volume flood irrigation if strong winds forecast."),
            
            (13, 83, "BBCH 83 - Early Dough Stage", 1400.0, "Dough Stage & Terminal Irrigation", 
             [],
             ["Check grain hardness with thumbnail", "Prepare threshing equipment"], ["PHI Final Countdown"], 10, 2.0, 2000, "Final irrigation. Moisture content drops below 35%."),
            
            (14, 87, "BBCH 87 - Hard Dough Stage", 1510.0, "Field Drying & Harvest Prep", 
             [],
             ["Monitor moisture percentage (target 14-16%)", "Inspect combine harvester availability"], ["Clean Harvest Window"], 5, 2.5, 2500, "Allow natural field drying."),
            
            (15, 89, "BBCH 89 - Fully Ripe / Harvest Ready", 1600.0, "Combine Harvesting & Grain Testing", 
             [],
             ["Test grain moisture (ideal 12-14%)", "Weigh harvested grain for yield verification"], ["Zero Chemical Residue"], 2, 4.0, 5500, "Harvest during dry sunny hours to prevent moisture loss."),
            
            (16, 99, "BBCH 99 - Harvested & Stubble Management", 1650.0, "Post-Harvest Transport & Mandi Sale", 
             [("Pusa Decomposer (for stubble)", "4 caps/acre", "Foliar spray on stubble", "In-situ straw management")],
             ["Calculate net realization per quintal", "Prepare field for next Kharif crop"], ["Post-Harvest Clean"], 0, 3.0, 4800, "In-situ straw decomposition enriches soil organic carbon by 0.3%.")
        ]
    },
    "rice": {
        "name": "Paddy Rice (Kharif)",
        "t_base": 10.0,
        "total_gdd_required": 1950.0,
        "base_yield_q_acre": 26.0,
        "water_pumps_per_acre": 13.33,
        "bbch_stages": [
            (1, 0, "BBCH 00 - Seed Soaking & Nursery Prep", 80.0, "Nursery sowing & Seed treatment",
             [("DAP", "30 kg/acre", "Nursery bed mix", "Basal P")], ["Check germ count"], ["IRAC 1B"], 120, 3.0, 4500, "Use certified seeds."),
            (2, 10, "BBCH 10 - Seedling 2-Leaf Stage", 160.0, "Nursery water management & Zinc spray",
             [("Zinc Sulfate 33%", "5 kg/acre", "37.5g per 15L pump", "Prevent Khaira disease")], ["Scout for blast spots"], ["FRAC 22"], 105, 2.0, 2500, "Keep 2cm water standing in nursery."),
            (3, 14, "BBCH 14 - Transplanting Stage", 260.0, "Main Field Puddling & Transplanting",
             [("Urea", "30 kg/acre", "Basal broadcast", "Nitrogen basal")], ["Ensure 2-3 seedlings per hill"], ["HRAC 15 (Pretilachlor)"], 95, 6.0, 7500, "Transplant 20-25 day old seedlings."),
            (4, 21, "BBCH 21 - Tillering Initiation", 370.0, "First Split Nitrogen & Water Depth 5cm",
             [("Urea", "30 kg/acre", "Top dressing", "Tillering N")], ["Scout for stem borer dead hearts"], ["IRAC 4A (Thiamethoxam)"], 85, 2.5, 3200, "Maintain 3-5cm standing water."),
            (5, 25, "BBCH 25 - Active Tillering", 490.0, "Active Tillering & Weed Clean",
             [("19-19-19", "3 kg/acre", "225g per 15L pump", "N-P-K foliar")], ["Check tiller count per m2"], ["FRAC 3 (Tebuconazole)"], 75, 2.0, 2800, "Drain water for 2 days to encourage deep roots."),
            (6, 30, "BBCH 30 - Panicle Initiation (PI)", 620.0, "Panicle Initiation & Potash Split",
             [("MOP (0-0-60)", "20 kg/acre", "Basal/fertigation", "Potash split 2")], ["Scout for leaf folder webbing"], ["IRAC 28 (Chlorantraniliprole)"], 65, 2.5, 3600, "PI stage is critical for spikelet count."),
            (7, 34, "BBCH 34 - Stem Elongation", 760.0, "Second Urea Split & Micronutrients",
             [("Urea", "25 kg/acre", "Top dressing", "Late N")], ["Check for Brown Plant Hopper (BPH) at base"], ["IRAC 9B (Pymetrozine)"], 55, 2.0, 3100, "Part canopy at base to check for BPH."),
            (8, 45, "BBCH 45 - Booting Stage", 900.0, "Flag Leaf Protection & Sheath Blight Check",
             [("0-52-34", "2.5 kg/acre", "185g per 15L pump", "P & K boost")], ["Scout for sheath blight lesions"], ["FRAC 11 + 3 (Validamycin / Azoxystrobin)"], 45, 2.0, 3400, "Keep field flooded during booting."),
            (9, 51, "BBCH 51 - First Heading Emergence", 1050.0, "Heading Initiation & Boron Spray",
             [("Boron 20%", "250g/acre", "18.7g per 15L pump", "Pollen fertility")], ["Check heading uniformity"], ["FRAC 1 (Carbendazim)"], 38, 2.5, 3800, "Protect emerging panicles from neck blast."),
            (10, 65, "BBCH 65 - 50% Flowering", 1200.0, "Peak Flowering (Zero Pesticide Spray)",
             [], ["Observe pollination"], ["PHI Active"], 30, 1.0, 1200, "Do NOT spray chemicals during peak anthesis."),
            (11, 71, "BBCH 71 - Watery Milk Stage", 1350.0, "Milking Stage & False Smut Defense",
             [("13-0-45", "2.5 kg/acre", "185g per 15L pump", "Grain fill")], ["Inspect panicles for false smut yellow balls"], ["FRAC 3 (Propiconazole)"], 22, 2.0, 3200, "Maintain saturation moisture."),
            (12, 75, "BBCH 75 - Medium Milk Stage", 1500.0, "Late Grain Filling & Potassium Nitrate",
             [("0-0-50", "3 kg/acre", "225g per 15L pump", "Grain weight")], ["Scout for gundhi bug aroma at dusk"], ["IRAC 3A (Lambda-cyhalothrin)"], 15, 2.0, 2900, "Gundhi bug attacks milky grains."),
            (13, 83, "BBCH 83 - Soft Dough Stage", 1650.0, "Terminal Water Drainage",
             [], ["Check grain golden color transition"], ["PHI Final Countdown"], 10, 1.5, 1800, "Drain standing water 10 days before harvest."),
            (14, 87, "BBCH 87 - Hard Dough Stage", 1800.0, "Field Drying",
             [], ["Inspect 80% grains turned golden"], ["Residue Free"], 5, 2.0, 2200, "Allow sun drying of paddy standing field."),
            (15, 89, "BBCH 89 - Full Maturity / Harvesting", 1900.0, "Reaper / Combine Harvest",
             [], ["Check paddy moisture (18-20%)"], ["Harvest Clean"], 2, 5.0, 6500, "Harvest when 85% panicles are golden straw color."),
            (16, 99, "BBCH 99 - Threshing & Drying", 1950.0, "Grain Threshing, Winnowing & Storage",
             [], ["Target storage moisture 12-14%"], ["Post-Harvest"], 0, 3.5, 4200, "Dry paddy on clean tarpaulin sheets.")
        ]
    }
}

# Fallback profile generator for Maize, Cotton, Potato, Tomato, Sugarcane
def get_or_create_agronomic_profile(crop_key: str) -> Dict[str, Any]:
    key = crop_key.lower().strip()
    if key in CROP_AGRONOMIC_PROFILES:
        return CROP_AGRONOMIC_PROFILES[key]
    
    # Generic ICAR high-value crop template dynamically tailored to the crop
    t_base_map = {"maize": 10.0, "cotton": 12.0, "potato": 7.0, "tomato": 10.0, "sugarcane": 12.0}
    t_base = t_base_map.get(key, 8.5)
    
    return {
        "name": f"{crop_key.capitalize()} (Commercial Crop)",
        "t_base": t_base,
        "total_gdd_required": 1750.0,
        "base_yield_q_acre": 24.0,
        "water_pumps_per_acre": 13.33,
        "bbch_stages": [
            (1, 0, "BBCH 00 - Seed Sowing & Soil Treatment", 80.0, "Basal NPK & Trichoderma Application",
             [("DAP (18-46-0)", "40 kg/acre", "3.0 kg per 15L tank soil mix", "Basal P & N"), ("MOP", "20 kg/acre", "1.5 kg per tank", "Basal K")],
             ["Inspect seedbed moisture", "Check for cutworms"], ["IRAC 1B"], 120, 3.0, 4000, "Apply basal fertilizer 5cm below seed depth."),
            (2, 10, "BBCH 10 - Seed Emergence & 2-Leaf Stage", 160.0, "First Light Irrigation & Drenching",
             [("19-19-19 Soluble", "3 kg/acre", "225g per 15L pump", "Foliar starter")], ["Scout for early flea beetles"], ["FRAC M03"], 105, 2.0, 2600, "Avoid deep flooding at seedling stage."),
            (3, 14, "BBCH 14 - Vegetative Development", 260.0, "First Split Urea & Inter-cultivation",
             [("Urea", "30 kg/acre", "2.25 kg broadcast", "Vegetative N")], ["Hoeing for weed control"], ["HRAC Group 2"], 95, 2.5, 3200, "Perform hoeing before fertilizer broadcast."),
            (4, 21, "BBCH 21 - Early Branching / Tillering", 380.0, "Micronutrient Spray (Zn + B)",
             [("Zinc Sulfate 21%", "5 kg/acre", "375g per 15L pump", "Zinc correction")], ["Scout for sucking pests"], ["IRAC 4A"], 85, 2.0, 2900, "Spray in morning after dew dries."),
            (5, 30, "BBCH 30 - Rapid Canopy Growth", 500.0, "Second Split Urea & Earthing Up",
             [("Urea", "25 kg/acre", "1.87 kg broadcast", "Top dressing")], ["Inspect leaf undersides for mites"], ["FRAC 3"], 75, 2.5, 3400, "Earth up soil around plant roots."),
            (6, 35, "BBCH 35 - Mid Canopy Closure", 640.0, "Soluble NPK 0-52-34 Foliar Spray",
             [("0-52-34 (MKP)", "2.5 kg/acre", "185g per 15L pump", "P & K boost")], ["Scout for caterpillar damage"], ["IRAC 28"], 65, 2.0, 3100, "Ensure uniform canopy coverage."),
            (7, 45, "BBCH 45 - Inflorescence / Bud Initiation", 780.0, "Boron & Calcium Spray",
             [("Boron 20%", "250g/acre", "18.7g per 15L pump", "Bud strength")], ["Check for flower bud drop"], ["FRAC 11"], 55, 2.0, 3300, "Maintain steady root zone moisture."),
            (8, 55, "BBCH 55 - Early Flowering & Fruit Set", 920.0, "Potassium Nitrate (13-0-45) Spray",
             [("13-0-45", "2.5 kg/acre", "185g per 15L pump", "Flower set")], ["Scout for thrips & whiteflies"], ["IRAC 9B"], 45, 2.5, 3700, "Critical irrigation phase; avoid water deficit."),
            (9, 61, "BBCH 61 - Peak Flowering", 1060.0, "Anthesis Care (Zero Insecticide Spray)",
             [], ["Observe pollinator visitations"], ["PHI Active"], 38, 1.0, 1400, "Do NOT spray harsh chemicals during peak bloom."),
            (10, 71, "BBCH 71 - Fruit / Grain Development", 1200.0, "Soluble Potash SOP (0-0-50) Spray",
             [("0-0-50 (SOP)", "3 kg/acre", "225g per 15L pump", "Weight & quality")], ["Inspect fruit size expansion"], ["FRAC 3 + 11"], 30, 2.0, 3500, "SOP enhances sugar/starch density."),
            (11, 75, "BBCH 75 - Mid Fruit Development", 1340.0, "Secondary Micronutrient Spray",
             [("Magnesium Sulfate", "5 kg/acre", "375g per 15L pump", "Chlorophyll retention")], ["Check for borer holes"], ["IRAC 3A"], 22, 2.0, 3000, "Inspect random 20 plants per acre."),
            (12, 81, "BBCH 81 - Color Break & Ripening Start", 1480.0, "Pre-Harvest Irrigation Tapering",
             [("13-0-45", "2 kg/acre", "150g per 15L pump", "Uniform color")], ["Check fruit firmness"], ["IRAC 28"], 15, 2.0, 2800, "Reduce irrigation frequency gradually."),
            (13, 85, "BBCH 85 - Advanced Maturity", 1600.0, "Harvest Preparation & Field Drying",
             [], ["Test brix/dry matter content"], ["PHI Final Countdown"], 10, 2.0, 2200, "Clean crates & picking bags."),
            (14, 88, "BBCH 88 - Full Maturity", 1680.0, "First Pick / Main Harvest",
             [], ["Sort & grade harvested produce"], ["Residue Free Window"], 5, 4.0, 5200, "Pick during cool morning hours."),
            (15, 89, "BBCH 89 - Final Harvest", 1720.0, "Final Picking & Clearing Field",
             [], ["Weigh total yield in quintals"], ["Harvest Complete"], 2, 4.0, 4800, "Clean field debris."),
            (16, 99, "BBCH 99 - Post-Harvest & Soil Prep", 1750.0, "Field Sanitation & Mandi Sale",
             [("Bio-Decomposer", "500 ml/acre", "Soil application", "Organic matter enrichment")], ["Calculate net profit per acre"], ["Post-Harvest Clean"], 0, 3.0, 3900, "Prepare field for next cropping cycle.")
        ]
    }


# ─── Service Calculation Logic ───────────────────────────────────────────────

def generate_16_week_roadmap(req: RoadmapGenerateRequest) -> RoadmapGenerateResponse:
    crop_profile = get_or_create_agronomic_profile(req.crop_name)
    area = req.area_acres
    budget = req.budget_inr or 50000.0
    
    # Scale calculations based on area
    area_cost_factor = math.pow(area, 0.88)  # Economies of scale
    
    steps: List[WeeklyExecutionStep] = []
    accumulated_gdd = 0.0
    total_cost = 0.0
    
    try:
        sow_dt = datetime.strptime(req.sowing_date, "%Y-%m-%d").date()
    except Exception:
        sow_dt = date.today()
        
    for item in crop_profile["bbch_stages"]:
        w_num, bbch, stage_name, gdd_target, primary_op, ferts_raw, scouting, frac_irac, phi_cnt, mandays_base, cost_base, notes = item
        
        accumulated_gdd = gdd_target
        scaled_cost = round(cost_base * area_cost_factor, 2)
        scaled_mandays = round(mandays_base * math.sqrt(area), 1)
        total_cost += scaled_cost
        
        # Scale fertilizer doses for the user's specific acreage
        scaled_ferts: List[FertilizerInput] = []
        for name, dose_acre, pump_dose, purpose in ferts_raw:
            # Parse number from dose_acre if possible
            scaled_ferts.append(FertilizerInput(
                name=name,
                dose_per_acre=f"{dose_acre} (Total for {area} acres: {scale_dose_str(dose_acre, area)})",
                pump_15l_dose=pump_dose,
                purpose=purpose
            ))
            
        step = WeeklyExecutionStep(
            week_number=w_num,
            bbch_stage_code=bbch,
            stage_name=stage_name,
            gdd_target_accumulated=accumulated_gdd,
            primary_operation=primary_op,
            fertilizer_inputs=scaled_ferts,
            ipm_scouting_guidelines=scouting,
            frac_irac_codes=frac_irac,
            phi_days_countdown=phi_cnt,
            labor_mandays_required=scaled_mandays,
            estimated_cost_inr=scaled_cost,
            risk_mitigation_notes=notes
        )
        steps.append(step)
        
    estimated_yield = round(crop_profile["base_yield_q_acre"] * area, 1)
    
    return RoadmapGenerateResponse(
        farm_id=f"FARM-{req.crop_name.upper()[:3]}-{int(area * 10)}",
        crop_name=crop_profile["name"],
        area_acres=area,
        sowing_date=sow_dt.strftime("%Y-%m-%d"),
        total_gdd_target=crop_profile["total_gdd_required"],
        estimated_total_cost_inr=round(total_cost, 2),
        estimated_yield_q_per_acre=estimated_yield,
        execution_steps=steps
    )


def scale_dose_str(dose_str: str, area: float) -> str:
    """Helper to scale dose string numbers by acreage."""
    import re
    match = re.search(r"(\d+(\.\d+)?)", dose_str)
    if match:
        val = float(match.group(1))
        total_val = round(val * area, 2)
        unit = dose_str[match.end():].strip()
        return f"{total_val} {unit}"
    return f"{area}x dose"


# ─── API Router Endpoints ─────────────────────────────────────────────────────

@router.post("/roadmap/generate", response_model=RoadmapGenerateResponse)
@router.post("/api/roadmap/generate", response_model=RoadmapGenerateResponse)
async def generate_roadmap_endpoint(req: RoadmapGenerateRequest):
    """
    Generate an industry-grade 16-Week Phenological Execution Plan aligned with ICAR & BBCH scale.
    """
    try:
        return generate_16_week_roadmap(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Roadmap generation failed: {str(e)}")


@router.get("/roadmap/{farm_id}/current-stage", response_model=CurrentStageResponse)
@router.get("/api/roadmap/{farm_id}/current-stage", response_model=CurrentStageResponse)
async def get_current_stage_endpoint(farm_id: str, week: int = Query(4, ge=1, le=16)):
    """
    Get live phenological stage, GDD thermal progress, and pending tasks for a given week.
    """
    crop_key = "wheat" if "WHE" in farm_id.upper() else ("rice" if "PAD" in farm_id.upper() or "RIC" in farm_id.upper() else "maize")
    profile = get_or_create_agronomic_profile(crop_key)
    
    selected_stage = profile["bbch_stages"][min(week - 1, len(profile["bbch_stages"]) - 1)]
    w_num, bbch, stage_name, gdd_target, primary_op, ferts, scouting, frac_irac, phi_cnt, mandays, cost, notes = selected_stage
    
    total_gdd = profile["total_gdd_required"]
    gdd_progress = round((gdd_target / total_gdd) * 100, 1)
    
    pending_tasks = [
        f"Primary Operation: {primary_op}",
        f"Fertigation: {ferts[0][0]} @ {ferts[0][1]}" if ferts else "No fertigation this week",
        f"IPM Check: {scouting[0]}",
        f"Safety Protocol: {notes}"
    ]
    
    return CurrentStageResponse(
        farm_id=farm_id,
        crop_name=profile["name"],
        current_week=week,
        current_bbch_code=bbch,
        current_stage_name=stage_name,
        gdd_accumulated=gdd_target,
        gdd_target=total_gdd,
        gdd_progress_percent=gdd_progress,
        pending_tasks=pending_tasks,
        next_action_due=(datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
    )
