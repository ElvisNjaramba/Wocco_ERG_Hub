from django.contrib import admin
from .models import EventAttendance, Hub, HubMembership, Message, Event


class HubMembershipInline(admin.TabularInline):
    model = HubMembership
    extra = 0
    autocomplete_fields = ("user",)
    readonly_fields = ("requested_at", "approved_at")
    can_delete = True


@admin.register(Hub)
class HubAdmin(admin.ModelAdmin):
    list_display = ("name", "admin", "created_at", "member_count")
    search_fields = ("name", "admin__username")
    list_filter = ("created_at",)
    autocomplete_fields = ("admin",)
    inlines = [HubMembershipInline]

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = "Members"


@admin.register(HubMembership)
class HubMembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "hub", "is_approved", "requested_at", "approved_at")
    list_filter = ("is_approved", "requested_at")
    search_fields = ("user__username", "hub__name")
    autocomplete_fields = ("user", "hub")
    readonly_fields = ("requested_at",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("hub", "sender", "short_content", "timestamp", "has_media", "has_audio")
    list_filter = ("timestamp", "hub")
    search_fields = ("sender__username", "hub__name", "content")
    autocomplete_fields = ("hub", "sender")

    def short_content(self, obj):
        return (obj.content[:50] + "...") if obj.content and len(obj.content) > 50 else obj.content
    short_content.short_description = "Content"

    def has_media(self, obj):
        return bool(obj.media)
    has_media.boolean = True

    def has_audio(self, obj):
        return bool(obj.audio)
    has_audio.boolean = True

@admin.register(Event)
class HubEventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "hub",
        "created_by",
        "start_time",
        "end_time",
        "attendees_count",
        "created_at",
    )
    list_filter = ("hub", "start_time")
    search_fields = ("title", "description", "hub__name")
    readonly_fields = ("created_at",)

    def attendees_count(self, obj):
        return obj.attendances.count()

    attendees_count.short_description = "Attendees"

@admin.register(EventAttendance)
class EventAttendanceAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "event",
        "hub",
        "created_at",
    )
    list_filter = ("event__hub",)
    search_fields = (
        "user__username",
        "event__title",
        "event__hub__name",
    )
    readonly_fields = ("created_at",)

    def hub(self, obj):
        return obj.event.hub

    hub.short_description = "Hub"
