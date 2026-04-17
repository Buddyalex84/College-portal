from django.db import models
from students.models import Student

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    subject = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'attendance'
        ordering = ['-date']
        unique_together = ['student', 'date', 'subject']

class Timetable(models.Model):
    course = models.CharField(max_length=100)
    semester = models.IntegerField()
    day = models.CharField(max_length=10, choices=[
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
    ])
    time_slot = models.CharField(max_length=20)
    subject = models.CharField(max_length=100)
    faculty = models.CharField(max_length=100)
    room = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'timetable'
        ordering = ['day', 'time_slot']
