from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import ChatMessage
from .serializers import ChatMessageSerializer
import re

# Rule-based portal assistant: matches the user's question against a curated
# knowledge base of portal topics and returns a deterministic answer. No
# external LLM, no API key, no network call.

KNOWLEDGE_BASE = {
    'attendance': {
        'keywords': ['attendance', 'present', 'absent', 'percentage', 'attend'],
        'answer': (
            "**Attendance**\n"
            "Open *Attendance* from the sidebar to see every class marked for you, grouped by subject, with your overall percentage at the top.\n"
            "The dashboard also shows a quick attendance summary. Only admins can mark or edit attendance records."
        ),
    },
    'marks': {
        'keywords': ['marks', 'result', 'grade', 'score', 'exam', 'cgpa', 'gpa'],
        'answer': (
            "**Marks / Results**\n"
            "Go to *Marks* in the sidebar to view every exam entry — subject, exam type (Mid Term, Final, Quiz, Assignment), obtained / total marks, and the semester.\n"
            "Your average across all subjects is shown on the dashboard."
        ),
    },
    'fees': {
        'keywords': ['fee', 'fees', 'payment', 'pay', 'balance', 'due', 'paid', 'pending fee'],
        'answer': (
            "**Fees**\n"
            "Open *Fees* in the sidebar to see each semester's total amount, what's already paid, the outstanding balance, due date, and the payment status (pending / partial / paid).\n"
            "Fee records are created by the administration; if something looks wrong, raise it via the *Queries* page."
        ),
    },
    'assignments': {
        'keywords': ['assignment', 'submit', 'submission', 'homework', 'deadline', 'due date'],
        'answer': (
            "**Assignments**\n"
            "Go to *Assignments* in the sidebar. Each card shows the title, subject, description, and deadline.\n"
            "Click an assignment to open it and upload your submission file before the deadline. Late submissions are flagged."
        ),
    },
    'timetable': {
        'keywords': ['timetable', 'schedule', 'class', 'classes', 'lecture', 'period'],
        'answer': (
            "**Timetable**\n"
            "Open *Timetable* in the sidebar to see your weekly schedule — day, time slot, subject, and room.\n"
            "It's read-only for students; the admin sets the schedule."
        ),
    },
    'notices': {
        'keywords': ['notice', 'notices', 'announcement', 'announcements', 'news', 'circular'],
        'answer': (
            "**Notices**\n"
            "Open *Notices* in the sidebar to read announcements from the administration — newest first.\n"
            "Only admins can post notices."
        ),
    },
    'queries': {
        'keywords': ['query', 'queries', 'complaint', 'complaints', 'ask admin', 'contact', 'support', 'problem'],
        'answer': (
            "**Queries**\n"
            "Open *Queries* in the sidebar to raise a question or complaint to the administration. Enter a subject and message and submit — you'll see the status (open / resolved) and the admin's reply on the same page."
        ),
    },
    'profile': {
        'keywords': ['profile', 'personal', 'details', 'edit profile', 'update profile', 'my info', 'photo', 'picture'],
        'answer': (
            "**Profile**\n"
            "Open *Profile* from the top-right user menu (or the sidebar) to view your enrollment number, course, year, semester, and contact details.\n"
            "Editable fields can be changed and saved directly from that page."
        ),
    },
    'dashboard': {
        'keywords': ['dashboard', 'overview', 'home', 'summary', 'stats'],
        'answer': (
            "**Dashboard**\n"
            "The dashboard (the home icon at the top of the sidebar) is your at-a-glance view: attendance %, average marks, pending assignments, and pending fees for students; total students, notices, and open queries for admins."
        ),
    },
    'login': {
        'keywords': ['login', 'log in', 'sign in', 'password', 'forgot', 'cannot login', 'invalid'],
        'answer': (
            "**Logging in**\n"
            "Use the username and password your administrator gave you on the login page. If your password isn't working, ask the administrator to reset it — there's no self-serve password reset yet."
        ),
    },
    'logout': {
        'keywords': ['logout', 'log out', 'sign out', 'signout'],
        'answer': "Click your name in the top-right corner of the page and choose **Logout**.",
    },
    'admin': {
        'keywords': ['add student', 'create student', 'manage student', 'admin', 'new student', 'register student'],
        'answer': (
            "**Admin tools**\n"
            "Logged in as admin, the sidebar shows *Students*, *Notices*, *Attendance*, *Marks*, *Fees*, *Assignments*, and *Queries*. Each page has an **Add** button to create new records, and clicking a row opens it for editing."
        ),
    },
    'navigation': {
        'keywords': ['where', 'how do i find', 'how to find', 'navigate', 'sidebar', 'menu'],
        'answer': (
            "Every feature lives in the **left sidebar**. Students see Dashboard, Profile, Notices, Attendance, Marks, Timetable, Assignments, Fees, and Queries. Admins see the management equivalents. Click any item to open that page."
        ),
    },
}

GREETING_PATTERNS = re.compile(r'\b(hi|hii|hello|hey|hola|namaste|good\s+(morning|afternoon|evening))\b', re.I)
THANKS_PATTERNS = re.compile(r'\b(thanks|thank\s*you|thx|ty)\b', re.I)
HELP_PATTERNS = re.compile(r'\b(help|what\s+can\s+you\s+do|capabilities|options|topics)\b', re.I)


def _match_topic(text):
    lowered = text.lower()
    best_key, best_score = None, 0
    for key, entry in KNOWLEDGE_BASE.items():
        score = sum(1 for kw in entry['keywords'] if kw in lowered)
        if score > best_score:
            best_key, best_score = key, score
    return best_key if best_score > 0 else None


def _help_answer(role):
    topics = ', '.join(sorted(KNOWLEDGE_BASE.keys()))
    if role == 'admin':
        intro = "I'm the Portal Assistant. As an admin you can ask me about managing students, posting notices, marking attendance, entering marks, creating fee records, assignments, and queries."
    else:
        intro = "I'm the Portal Assistant. Ask me anything about using the portal — attendance, marks, fees, assignments, timetable, notices, profile, queries, login, or navigation."
    return f"{intro}\n\nTopics I know: {topics}.\n\nTry: *How do I check my attendance?* or *Where can I submit assignments?*"


def _answer(message, user):
    text = (message or '').strip()
    role = getattr(user, 'role', None) if getattr(user, 'is_authenticated', False) else None
    name = getattr(user, 'first_name', '') or getattr(user, 'username', '')

    if HELP_PATTERNS.search(text):
        return _help_answer(role)

    if GREETING_PATTERNS.search(text) and len(text.split()) <= 4:
        hello = f"Hello {name}!" if name else "Hello!"
        return f"{hello} I'm the Portal Assistant. Ask me about attendance, marks, fees, assignments, timetable, notices, profile, or queries — or type *help* to see everything I cover."

    if THANKS_PATTERNS.search(text) and len(text.split()) <= 4:
        return "You're welcome! Ask me anything else about the portal whenever you need."

    topic = _match_topic(text)
    if topic:
        return KNOWLEDGE_BASE[topic]['answer']

    return (
        "I didn't catch that. I can help with these portal topics: "
        "**attendance, marks, fees, assignments, timetable, notices, queries, profile, dashboard, login, logout, navigation**.\n"
        "Try rephrasing — for example: *How do I view my marks?* or *Where do I pay fees?*"
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def chat(request):
    try:
        user_message = (request.data.get('message') or '').strip()
        session_id = request.data.get('session_id', 'guest')

        if not user_message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        user_obj = request.user if request.user.is_authenticated else None

        ChatMessage.objects.create(
            user=user_obj,
            session_id=session_id,
            role='user',
            content=user_message,
        )

        response_text = _answer(user_message, request.user)

        ChatMessage.objects.create(
            user=user_obj,
            session_id=session_id,
            role='assistant',
            content=response_text,
        )

        return Response({'response': response_text, 'session_id': session_id})

    except Exception as e:
        print(f"Chat error: {str(e)}")
        return Response(
            {'error': f'An error occurred: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_chat_history(request):
    session_id = request.query_params.get('session_id', 'guest')
    
    messages = ChatMessage.objects.filter(
        session_id=session_id
    ).exclude(role='system')
    
    serializer = ChatMessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def clear_chat_history(request):
    session_id = request.data.get('session_id', 'guest')
    
    ChatMessage.objects.filter(session_id=session_id).delete()
    
    return Response({'message': 'Chat history cleared'})
