# Admin configuration
from django.contrib import admin
from .models import User, Student, FeeDetails, Query, Marks

admin.site.register(User)
admin.site.register(Student)
admin.site.register(FeeDetails)
admin.site.register(Query)
admin.site.register(Marks)
