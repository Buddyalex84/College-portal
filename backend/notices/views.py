from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Notice
from .serializers import NoticeSerializer


class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer
    permission_classes = [AllowAny]  # ✅ allow without login

    def get_permissions(self):
        return [AllowAny()]  # ✅ remove admin restriction

    def perform_create(self, serializer):
        # ✅ DEMO MODE → no user required
        serializer.save(posted_by=None)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')

        notices = self.queryset.filter(
            Q(title__icontains=query) | Q(content__icontains=query)
        )

        serializer = self.get_serializer(notices, many=True)
        return Response(serializer.data)