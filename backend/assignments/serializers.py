from rest_framework import serializers
from .models import Assignment, Submission

class AssignmentSerializer(serializers.ModelSerializer):
    submission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = '__all__'
    
    def get_submission_count(self, obj):
        return obj.submissions.count()

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assignment_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Submission
        fields = '__all__'
    
    def get_student_name(self, obj):
        return obj.student.user.get_full_name()
    
    def get_assignment_title(self, obj):
        return obj.assignment.title
