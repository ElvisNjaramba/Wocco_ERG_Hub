from base.models import HubMembership


def is_approved_member(user, hub):
    return HubMembership.objects.filter(
        hub=hub,
        user=user,
        is_approved=True
    ).exists()
