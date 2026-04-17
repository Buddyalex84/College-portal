from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Avg

from .models import User, Student, FeeDetails, Query, Marks
from .serializers import (
    UserSerializer, RegisterSerializer, StudentSerializer,
    StudentCreateSerializer, FeeDetailsSerializer, QuerySerializer, MarksSerializer
)

from assignments.models import Assignment


# ================== CUSTOM PERMISSION ==================
class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


# ================== AUTH APIs ==================
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is None:
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass

    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

    return Response({'error': 'Invalid username or password'}, status=401)


# ================== CURRENT USER ==================
@api_view(['GET'])
@permission_classes([AllowAny])
def current_user(request):
    user = User.objects.first()
    if user:
        return Response(UserSerializer(user).data)
    return Response({'error': 'No user found'})


# ================== PROFILE (NEW ✅) ==================
@api_view(['GET'])
@permission_classes([AllowAny])
def demo_profile(request):
    return Response({
        "username": "demo_student",
        "email": "demo@student.com",
        "first_name": "Ansh",
        "last_name": "Verma",
        "phone": "9999999999",
        "course": "B.Tech CSE",
        "semester": 4,
        "section": "A",
        "enrollment_number": "CSE2024001",
        "address": "Indore, MP",
        "parent_contact": "8888888888",
    })

# ================== DASHBOARD ==================
@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):

    student = Student.objects.first()

    if not student:
        return Response({
        'attendance_percentage': 75,
        'average_marks': 82,
        'pending_assignments': 2,
        'pending_fees': 1,
    })

    try:
        total_attendance = student.attendance.count()
        present_count = student.attendance.filter(status='present').count()

        attendance_percentage = (
            (present_count / total_attendance * 100)
            if total_attendance > 0 else 0
        )

        marks = student.marks.all()
        avg_marks = marks.aggregate(Avg('obtained_marks'))['obtained_marks__avg'] or 0

        pending_assignments = Assignment.objects.filter(
            course=student.course,
            semester=student.semester
        ).count()

        pending_fees = student.fees.filter(
            payment_status__in=['pending', 'partial']
        ).count()

        return Response({
            'attendance_percentage': round(attendance_percentage, 2),
            'average_marks': round(avg_marks, 2),
            'pending_assignments': pending_assignments,
            'pending_fees': pending_fees,
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ================== STUDENTS ==================
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().select_related('user')

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        return StudentSerializer

    def get_permissions(self):
        return [AllowAny()]


# ================== FEES ==================
class FeeDetailsViewSet(viewsets.ModelViewSet):
    queryset = FeeDetails.objects.all()
    serializer_class = FeeDetailsSerializer
    permission_classes = [AllowAny]


# ================== QUERIES ==================
class QueryViewSet(viewsets.ModelViewSet):
    queryset = Query.objects.all().select_related('student__user')
    serializer_class = QuerySerializer
    permission_classes = [AllowAny]


# ================== MARKS ==================
class MarksViewSet(viewsets.ModelViewSet):
    queryset = Marks.objects.all().select_related('student__user')
    serializer_class = MarksSerializer
    permission_classes = [AllowAny]