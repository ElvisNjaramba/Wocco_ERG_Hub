from django.contrib import admin
from .models import Profile
from django.utils.html import format_html

# Optional: allow inline editing in the User admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# Inline profile editing inside User admin
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = "Profile"

# Extend the existing User admin
class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)

# Re-register User admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Optional: also register Profile separately if you want a dedicated view
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "avatar_display")
    search_fields = ("user__username", "user__email", "phone")

    def avatar_display(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" width="50" />', obj.avatar.url)
        return "-"
    avatar_display.short_description = "Avatar"
