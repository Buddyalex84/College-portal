from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Assignment, Submission
from .serializers import AssignmentSerializer, SubmissionSerializer


# ================= ASSIGNMENTS =================
class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [AllowAny]  # ✅ allow without login

    def get_queryset(self):
        # ✅ DEMO MODE → return all assignments
        return self.queryset

    def get_permissions(self):
        return [AllowAny()]  # ✅ remove admin restriction


# ================= SUBMISSIONS =================
class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all().select_related('assignment', 'student__user')
    serializer_class = SubmissionSerializer
    permission_classes = [AllowAny]  # ✅ allow without login

    def get_queryset(self):
        return self.queryset  # ✅ no filtering

    def perform_create(self, serializer):
        # ✅ DEMO MODE → assign first student
        student = None
        try:
            student = Submission.objects.first().student
        except:
            pass

        serializer.save(student=student)

    @action(detail=False, methods=['get'])
    def my_submissions(self, request):
        # ✅ DEMO MODE → return all submissions
        submissions = self.get_queryset()
        serializer = self.get_serializer(submissions, many=True)
        return Response(serializer.data)