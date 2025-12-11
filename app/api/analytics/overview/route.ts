import { NextResponse } from "next/server"

export async function GET() {
  const overview = {
    impressions: {
      value: 2400000,
      change: 12.5,
      period: "30d",
    },
    visitors: {
      value: 184000,
      change: 8.2,
      period: "30d",
    },
    click_through_rate: {
      value: 4.8,
      change: 0.6,
      period: "30d",
    },
    conversion_rate: {
      value: 3.2,
      change: 0.4,
      period: "30d",
    },
    traffic_by_channel: [
      { channel: "organic", value: 4500 },
      { channel: "social", value: 2800 },
      { channel: "email", value: 3200 },
      { channel: "paid", value: 1900 },
      { channel: "referral", value: 1200 },
    ],
    traffic_trend: [
      { date: "2024-01-01", value: 4000 },
      { date: "2024-01-08", value: 3500 },
      { date: "2024-01-15", value: 5200 },
      { date: "2024-01-22", value: 4800 },
      { date: "2024-01-29", value: 6100 },
    ],
  }

  return NextResponse.json(overview)
}
