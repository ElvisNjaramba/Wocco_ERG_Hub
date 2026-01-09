from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import DashboardViewSet, HubViewSet, MessageViewSet, me

base_router = DefaultRouter()
base_router.register("dashboard", DashboardViewSet, basename="dashboard")
base_router.register("hubs", HubViewSet, basename="hubs")
base_router.register("messages", MessageViewSet, basename="messages")

urlpatterns = base_router.urls + [
    path("me/", me),
]
