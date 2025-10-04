"""Sensor Reading Model"""
from sqlalchemy import Column, String, Float, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime

from .common import Base, UUID, TimestampMixin


class SensorReading(Base, TimestampMixin):
    """IoT sensor readings for farm zones"""

    __tablename__ = "sensor_readings"

    zone_id = Column(UUID, ForeignKey("farm_zones.id", ondelete="CASCADE"), nullable=False, index=True)
    soil_moisture = Column(Float, CheckConstraint("soil_moisture >= 0 AND soil_moisture <= 100"))
    temperature = Column(Float)  # celsius
    humidity = Column(Float, CheckConstraint("humidity >= 0 AND humidity <= 100"))
    soil_ph = Column(Float, CheckConstraint("soil_ph >= 0 AND soil_ph <= 14"))
    reading_timestamp = Column(String, nullable=False, default=datetime.utcnow)

    # Relationships
    zone = relationship("FarmZone", back_populates="sensor_readings")

    def __repr__(self):
        return f"<SensorReading(zone_id={self.zone_id}, timestamp={self.reading_timestamp})>"
