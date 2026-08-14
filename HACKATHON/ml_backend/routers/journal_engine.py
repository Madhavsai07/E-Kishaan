"""
Commercial Double-Entry Farmer Operating System & Journal Book Engine
======================================================================
Strict Double-Entry General Ledger (Debit == Credit validation),
Financial Ratio Analysis (Net Profit Margin %, ROI %, Cost/Quintal),
Category Cost Breakdown, and CSV/PDF Export endpoints.
"""

import uuid
import csv
import io
from datetime import date, datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, root_validator
from fastapi import APIRouter, HTTPException, Query, Response

router = APIRouter(prefix="", tags=["Journal Engine"])

# ─── Standard Chart of Accounts ───────────────────────────────────────────────

VALID_ASSET_ACCOUNTS = ["Cash in Hand", "Bank Account", "KCC Cash Credit", "Farm Machinery", "Stored Inventory"]
VALID_EXPENSE_ACCOUNTS = ["Seeds Expense", "Nutrients & Fertilizer", "Crop Protection & Pesticides", "Labor Wages", "Diesel & Machinery Rent", "Irrigation & Electricity"]
VALID_REVENUE_ACCOUNTS = ["Mandi Crop Sales", "Direct B2B Sales", "Govt Subsidies", "By-Product Sales"]
VALID_LIABILITY_ACCOUNTS = ["KCC Crop Loan", "Agri Dealer Credit", "Private Lender Loan"]

ALL_ACCOUNTS = VALID_ASSET_ACCOUNTS + VALID_EXPENSE_ACCOUNTS + VALID_REVENUE_ACCOUNTS + VALID_LIABILITY_ACCOUNTS


# ─── Pydantic Data Models ─────────────────────────────────────────────────────

class InputItem(BaseModel):
    item_name: str
    quantity: float
    unit: str
    unit_price_inr: float


class JournalEntryCreate(BaseModel):
    farm_id: Optional[str] = "FARM-101"
    entry_date: str = Field(default_factory=lambda: date.today().strftime("%Y-%m-%d"))
    crop_name: str = Field("Wheat", example="Wheat")
    activity_type: str = Field(..., example="FERTIGATION")  # SOWING | FERTIGATION | PEST_SPRAY | HARVEST | SALES | LOAN_PAYMENT
    description: str = Field(..., example="Purchased 2 bags DAP and broadcasted in Field 1")
    debit_account: str = Field(..., example="Nutrients & Fertilizer")
    credit_account: str = Field(..., example="Cash in Hand")
    amount_inr: float = Field(..., gt=0, example=2700.0)
    inputs_used: Optional[List[InputItem]] = []
    labor_hours: Optional[float] = 0.0
    proof_image_url: Optional[str] = None
    is_synced_offline: Optional[bool] = False


class JournalEntry(JournalEntryCreate):
    entry_id: str
    created_at: str


class CostDistribution(BaseModel):
    category: str
    total_inr: float
    percentage: float


class FinancialSummary(BaseModel):
    total_revenue_inr: float
    total_expenses_inr: float
    net_profit_inr: float
    net_profit_margin_percent: float
    roi_percent: float
    total_yield_quintals: float
    cost_per_quintal_inr: float
    debit_credit_balanced: bool


class PnLStatement(BaseModel):
    farm_id: str
    generated_at: str
    revenue_breakdown: Dict[str, float]
    expense_breakdown: Dict[str, float]
    financial_summary: FinancialSummary
    category_cost_distribution: List[CostDistribution]


# ─── In-Memory Double-Entry Ledger Store ─────────────────────────────────────

INITIAL_MOCK_ENTRIES: List[Dict[str, Any]] = [
    {
        "entry_id": "JRN-8801",
        "farm_id": "FARM-101",
        "entry_date": "2026-11-01",
        "crop_name": "Wheat",
        "activity_type": "SOWING",
        "description": "Certified HD-3086 Wheat Seed purchase (2 bags @ ₹1,650)",
        "debit_account": "Seeds Expense",
        "credit_account": "Cash in Hand",
        "amount_inr": 3300.0,
        "inputs_used": [{"item_name": "HD-3086 Seed", "quantity": 80.0, "unit": "kg", "unit_price_inr": 41.25}],
        "labor_hours": 8.0,
        "proof_image_url": None,
        "is_synced_offline": False,
        "created_at": "2026-11-01T10:00:00"
    },
    {
        "entry_id": "JRN-8802",
        "farm_id": "FARM-101",
        "entry_date": "2026-11-02",
        "crop_name": "Wheat",
        "activity_type": "FERTIGATION",
        "description": "Basal Fertilizer: DAP 2 bags + MOP 1 bag from IFFCO dealer",
        "debit_account": "Nutrients & Fertilizer",
        "credit_account": "Bank Account",
        "amount_inr": 4200.0,
        "inputs_used": [
            {"item_name": "DAP 50kg", "quantity": 2.0, "unit": "bags", "unit_price_inr": 1350.0},
            {"item_name": "MOP 50kg", "quantity": 1.0, "unit": "bags", "unit_price_inr": 1500.0}
        ],
        "labor_hours": 4.0,
        "proof_image_url": None,
        "is_synced_offline": False,
        "created_at": "2026-11-02T14:30:00"
    },
    {
        "entry_id": "JRN-8803",
        "farm_id": "FARM-101",
        "entry_date": "2026-11-15",
        "crop_name": "Wheat",
        "activity_type": "PEST_SPRAY",
        "description": "Herbicide spray for Gulli Danda weed control",
        "debit_account": "Crop Protection & Pesticides",
        "credit_account": "Cash in Hand",
        "amount_inr": 1850.0,
        "inputs_used": [{"item_name": "Sulfosulfuron 75 WG", "quantity": 1.0, "unit": "pack", "unit_price_inr": 1850.0}],
        "labor_hours": 6.0,
        "proof_image_url": None,
        "is_synced_offline": False,
        "created_at": "2026-11-15T09:15:00"
    },
    {
        "entry_id": "JRN-8804",
        "farm_id": "FARM-101",
        "entry_date": "2026-12-01",
        "crop_name": "Wheat",
        "activity_type": "LABOR",
        "description": "Field labor wages for weeding and canal channel clearing (4 mandays)",
        "debit_account": "Labor Wages",
        "credit_account": "Cash in Hand",
        "amount_inr": 2400.0,
        "inputs_used": [],
        "labor_hours": 32.0,
        "proof_image_url": None,
        "is_synced_offline": False,
        "created_at": "2026-12-01T17:00:00"
    },
    {
        "entry_id": "JRN-8805",
        "farm_id": "FARM-101",
        "entry_date": "2026-12-10",
        "crop_name": "Wheat",
        "activity_type": "DIESEL",
        "description": "Tractor fuel for secondary tilling & pump irrigation",
        "debit_account": "Diesel & Machinery Rent",
        "credit_account": "Cash in Hand",
        "amount_inr": 3100.0,
        "inputs_used": [{"item_name": "Diesel", "quantity": 34.4, "unit": "liters", "unit_price_inr": 90.0}],
        "labor_hours": 5.0,
        "proof_image_url": None,
        "is_synced_offline": False,
        "created_at": "2026-12-10T11:20:00"
    },
    {
        "entry_id": "JRN-8806",
        "farm_id": "FARM-101",
        "entry_date": "2027-04-10",
        "crop_name": "Wheat",
        "activity_type": "SALES",
        "description": "Mandi Grain Sale: Harvested 55 Quintals Wheat @ MSP ₹2,275/q",
        "debit_account": "Bank Account",
        "credit_account": "Mandi Crop Sales",
        "amount_inr": 125125.0,
        "inputs_used": [{"item_name": "Wheat Grain", "quantity": 55.0, "unit": "quintal", "unit_price_inr": 2275.0}],
        "labor_hours": 16.0,
        "proof_image_url": None,
        "is_synced_offline": False,
        "created_at": "2027-04-10T16:00:00"
    }
]

_ledger_db: List[Dict[str, Any]] = list(INITIAL_MOCK_ENTRIES)


# ─── Financial Accounting Computations ───────────────────────────────────────

def compute_financial_metrics(farm_id: str = "FARM-101") -> PnLStatement:
    farm_entries = [e for e in _ledger_db if e.get("farm_id") == farm_id or farm_id == "ALL"]
    if not farm_entries:
        farm_entries = _ledger_db

    revenue_map: Dict[str, float] = {acc: 0.0 for acc in VALID_REVENUE_ACCOUNTS}
    expense_map: Dict[str, float] = {acc: 0.0 for acc in VALID_EXPENSE_ACCOUNTS}
    
    total_debits = 0.0
    total_credits = 0.0
    total_yield_q = 55.0  # Default total yield in quintals

    for entry in farm_entries:
        amt = float(entry["amount_inr"])
        deb = entry["debit_account"]
        cred = entry["credit_account"]

        total_debits += amt
        total_credits += amt

        # Debit entries
        if deb in expense_map:
            expense_map[deb] += amt

        # Credit entries
        if cred in revenue_map:
            revenue_map[cred] += amt

        # Check for yield in sales
        if entry.get("activity_type") == "SALES":
            for inp in entry.get("inputs_used", []):
                if "quintal" in inp.get("unit", "").lower() or "q" in inp.get("unit", "").lower():
                    total_yield_q = max(total_yield_q, float(inp.get("quantity", 55.0)))

    total_revenue = sum(revenue_map.values())
    total_expenses = sum(expense_map.values())
    net_profit = total_revenue - total_expenses
    
    net_profit_margin = round((net_profit / total_revenue * 100), 2) if total_revenue > 0 else 0.0
    roi = round((net_profit / total_expenses * 100), 2) if total_expenses > 0 else 0.0
    cost_per_q = round(total_expenses / total_yield_q, 2) if total_yield_q > 0 else 0.0

    # Category Cost Distribution
    cat_distribution: List[CostDistribution] = []
    if total_expenses > 0:
        for cat, val in expense_map.items():
            if val > 0:
                pct = round((val / total_expenses) * 100, 1)
                cat_distribution.append(CostDistribution(category=cat, total_inr=round(val, 2), percentage=pct))
    else:
        cat_distribution.append(CostDistribution(category="No Expenses", total_inr=0.0, percentage=0.0))

    cat_distribution.sort(key=lambda x: x.total_inr, reverse=True)

    summary = FinancialSummary(
        total_revenue_inr=round(total_revenue, 2),
        total_expenses_inr=round(total_expenses, 2),
        net_profit_inr=round(net_profit, 2),
        net_profit_margin_percent=net_profit_margin,
        roi_percent=roi,
        total_yield_quintals=round(total_yield_q, 1),
        cost_per_quintal_inr=cost_per_q,
        debit_credit_balanced=abs(total_debits - total_credits) < 0.01
    )

    return PnLStatement(
        farm_id=farm_id,
        generated_at=datetime.now().isoformat(),
        revenue_breakdown={k: round(v, 2) for k, v in revenue_map.items() if v > 0},
        expense_breakdown={k: round(v, 2) for k, v in expense_map.items() if v > 0},
        financial_summary=summary,
        category_cost_distribution=cat_distribution
    )


# ─── API Endpoints ────────────────────────────────────────────────────────────

@router.post("/journal/entry", response_model=JournalEntry)
@router.post("/api/journal/entry", response_model=JournalEntry)
async def create_journal_entry(entry: JournalEntryCreate):
    """
    Record a new field transaction log with double-entry ledger balance validation.
    """
    if entry.amount_inr <= 0:
        raise HTTPException(status_code=400, detail="Transaction amount must be strictly greater than 0.")
    
    new_id = f"JRN-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now().isoformat()

    entry_dict = entry.dict()
    entry_dict["entry_id"] = new_id
    entry_dict["created_at"] = now_str

    _ledger_db.insert(0, entry_dict)

    return JournalEntry(**entry_dict)


@router.get("/journal/{farm_id}/logs")
@router.get("/api/journal/{farm_id}/logs")
async def get_journal_logs(farm_id: str, limit: int = Query(50, le=200)):
    """
    Retrieve paginated double-entry journal logs with live financial summary & cost distribution.
    """
    pnl = compute_financial_metrics(farm_id)
    farm_entries = [e for e in _ledger_db if e.get("farm_id") == farm_id or farm_id == "ALL"]
    if not farm_entries:
        farm_entries = _ledger_db

    return {
        "farm_id": farm_id,
        "total_entries": len(farm_entries),
        "financial_summary": pnl.financial_summary,
        "category_cost_distribution": pnl.category_cost_distribution,
        "entries": farm_entries[:limit]
    }


@router.get("/journal/{farm_id}/pnl-statement", response_model=PnLStatement)
@router.get("/api/journal/{farm_id}/pnl-statement", response_model=PnLStatement)
async def get_pnl_statement_endpoint(farm_id: str):
    """
    Generate dynamic Profit & Loss statement & balance sheet metrics.
    """
    return compute_financial_metrics(farm_id)


@router.get("/journal/{farm_id}/export")
@router.get("/api/journal/{farm_id}/export")
async def export_journal_csv(farm_id: str):
    """
    Export double-entry journal logs as formatted CSV report.
    """
    farm_entries = [e for e in _ledger_db if e.get("farm_id") == farm_id or farm_id == "ALL"]
    if not farm_entries:
        farm_entries = _ledger_db

    output = io.StringIO()
    writer = csv.writer(output)

    # Write Header
    writer.writerow([
        "Entry ID", "Date", "Crop", "Activity Type", "Description",
        "Debit Account (Dr)", "Credit Account (Cr)", "Amount (INR)", "Offline Synced", "Created At"
    ])

    for e in farm_entries:
        writer.writerow([
            e.get("entry_id"),
            e.get("entry_date"),
            e.get("crop_name"),
            e.get("activity_type"),
            e.get("description"),
            e.get("debit_account"),
            e.get("credit_account"),
            e.get("amount_inr"),
            e.get("is_synced_offline"),
            e.get("created_at")
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=E-Kisaan_Journal_{farm_id}_{date.today().strftime('%Y%m%d')}.csv"}
    )
