import os
import django
from django.conf import settings

# Setup django to access models
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jobkaro.settings')
django.setup()

from django.apps import apps

APPS_TO_PROCESS = ['accounts', 'marketplace', 'finance', 'moderation', 'core']

for app_name in APPS_TO_PROCESS:
    app_config = apps.get_app_config(app_name)
    models = app_config.get_models()
    
    serializers_content = [
        f'"""\n{app_name}/serializers.py\nAuto-generated serializers for {app_name} models.\n"""\n',
        'from rest_framework import serializers',
        f'from .models import *',
        '\n'
    ]
    
    views_content = [
        f'"""\n{app_name}/views.py\nAuto-generated ViewSets for {app_name} models.\n"""\n',
        'from rest_framework import viewsets, permissions',
        'from django_filters.rest_framework import DjangoFilterBackend',
        'from rest_framework.filters import SearchFilter, OrderingFilter',
        f'from .models import *',
        f'from .serializers import *',
        '\n'
    ]
    
    urls_content = [
        f'"""\n{app_name}/urls.py\nAuto-generated URL routing for {app_name} API.\n"""\n',
        'from django.urls import path, include',
        'from rest_framework.routers import DefaultRouter',
        f'from .views import *',
        '\n',
        'router = DefaultRouter()',
        '\n'
    ]
    
    for model in models:
        model_name = model.__name__
        
        # Determine serializer class logic
        if model_name == 'User':
            # Custom logic for User to hide password
            serializer = f"""
class {model_name}Serializer(serializers.ModelSerializer):
    class Meta:
        model = {model_name}
        exclude = ['password']
        read_only_fields = ['id', 'date_joined', 'last_login']
"""
        else:
            exclude_fields = []
            serializer = f"""
class {model_name}Serializer(serializers.ModelSerializer):
    class Meta:
        model = {model_name}
        fields = '__all__'
"""
        serializers_content.append(serializer)
        
        # ViewSet
        viewset = f"""
class {model_name}ViewSet(viewsets.ModelViewSet):
    queryset = {model_name}.objects.all()
    serializer_class = {model_name}Serializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
"""
        views_content.append(viewset)
        
        # URL routing
        # Make the route snake_case
        route_name = ''.join(['_'+c.lower() if c.isupper() else c for c in model_name]).lstrip('_')
        if route_name.endswith('s') and route_name != 'system_settings':
            # pluralize roughly
            pass
        elif not route_name.endswith('s') and not route_name.endswith('y'):
            route_name += 's'
        elif route_name.endswith('y'):
            route_name = route_name[:-1] + 'ies'
        
        urls_content.append(f"router.register(r'{route_name}', {model_name}ViewSet)")

    urls_content.append('\nurlpatterns = [\n    path("", include(router.urls)),\n]\n')
    
    # Write files
    app_dir = app_config.path
    with open(os.path.join(app_dir, 'serializers.py'), 'w') as f:
        f.write('\n'.join(serializers_content))
    with open(os.path.join(app_dir, 'views.py'), 'w') as f:
        f.write('\n'.join(views_content))
    with open(os.path.join(app_dir, 'urls.py'), 'w') as f:
        f.write('\n'.join(urls_content))

print("API Layer successfully generated.")
