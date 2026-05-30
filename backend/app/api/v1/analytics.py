from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime, date, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.analytics import DailyMetric, AnalyticsEvent

router = APIRouter()


# Schemas
class DashboardMetrics(BaseModel):
    total_content: int
    total_leads: int
    total_deals: int
    total_revenue: float
    content_this_month: int
    leads_this_month: int
    conversion_rate: float
    email_open_rate: float


class MetricTrend(BaseModel):
    date: date
    value: float


class AnalyticsResponse(BaseModel):
    metrics: DashboardMetrics
    content_trend: list[MetricTrend]
    lead_trend: list[MetricTrend]
    revenue_trend: list[MetricTrend]


# Routes
@router.get("/dashboard", response_model=AnalyticsResponse)
async def get_dashboard_analytics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    product_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard analytics"""
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()
    
    # Get daily metrics for the period
    query = select(DailyMetric).where(
        DailyMetric.org_id == current_user.org_id,
        DailyMetric.date >= start_date,
        DailyMetric.date <= end_date
    )
    if product_id:
        query = query.where(DailyMetric.product_id == product_id)
    
    result = await db.execute(query.order_by(DailyMetric.date))
    metrics = result.scalars().all()
    
    # Calculate aggregates
    total_content = sum(m.content_created or 0 for m in metrics)
    total_leads = sum(m.new_leads or 0 for m in metrics)
    converted_leads = sum(m.converted_leads or 0 for m in metrics)
    total_revenue = float(sum(m.revenue or 0 for m in metrics))
    emails_sent = sum(m.emails_sent or 0 for m in metrics)
    emails_opened = sum(m.emails_opened or 0 for m in metrics)
    
    conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0
    email_open_rate = (emails_opened / emails_sent * 100) if emails_sent > 0 else 0
    
    # Build trends
    content_trend = [MetricTrend(date=m.date, value=float(m.content_created or 0)) for m in metrics]
    lead_trend = [MetricTrend(date=m.date, value=float(m.new_leads or 0)) for m in metrics]
    revenue_trend = [MetricTrend(date=m.date, value=float(m.revenue or 0)) for m in metrics]
    
    return AnalyticsResponse(
        metrics=DashboardMetrics(
            total_content=total_content,
            total_leads=total_leads,
            total_deals=sum(m.deals_won or 0 for m in metrics),
            total_revenue=total_revenue,
            content_this_month=total_content,
            leads_this_month=total_leads,
            conversion_rate=round(conversion_rate, 2),
            email_open_rate=round(email_open_rate, 2)
        ),
        content_trend=content_trend,
        lead_trend=lead_trend,
        revenue_trend=revenue_trend
    )


@router.post("/events")
async def track_event(
    event_type: str,
    properties: dict = {},
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Track an analytics event"""
    event = AnalyticsEvent(
        org_id=current_user.org_id,
        user_id=current_user.id,
        event_type=event_type,
        properties=properties
    )
    db.add(event)
    await db.commit()
    return {"status": "tracked"}
