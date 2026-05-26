from django.db import models
from django.conf import settings


class StudentProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    course = models.CharField(max_length=100)

    semester = models.IntegerField()

    contact = models.CharField(max_length=15)

    def __str__(self):
        return str(self.user)