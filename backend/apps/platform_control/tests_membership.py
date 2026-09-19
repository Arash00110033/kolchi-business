from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.stores.models import Store, StoreMembership
from apps.users.models import PlatformOwner


User = get_user_model()


class OwnerMembershipAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.owner = User.objects.create_user(
            username="owner-membership-test",
            email="owner-membership@test.local",
            password="StrongPass123!",
        )
        PlatformOwner.objects.create(user=self.owner)

        self.normal_user = User.objects.create_user(
            username="normal-owner-membership-test",
            email="normal-owner-membership@test.local",
            password="StrongPass123!",
        )

        self.member = User.objects.create_user(
            username="owner-member-test",
            email="owner-member@test.local",
            password="StrongPass123!",
        )

        self.new_user = User.objects.create_user(
            username="owner-new-member-test",
            email="owner-new-member@test.local",
            password="StrongPass123!",
        )

        self.other_owner = User.objects.create_user(
            username="owner-other-store-test",
            email="owner-other-store@test.local",
            password="StrongPass123!",
        )

        self.store = Store.objects.create(
            owner=self.owner,
            name="Owner Membership Store",
            slug="owner-membership-store",
            is_active=True,
        )

        self.inactive_store = Store.objects.create(
            owner=self.owner,
            name="Inactive Owner Store",
            slug="inactive-owner-store",
            is_active=False,
        )

        self.other_store = Store.objects.create(
            owner=self.other_owner,
            name="Other Owner Store",
            slug="other-owner-store",
            is_active=True,
        )

        self.membership = StoreMembership.objects.create(
            store=self.store,
            user=self.member,
            role=StoreMembership.Role.EDITOR,
        )

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def members_url(self, store=None):
        store = store or self.store
        return f"/api/v1/owner/stores/{store.id}/members/"

    def member_url(self, membership):
        return (
            f"/api/v1/owner/stores/"
            f"{membership.store_id}/members/{membership.id}/"
        )

    def test_owner_can_list_members(self):
        self.auth(self.owner)

        response = self.client.get(self.members_url())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["username"], self.member.username)

    def test_owner_can_view_member(self):
        self.auth(self.owner)

        response = self.client.get(
            self.member_url(self.membership)
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.membership.id)
        self.assertEqual(response.data["username"], self.member.username)

    def test_owner_can_add_member(self):
        self.auth(self.owner)

        response = self.client.post(
            self.members_url(),
            {
                "user_id": self.new_user.id,
                "role": StoreMembership.Role.ADMIN,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        self.assertTrue(
            StoreMembership.objects.filter(
                store=self.store,
                user=self.new_user,
                role=StoreMembership.Role.ADMIN,
            ).exists()
        )

    def test_owner_can_change_member_role(self):
        self.auth(self.owner)

        response = self.client.patch(
            self.member_url(self.membership),
            {"role": StoreMembership.Role.ADMIN},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.membership.refresh_from_db()

        self.assertEqual(
            self.membership.role,
            StoreMembership.Role.ADMIN,
        )

    def test_owner_can_remove_member(self):
        self.auth(self.owner)

        response = self.client.delete(
            self.member_url(self.membership)
        )

        self.assertEqual(response.status_code, 204)

        self.assertFalse(
            StoreMembership.objects.filter(
                id=self.membership.id
            ).exists()
        )

    def test_owner_cannot_be_added_as_member(self):
        self.auth(self.owner)

        response = self.client.post(
            self.members_url(),
            {
                "user_id": self.owner.id,
                "role": StoreMembership.Role.ADMIN,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_duplicate_member_is_rejected(self):
        self.auth(self.owner)

        response = self.client.post(
            self.members_url(),
            {
                "user_id": self.member.id,
                "role": StoreMembership.Role.ADMIN,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_normal_user_cannot_access_owner_members(self):
        self.auth(self.normal_user)

        response = self.client.get(self.members_url())

        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_user_gets_401(self):
        response = self.client.get(self.members_url())

        self.assertEqual(response.status_code, 401)

    def test_owner_can_access_members_of_other_store(self):
        other_membership = StoreMembership.objects.create(
            store=self.other_store,
            user=self.member,
            role=StoreMembership.Role.EDITOR,
        )

        self.auth(self.owner)

        response = self.client.get(
            self.member_url(other_membership)
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], other_membership.id)

    def test_owner_can_manage_members_of_inactive_store(self):
        inactive_membership = StoreMembership.objects.create(
            store=self.inactive_store,
            user=self.member,
            role=StoreMembership.Role.EDITOR,
        )

        self.auth(self.owner)

        response = self.client.get(
            self.members_url(self.inactive_store)
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

        response = self.client.patch(
            self.member_url(inactive_membership),
            {"role": StoreMembership.Role.ADMIN},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
