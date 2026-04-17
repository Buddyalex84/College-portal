from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Attendance, Timetable
from .serializers import AttendanceSerializer, TimetableSerializer


# ================= ATTENDANCE =================
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().select_related('student__user')
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]  # ✅ allow without login

    def get_queryset(self):
        # ✅ DEMO MODE → return all data
        return self.queryset

    def get_permissions(self):
        return [AllowAny()]  # ✅ remove admin restriction

    @action(detail=False, methods=['get'])
    def summary(self, request):
        # ✅ DEMO MODE → use first student
        student = None

        try:
            student = Attendance.objects.first().student
        except:
            pass

        if not student:
            return Response({
                'total': 0,
                'present': 0,
                'absent': 0,
                'late': 0,
                'percentage': 0,
            })

        total = student.attendance.count()
        present = student.attendance.filter(status='present').count()
        absent = student.attendance.filter(status='absent').count()
        late = student.attendance.filter(status='late').count()

        return Response({
            'total': total,
            'present': present,
            'absent': absent,
            'late': late,
            'percentage': (present / total * 100) if total > 0 else 0,
        })


# ================= TIMETABLE =================
class TimetableViewSet(viewsets.ModelViewSet):
    queryset = Timetable.objects.all()
    serializer_class = TimetableSerializer
    permission_classes = [AllowAny]  # ✅ allow without login

    def get_queryset(self):
        # ✅ DEMO MODE → return all timetable
        return self.queryset

    def get_permissions(self):
        return [AllowAny()]  # ✅ remove admin restriction