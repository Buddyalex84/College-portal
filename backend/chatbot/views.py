from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.http import StreamingHttpResponse
from .models import ChatMessage
from .serializers import ChatMessageSerializer
import os
import json
import asyncio
from dotenv import load_dotenv

load_dotenv()

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow both authenticated and guest users
async def chat(request):
    try:
        user_message = request.data.get('message', '')
        session_id = request.data.get('session_id', 'guest')
        
        if not user_message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Store user message
        user_msg = ChatMessage.objects.create(
            user=request.user if request.user.is_authenticated else None,
            session_id=session_id,
            role='user',
            content=user_message
        )
        
        # Import here to avoid circular imports
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # System message with portal context
        system_message = """You are a helpful AI assistant for the College Student Portal. Your role is to help students navigate and use the portal effectively.

**Portal Features:**
1. Dashboard - View attendance %, average marks, pending assignments, and fees
2. Profile - View and update personal information
3. Notices - View college announcements and important updates
4. Attendance - Track class attendance by subject with statistics
5. Marks/Results - View exam scores and percentages
6. Timetable - Check weekly class schedule
7. Assignments - View assignments, submit work, and check deadlines
8. Fees - View payment status and balance
9. Queries - Submit questions/complaints to administration

**Admin Features:**
- Manage students (add, edit, delete)
- Post notices and announcements
- Mark attendance for classes
- Enter student marks
- Create and manage assignments
- Respond to student queries

**How to Help:**
- Answer questions about portal features clearly
- Guide users to specific sections (e.g., "Go to Attendance page in the sidebar")
- Provide step-by-step instructions for tasks
- Be friendly, concise, and helpful
- If you don't know something specific to their data, acknowledge it and guide them to the right section

**Navigation Tips:**
- All main features are accessible from the left sidebar
- Students and admins see different menus based on their role
- Click on menu items to navigate to different sections
"""
        
        # Initialize chat with Emergent LLM key
        chat_instance = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")
        
        # Create user message
        message = UserMessage(text=user_message)
        
        # Get response from LLM
        response = await chat_instance.send_message(message)
        
        # Store assistant response
        assistant_msg = ChatMessage.objects.create(
            user=request.user if request.user.is_authenticated else None,
            session_id=session_id,
            role='assistant',
            content=response
        )
        
        return Response({
            'response': response,
            'session_id': session_id
        })
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return Response(
            {'error': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
