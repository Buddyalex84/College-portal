from django.core.management.base import BaseCommand
from students.models import User, Student, FeeDetails, Query, Marks
from notices.models import Notice
from attendance.models import Attendance, Timetable
from assignments.models import Assignment
from datetime import datetime, timedelta
import os

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **kwargs):
        # Create admin user
        admin, created = User.objects.get_or_create(
            username='admin@college.edu',
            defaults={
                'email': 'admin@college.edu',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Admin user created'))
        
        # Create test student users
        students_data = [
            {'enrollment': 'CSE2024001', 'name': 'John', 'lastname': 'Doe', 'course': 'Computer Science', 'semester': 4},
            {'enrollment': 'CSE2024002', 'name': 'Jane', 'lastname': 'Smith', 'course': 'Computer Science', 'semester': 4},
            {'enrollment': 'EE2024001', 'name': 'Mike', 'lastname': 'Johnson', 'course': 'Electrical Engineering', 'semester': 6},
        ]
        
        for data in students_data:
            user, created = User.objects.get_or_create(
                username=f"{data['enrollment'].lower()}@student.edu",
                defaults={
                    'email': f"{data['enrollment'].lower()}@student.edu",
                    'first_name': data['name'],
                    'last_name': data['lastname'],
                    'role': 'student',
                    'phone': '1234567890',
                }
            )
            if created:
                user.set_password('student123')
                user.save()
                
                student = Student.objects.create(
                    user=user,
                    enrollment_number=data['enrollment'],
                    course=data['course'],
                    semester=data['semester'],
                    section='A',
                    address='123 College Street',
                    parent_contact='9876543210'
                )
                self.stdout.write(self.style.SUCCESS(f'Student {data["enrollment"]} created'))
                
                # Add fee details
                FeeDetails.objects.create(
                    student=student,
                    semester=data['semester'],
                    total_amount=50000,
                    paid_amount=30000,
                    due_date=datetime.now() + timedelta(days=30),
                    payment_status='partial'
                )
                
                # Add some marks
                subjects = ['Mathematics', 'Physics', 'Programming', 'Data Structures']
                for subject in subjects:
                    Marks.objects.create(
                        student=student,
                        subject=subject,
                        exam_type='Mid-term',
                        total_marks=100,
                        obtained_marks=75 + (hash(data['enrollment'] + subject) % 20),
                        semester=data['semester']
                    )
                
                # Add attendance
                subjects_att = ['Mathematics', 'Physics', 'Programming']
                for i in range(20):
                    date = datetime.now() - timedelta(days=i)
                    for subject in subjects_att:
                        Attendance.objects.get_or_create(
                            student=student,
                            date=date.date(),
                            subject=subject,
                            defaults={'status': 'present' if i % 5 != 0 else 'absent'}
                        )
        
        # Create notices
        notices_data = [
            {'title': 'Mid-term Exam Schedule Released', 'content': 'Please check the exam schedule on the portal.', 'category': 'exam', 'priority': 'high'},
            {'title': 'Sports Day Event', 'content': 'Annual sports day will be held on 25th March.', 'category': 'event', 'priority': 'medium'},
            {'title': 'Library Hours Extended', 'content': 'Library will remain open until 10 PM during exam week.', 'category': 'general', 'priority': 'low'},
        ]
        
        for notice_data in notices_data:
            Notice.objects.get_or_create(
                title=notice_data['title'],
                defaults={
                    'content': notice_data['content'],
                    'category': notice_data['category'],
                    'priority': notice_data['priority'],
                    'posted_by': admin
                }
            )
        
        # Create timetable
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        time_slots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00']
        subjects = ['Mathematics', 'Physics', 'Programming', 'Data Structures', 'Digital Logic']
        
        for day in days:
            for i, time_slot in enumerate(time_slots):
                Timetable.objects.get_or_create(
                    course='Computer Science',
                    semester=4,
                    day=day,
                    time_slot=time_slot,
                    defaults={
                        'subject': subjects[i % len(subjects)],
                        'faculty': f'Dr. {subjects[i % len(subjects)]} Professor',
                        'room': f'Room {101 + i}'
                    }
                )
        
        # Create assignments
        Assignment.objects.get_or_create(
            title='Data Structures Project',
            defaults={
                'description': 'Implement binary search tree with all operations',
                'subject': 'Data Structures',
                'course': 'Computer Science',
                'semester': 4,
                'due_date': datetime.now() + timedelta(days=7),
                'total_marks': 50
            }
        )
        
        # Write test credentials
        os.makedirs('/app/memory', exist_ok=True)
        with open('/app/memory/test_credentials.md', 'w') as f:
            f.write('# Test Credentials\n\n')
            f.write('## Admin\n')
            f.write('- Username: admin@college.edu\n')
            f.write('- Password: admin123\n')
            f.write('- Role: admin\n\n')
            f.write('## Test Students\n')
            f.write('- Username: cse2024001@student.edu\n')
            f.write('- Password: student123\n')
            f.write('- Role: student\n')
            f.write('- Enrollment: CSE2024001\n\n')
            f.write('## Endpoints\n')
            f.write('- Login: POST /api/auth/login/\n')
            f.write('- Register: POST /api/auth/register/\n')
            f.write('- Current User: GET /api/auth/me/\n')
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
