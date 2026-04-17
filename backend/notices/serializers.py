from rest_framework import serializers
from .models import Notice

class NoticeSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Notice
        fields = '__all__'
    
    def get_posted_by_name(self, obj):
        if obj.posted_by:
            return obj.posted_by.get_full_name()
        return 'Admin'
