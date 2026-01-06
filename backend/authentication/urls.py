from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, SuperUserDashboardViewSet, ProfileViewSet

authentication_router = DefaultRouter()

authentication_router.register("auth", AuthViewSet, basename="auth")
authentication_router.register("users", SuperUserDashboardViewSet, basename="users")
authentication_router.register("profile", ProfileViewSet, basename="profile")

urlpatterns = authentication_router.urls
