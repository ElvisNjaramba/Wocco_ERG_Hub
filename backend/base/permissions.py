from base.models import HubMembership


def is_approved_member(user, hub):
    return HubMembership.objects.filter(
        hub=hub,
        user=user,
        is_approved=True
    ).exists()

def is_hub_admin(user, hub):
    return (
        user.is_superuser
        or hub.admins.filter(id=user.id).exists()
    )