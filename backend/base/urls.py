from rest_framework.routers import DefaultRouter
from .views import DashboardViewSet
from django.urls import path

base_router = DefaultRouter()
base_router.register("dashboard", DashboardViewSet, basename="dashboard")

urlpatterns = base_router.urls