from django.db import models
from datetime import datetime

MEDIUM_CHOICES = (
    ("ROAD","ROAD"),
    ("RAIL","RAIL"),
    ("FLIGHT","FLIGHT")
)

class Coordinate(models.Model):
    latitude = models.FloatField(blank=False)
    longitude = models.FloatField(blank=False)
    # alarm = models.models.ForeignKey("alarm.Alarm", on_delete=models.CASCADE, null=True)

class Alarm(models.Model):
    created_at = models.DateTimeField(default=datetime.now)
    destination = models.ForeignKey(Coordinate, on_delete=models.PROTECT, related_name="alarm_at")
    origin = models.ForeignKey(Coordinate, on_delete=models.PROTECT, related_name="alarm_from")
    medium = models.CharField(max_length=10, choices=MEDIUM_CHOICES)
    place = models.CharField(max_length=50)
    triggered = models.BooleanField(default=False)