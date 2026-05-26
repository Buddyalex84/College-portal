from rest_framework import serializers
from django.db import transaction
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

        # FIX: Proper user creation
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            role=validated_data.get('role', 'student')
        )

        # IMPORTANT FIX (PASSWORD HASH)
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
    # User account fields supplied by the admin when creating a student.
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    enrollment_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Student
        fields = [
            'enrollment_number', 'course', 'year', 'semester', 'section',
            'date_of_birth', 'address', 'parent_contact',
            'username', 'password', 'email',
            'first_name', 'last_name', 'phone',
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop('username').strip()
        password = validated_data.pop('password')
        email = validated_data.pop('email').strip()
        first_name = validated_data.pop('first_name').strip()
        last_name = validated_data.pop('last_name').strip()
        phone = validated_data.pop('phone', '').strip()

        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role='student',
        )
        user.set_password(password)
        user.save()

        # Default the enrollment number to the username if the admin didn't
        # provide one explicitly.
        if not validated_data.get('enrollment_number'):
            validated_data['enrollment_number'] = username

        student = Student.objects.create(user=user, **validated_data)
        return student

    def to_representation(self, instance):
        # Return the same shape as StudentSerializer so the admin UI can
        # append the newly created student to its list without a refetch.
        return StudentSerializer(instance, context=self.context).data


# ================= FEES =================
class FeeDetailsSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()

    class Meta:
        model = FeeDetails
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username

    def get_balance(self, obj):
        return float(obj.total_amount) - float(obj.paid_amount)


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
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Marks
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.username