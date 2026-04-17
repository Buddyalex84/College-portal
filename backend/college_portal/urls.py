from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from students.views import (
    StudentViewSet, FeeDetailsViewSet, QueryViewSet, MarksViewSet,
    register, login, current_user, dashboard_stats
)
from notices.views import NoticeViewSet
from attendance.views import AttendanceViewSet, TimetableViewSet
from assignments.views import AssignmentViewSet, SubmissionViewSet
from chatbot.views import chat, get_chat_history, clear_chat_history

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'fees', FeeDetailsViewSet)
router.register(r'queries', QueryViewSet)
router.register(r'marks', MarksViewSet)
router.register(r'notices', NoticeViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'timetable', TimetableViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'submissions', SubmissionViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/register/', register, name='register'),
    path('api/auth/login/', login, name='login'),
    path('api/auth/me/', current_user, name='current_user'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/dashboard/', dashboard_stats, name='dashboard_stats'),
    path('api/chat/', chat, name='chat'),
    path('api/chat/history/', get_chat_history, name='chat_history'),
    path('api/chat/clear/', clear_chat_history, name='clear_chat'),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
