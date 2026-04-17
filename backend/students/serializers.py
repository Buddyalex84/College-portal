from rest_framework import serializers
from .models import User, Student, FeeDetails, Query, Marks
from django.contrib.auth.password_validation import validate_password


# ================= USER =================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone']
        read_only_fields = ['id']


# ================= REGISTER =================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')

        # ✅ FIX: Proper user creation
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            role=validated_data.get('role', 'student')
        )

        # ✅ IMPORTANT FIX (PASSWORD HASH)
        user.set_password(validated_data['password'])
        user.save()

        return user


# ================= STUDENT =================
class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Student
        fields = '__all__'


# ================= STUDENT CREATE =================
class StudentCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Student
        fields = [
            'enrollment_number', 'course', 'semester', 'section',
            'date_of_birth', 'address', 'parent_contact',
            'email', 'password', 'first_name', 'last_name', 'phone'
        ]

    def create(self, validated_data):
        # ✅ FIX: correct mapping
        email = validated_data.pop('email')
        password = validated_data.pop('password')

        user = User(
            username=email,   # use email as username
            email=email,
            first_name=validated_data.pop('first_name'),
            last_name=validated_data.pop('last_name'),
            phone=validated_data.pop('phone', ''),
            role='student'
        )

        # ✅ IMPORTANT FIX
        user.set_password(password)
        user.save()

        student = Student.objects.create(user=user, **validated_data)
        return student


# ================= FEES =================
class FeeDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeDetails
        fields = '__all__'


# ================= QUERY =================
class QuerySerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Query
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()


# ================= MARKS =================
class MarksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marks
        fields = '__all__'