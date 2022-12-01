from django.db import models
from django.utils import timezone

# Create your models here.

class Score(models.Model):
   winner_name = models.CharField(max_length=256)
   loser_name = models.CharField(max_length=256)
   room_name = models.CharField(max_length=256)
   duration_millis = models.IntegerField()
   start_time = models.DateTimeField()
