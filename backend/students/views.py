from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Avg

from .models import (
    User,
    Student,
    FeeDetails,
    Query,
    Marks
)

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    StudentSerializer,
    StudentCreateSerializer,
    FeeDetailsSerializer,
    QuerySerializer,
    MarksSerializer
)

from assignments.models import Assignment, Submission
from notices.models import Notice

# CUSTOM ADMIN PERMISSION

class IsAdmin(permissions.BasePermission):

    def has_permission(self, request, view):

        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


# REGISTER API

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


# LOGIN API

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):

    username = request.data.get('username')

    password = request.data.get('password')

    user = authenticate(
        username=username,
        password=password
    )

    # LOGIN USING EMAIL ALSO
    if user is None:

        try:

            user_obj = User.objects.get(email=username)

            user = authenticate(
                username=user_obj.username,
                password=password
            )

        except User.DoesNotExist:

            return Response({
                'error': 'Invalid username/email or password'
            }, status=401)

    if user:

        refresh = RefreshToken.for_user(user)

        return Response({

            'message': 'Login Successful',

            'user': UserSerializer(user).data,

            'access': str(refresh.access_token),

            'refresh': str(refresh),

        })

    return Response({
        'error': 'Invalid username or password'
    }, status=401)


# CURRENT USER API

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):

    serializer = UserSerializer(request.user)

    return Response(serializer.data)


# PROFILE API

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):

    try:

        student = Student.objects.get(user=request.user)

        return Response({

            "username": request.user.username,

            "email": request.user.email,

            "first_name": request.user.first_name,

            "last_name": request.user.last_name,

            "phone": request.user.phone,

            "role": request.user.role,

            "course": student.course,

            "year": student.year,

            "semester": student.semester,

            "section": student.section,

            "enrollment_number": student.enrollment_number,

            "address": student.address,

            "parent_contact": student.parent_contact,

        })

    except Student.DoesNotExist:

        return Response({
            'error': 'Student profile not found'
        }, status=404)


# DASHBOARD API

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):

    # Admin dashboard: portal-wide counts.
    if getattr(request.user, 'role', None) == 'admin':
        return Response({
            'total_students': Student.objects.count(),
            'total_notices': Notice.objects.count(),
            'open_queries': Query.objects.filter(status='open').count(),
            'pending_submissions': Submission.objects.filter(marks_obtained__isnull=True).count(),
        })

    # Student dashboard: stats for the logged-in student only.
    try:

        student = Student.objects.get(user=request.user)

        # ATTENDANCE
        total_attendance = student.attendance.count()

        present_count = student.attendance.filter(
            status='present'
        ).count()

        attendance_percentage = (
            (present_count / total_attendance) * 100
            if total_attendance > 0 else 0
        )

        # MARKS
        marks = student.marks.all()

        avg_marks = marks.aggregate(
            Avg('obtained_marks')
        )['obtained_marks__avg'] or 0

        # ASSIGNMENTS
        pending_assignments = Assignment.objects.filter(
            course=student.course,
            semester=student.semester
        ).count()

        # FEES
        pending_fees = student.fees.filter(
            payment_status__in=['pending', 'partial']
        ).count()

        return Response({

            'student_name': request.user.get_full_name(),

            'attendance_percentage': round(
                attendance_percentage,
                2
            ),

            'average_marks': round(
                avg_marks,
                2
            ),

            'pending_assignments': pending_assignments,

            'pending_fees': pending_fees,

        })

    except Student.DoesNotExist:

        return Response({
            'error': 'Student profile not found'
        }, status=404)


# STUDENTS VIEWSET

class StudentViewSet(viewsets.ModelViewSet):

    queryset = Student.objects.all().select_related('user')

    def get_serializer_class(self):

        if self.action == 'create':

            return StudentCreateSerializer

        return StudentSerializer

    def get_permissions(self):
        # Only admins can list/create/update/delete student records.
        # A logged-in student can still GET their own record via /retrieve.
        if self.action in ('create', 'update', 'partial_update', 'destroy', 'list'):
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        # Non-admin users only ever see their own student record.
        qs = Student.objects.all().select_related('user')
        user = self.request.user
        if user.is_authenticated and getattr(user, 'role', None) != 'admin':
            qs = qs.filter(user=user)
        return qs


# FEES VIEWSET

class FeeDetailsViewSet(viewsets.ModelViewSet):

    queryset = FeeDetails.objects.all().select_related('student__user')

    serializer_class = FeeDetailsSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = FeeDetails.objects.all().select_related('student__user')
        user = self.request.user
        if user.is_authenticated and getattr(user, 'role', None) != 'admin':
            qs = qs.filter(student__user=user)
        return qs


# QUERIES VIEWSET

class QueryViewSet(viewsets.ModelViewSet):

    queryset = Query.objects.all().select_related(
        'student__user'
    )

    serializer_class = QuerySerializer

    permission_classes = [IsAuthenticated]



# MARKS VIEWSET


class MarksViewSet(viewsets.ModelViewSet):

    queryset = Marks.objects.all().select_related(
        'student__user'
    )

    serializer_class = MarksSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Marks.objects.all().select_related('student__user')
        user = self.request.user
        if user.is_authenticated and getattr(user, 'role', None) != 'admin':
            qs = qs.filter(student__user=user)
        return qs