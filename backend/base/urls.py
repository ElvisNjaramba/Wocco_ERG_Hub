from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import DashboardViewSet, EventViewSet, HubViewSet, MessageHighlightViewSet, MessageViewSet, me, list_users, superusers_list

base_router = DefaultRouter()
base_router.register("dashboard", DashboardViewSet, basename="dashboard")
base_router.register("hubs", HubViewSet, basename="hubs")
base_router.register("messages", MessageViewSet, basename="messages")
base_router.register("highlights", MessageHighlightViewSet, basename="highlights")
base_router.register("events", EventViewSet, basename="events")


urlpatterns = base_router.urls + [
    path("me/", me),
    path("users/", list_users),
    path("superusers/", superusers_list),
]
