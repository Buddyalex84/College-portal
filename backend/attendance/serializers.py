from rest_framework import serializers
from .models import Attendance, Timetable

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username

class TimetableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timetable
        fields = '__all__'
