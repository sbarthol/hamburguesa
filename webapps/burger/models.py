from django.db import models
from django.utils import timezone

# Create your models here.

# A dummy scoreboard. We will add new stuff here to make sure it works
class Score(models.Model):
   username = models.CharField(max_length=30)
   creation_time = models.DateTimeField()
   ip_addr = models.GenericIPAddressField() # for validation purposes
   score = models.IntegerField()

