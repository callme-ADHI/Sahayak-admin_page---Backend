"""
marketplace/serializers.py
Auto-generated serializers for marketplace models.
"""

from rest_framework import serializers
from .models import *



class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class WorkerCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerCategory
        fields = '__all__'


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'


class JobAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobAssignment
        fields = '__all__'


class JobStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobStatusHistory
        fields = '__all__'
