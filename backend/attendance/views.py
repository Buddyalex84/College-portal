from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Attendance, Timetable
from .serializers import AttendanceSerializer, TimetableSerializer
from students.views import IsAdmin


# ================= ATTENDANCE =================
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().select_related('student__user')
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Attendance.objects.all().select_related('student__user')
        user = self.request.user
        if user.is_authenticated and getattr(user, 'role', None) != 'admin':
            qs = qs.filter(student__user=user)
        return qs

    @action(detail=False, methods=['get'])
    def summary(self, request):
        # Summary for the currently logged-in student.
        user = request.user
        qs = Attendance.objects.all()
        if getattr(user, 'role', None) != 'admin':
            qs = qs.filter(student__user=user)

        total = qs.count()
        present = qs.filter(status='present').count()
        absent = qs.filter(status='absent').count()
        late = qs.filter(status='late').count()
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

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]