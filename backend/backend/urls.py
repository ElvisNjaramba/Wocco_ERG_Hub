from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from authentication.urls import authentication_router
from base.urls import base_router
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.registry.extend(authentication_router.registry)
router.registry.extend(base_router.registry)

urlpatterns = [
    path("admin/", admin.site.urls),

    # 🔥 API ROUTES
    path("api/", include(router.urls)),

    # 🔐 JWT AUTH
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]


# Media file serving in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
