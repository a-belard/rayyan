"""
Agricultural advisory tools for the agent.
These tools provide the agent with capabilities to analyze farm data and provide recommendations.
"""

from typing import Any, Dict, List
from langchain_core.tools import tool
from datetime import datetime, timedelta
import random  # For demo/simulation - replace with real APIs


@tool
async def get_weather_forecast(location: str, days: int = 7) -> Dict[str, Any]:
    """
    Get weather forecast for the specified location.
    Provides rainfall, temperature, humidity, and evapotranspiration data.
    
    Args:
        location: Farm location (e.g., "California Central Valley", "lat,lon")
        days: Number of days to forecast (default: 7)
    
    Returns:
        Weather forecast with rainfall, temperature, ET₀, and humidity
    """
    # TODO: Integrate with real weather API (OpenWeatherMap, Visual Crossing, etc.)
    # For now, return simulated data
    forecast = {
        "location": location,
        "forecast_days": days,
        "summary": "Partly cloudy with chance of rain in 3 days",
        "daily_forecast": [
            {
                "date": (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d"),
                "temp_max_c": round(28 + random.uniform(-3, 3), 1),
                "temp_min_c": round(18 + random.uniform(-2, 2), 1),
                "rainfall_mm": round(random.uniform(0, 15), 1) if random.random() > 0.6 else 0,
                "humidity_percent": round(random.uniform(60, 85), 1),
                "et0_mm": round(random.uniform(4, 7), 2),  # Reference evapotranspiration
            }
            for i in range(days)
        ],
        "alerts": [
            "Heavy rain expected in 3 days (12mm) - reduce irrigation"
        ] if random.random() > 0.7 else []
    }
    return forecast


@tool
async def analyze_soil_conditions(zone_id: str, sensor_data: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """
    Analyze current soil/substrate conditions including moisture, EC, pH, and nutrients.
    
    Args:
        zone_id: Identifier for the farm zone or field
        sensor_data: Optional sensor readings (if not provided, will fetch latest)
    
    Returns:
        Soil analysis with moisture, EC, pH, and recommendations
    """
    # TODO: Integrate with actual sensor data from Supabase or IoT platform
    # For now, return simulated data
    moisture = round(random.uniform(35, 75), 1)
    ec = round(random.uniform(0.8, 2.5), 2)
    ph = round(random.uniform(6.0, 7.5), 1)
    
    status = "good"
    if moisture < 30 or ec > 2.0:
        status = "warning"
    if moisture < 20 or ec > 2.5:
        status = "critical"
    
    return {
        "zone_id": zone_id,
        "timestamp": datetime.now().isoformat(),
        "moisture_percent": moisture,
        "moisture_status": "🟢 Good" if moisture > 40 else "🟡 Low" if moisture > 25 else "🔴 Critical",
        "ec_ds_m": ec,
        "ec_status": "🟢 Good" if ec < 1.5 else "🟡 High" if ec < 2.5 else "🔴 Critical",
        "ph": ph,
        "ph_status": "🟢 Optimal" if 6.0 <= ph <= 7.0 else "🟡 Suboptimal",
        "overall_status": status,
        "recommendations": [
            f"Moisture at {moisture}% - {'Irrigation needed soon' if moisture < 40 else 'Adequate for now'}",
            f"EC at {ec} dS/m - {'Flush with low-EC water' if ec > 2.0 else 'Within acceptable range'}",
            f"pH at {ph} - {'Consider adjustment' if not (6.0 <= ph <= 7.0) else 'Optimal range'}"
        ]
    }


@tool
async def analyze_water_quality(source_id: str) -> Dict[str, Any]:
    """
    Analyze water source quality including EC, pH, and mixing recommendations.
    
    Args:
        source_id: Identifier for the water source (e.g., "well1", "ro_system", "storage_tank")
    
    Returns:
        Water quality analysis and mixing recommendations
    """
    # TODO: Integrate with actual water quality sensors/lab data
    water_ec = round(random.uniform(0.3, 1.8), 2)
    water_ph = round(random.uniform(6.5, 8.0), 1)
    
    return {
        "source_id": source_id,
        "timestamp": datetime.now().isoformat(),
        "ec_ds_m": water_ec,
        "ph": water_ph,
        "quality_rating": "🟢 Excellent" if water_ec < 0.75 else "🟡 Acceptable" if water_ec < 1.5 else "🟠 Poor",
        "mixing_recommendations": {
            "ro_blend_percent": max(0, min(100, int((water_ec - 0.5) * 50))) if water_ec > 0.5 else 0,
            "suggestion": f"Mix {max(0, min(100, int((water_ec - 0.5) * 50)))}% RO water with source water" if water_ec > 1.0 else "Use as-is"
        },
        "notes": [
            f"EC: {water_ec} dS/m - {'Good quality' if water_ec < 1.0 else 'High salinity, consider RO blending'}",
            f"pH: {water_ph} - {'Adjust to 6.5-7.0 range' if not (6.5 <= water_ph <= 7.0) else 'Within target range'}"
        ]
    }


@tool
async def detect_pest_activity(zone_id: str, acoustic_data: str | None = None) -> Dict[str, Any]:
    """
    Detect and analyze pest activity using acoustic monitoring or field reports.
    
    Args:
        zone_id: Identifier for the farm zone
        acoustic_data: Optional path to acoustic recording or sensor ID
    
    Returns:
        Pest detection results with species identification and severity
    """
    # TODO: Integrate with ML pest detection model (CNN on spectrograms)
    # For now, simulate pest detection
    has_pest = random.random() > 0.7
    
    if not has_pest:
        return {
            "zone_id": zone_id,
            "timestamp": datetime.now().isoformat(),
            "pest_detected": False,
            "status": "🟢 No significant pest activity detected",
            "confidence": 0.92,
            "recommendations": ["Continue regular monitoring", "Maintain preventive measures"]
        }
    
    pest_types = ["Locust", "Stem Borer", "Aphids", "Whitefly"]
    detected_pest = random.choice(pest_types)
    severity = random.choice(["low", "moderate", "high"])
    
    return {
        "zone_id": zone_id,
        "timestamp": datetime.now().isoformat(),
        "pest_detected": True,
        "pest_species": detected_pest,
        "severity": severity,
        "status": f"{'🟡' if severity == 'low' else '🟠' if severity == 'moderate' else '🔴'} {detected_pest} detected - {severity} severity",
        "confidence": 0.85,
        "recommendations": [
            f"Immediate action needed for {detected_pest} infestation" if severity == "high" else f"Monitor {detected_pest} activity closely",
            "Apply targeted treatment within 24-48 hours" if severity != "low" else "Consider preventive treatment",
            "Increase monitoring frequency to daily",
            f"Check adjacent zones for spread (Zone {zone_id})"
        ]
    }


@tool
async def calculate_irrigation_schedule(
    zone_id: str,
    crop_type: str,
    growth_stage: str,
    soil_data: Dict[str, Any] | None = None
) -> Dict[str, Any]:
    """
    Calculate optimal irrigation schedule based on crop needs, soil conditions, and weather.
    
    Args:
        zone_id: Identifier for the farm zone
        crop_type: Type of crop (e.g., "tomatoes", "lettuce", "strawberries")
        growth_stage: Current growth stage (e.g., "seedling", "vegetative", "flowering", "fruiting")
        soil_data: Optional current soil moisture data
    
    Returns:
        Irrigation schedule with timing, duration, and frequency
    """
    # TODO: Integrate with irrigation optimization ML model
    # Growth stage coefficients
    stage_factors = {
        "seedling": 0.3,
        "vegetative": 0.6,
        "flowering": 0.8,
        "fruiting": 1.0,
        "ripening": 0.7
    }
    
    base_duration = 15  # minutes
    factor = stage_factors.get(growth_stage.lower(), 0.7)
    duration = int(base_duration * factor)
    
    return {
        "zone_id": zone_id,
        "crop_type": crop_type,
        "growth_stage": growth_stage,
        "timestamp": datetime.now().isoformat(),
        "schedule": {
            "next_irrigation": "06:00 AM",
            "duration_minutes": duration,
            "frequency": "Daily" if growth_stage in ["flowering", "fruiting"] else "Every 2 days",
            "water_amount_liters": duration * 20,  # Assuming 20 L/min flow rate
        },
        "recommendations": [
            f"Run Zone {zone_id}: {duration} minutes at 6:00 AM",
            f"Current {growth_stage} stage requires {'high' if factor > 0.7 else 'moderate'} water",
            "Reduce by 30% if rain forecasted (>5mm within 24h)",
            "Monitor soil moisture daily during fruiting stage" if growth_stage == "fruiting" else "Check soil moisture every 2-3 days"
        ]
    }


@tool
async def recommend_fertigation(
    crop_type: str,
    growth_stage: str,
    soil_nutrients: Dict[str, float] | None = None
) -> Dict[str, Any]:
    """
    Recommend fertilizer mixing ratios and application rates for fertigation.
    
    Args:
        crop_type: Type of crop
        growth_stage: Current growth stage
        soil_nutrients: Optional soil nutrient test results (N, P, K, Ca, Mg)
    
    Returns:
        Fertigation recommendations with NPK ratios and application rates
    """
    # TODO: Integrate with fertigation optimization model
    # Growth stage nutrient needs
    stage_npk = {
        "seedling": (5, 5, 5),
        "vegetative": (10, 5, 8),
        "flowering": (5, 10, 15),
        "fruiting": (8, 12, 18),
        "ripening": (3, 8, 12)
    }
    
    npk = stage_npk.get(growth_stage.lower(), (5, 5, 5))
    
    return {
        "crop_type": crop_type,
        "growth_stage": growth_stage,
        "timestamp": datetime.now().isoformat(),
        "npk_ratio": f"{npk[0]}-{npk[1]}-{npk[2]}",
        "mixing_instructions": {
            "nitrogen_g_per_L": npk[0] / 10,
            "phosphorus_g_per_L": npk[1] / 10,
            "potassium_g_per_L": npk[2] / 10,
            "ec_target_ds_m": round(1.2 + (npk[2] / 20), 2)
        },
        "application": {
            "frequency": "Every irrigation" if growth_stage in ["flowering", "fruiting"] else "Every other irrigation",
            "concentration_percent": 0.1 if growth_stage == "seedling" else 0.15,
        },
        "recommendations": [
            f"Use {npk[0]}-{npk[1]}-{npk[2]} fertilizer for {growth_stage} stage",
            f"Target EC: {round(1.2 + (npk[2] / 20), 2)} dS/m in fertigation solution",
            f"Apply {'with each irrigation' if growth_stage in ['flowering', 'fruiting'] else 'every other irrigation'}",
            "Flush with pure water every 2 weeks to prevent salt buildup",
            "Monitor leaf color and adjust N if yellowing occurs"
        ]
    }


def create_agricultural_tools() -> List[Any]:
    """Create the list of tools available to the agricultural agent."""
    return [
        get_weather_forecast,
        analyze_soil_conditions,
        analyze_water_quality,
        detect_pest_activity,
        calculate_irrigation_schedule,
        recommend_fertigation,
    ]
