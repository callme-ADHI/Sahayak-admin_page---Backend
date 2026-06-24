from django.urls import path
from . import views

urlpatterns = [
    path('init-db/', views.InitDbView.as_view(), name='init-db'),
    path('users/', views.UsersApiView.as_view(), name='users'),
    path('workers/', views.WorkersApiView.as_view(), name='workers'),
    path('bookings/', views.BookingsApiView.as_view(), name='bookings'),
    path('categories/', views.CategoriesApiView.as_view(), name='categories'),
    path('payments/', views.PaymentsApiView.as_view(), name='payments'),
    path('reports/', views.ReportsApiView.as_view(), name='reports'),
    path('admins/', views.AdminsApiView.as_view(), name='admins'),
    path('analytics/', views.AnalyticsApiView.as_view(), name='analytics'),
]