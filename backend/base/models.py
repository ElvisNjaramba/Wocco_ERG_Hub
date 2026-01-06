from django.db import models
from django.contrib.auth.models import User

class Hub(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_hubs")
    members = models.ManyToManyField(User, through="HubMembership", related_name="hubs")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class HubMembership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    hub = models.ForeignKey(Hub, on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "hub")

class Message(models.Model):
    hub = models.ForeignKey(Hub, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(blank=True, null=True)
    media = models.FileField(upload_to="hub_media/", blank=True, null=True)
    audio = models.FileField(upload_to="hub_audio/", blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username} @ {self.hub.name}"
