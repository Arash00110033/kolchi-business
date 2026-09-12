from django.test import TestCase
from rest_framework.test import APIClient

from apps.users.models import User

from .models import Store, StoreMembership


class AdminMembershipAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.owner = User.objects.create_user(
            username="membership-owner",
            email="membership-owner@test.local",
            password="StrongPass123!",
        )

        self.admin = User.objects.create_user(
            username="membership-admin",
            email="membership-admin@test.local",
            password="StrongPass123!",
        )

        self.editor = User.objects.create_user(
            username="membership-editor",
            email="membership-editor@test.local",
            password="StrongPass123!",
        )

        self.member = User.objects.create_user(
            username="membership-member",
            email="membership-member@test.local",
            password="StrongPass123!",
        )

        self.other_owner = User.objects.create_user(
            username="membership-other-owner",
            email="membership-other-owner@test.local",
            password="StrongPass123!",
        )

        self.store = Store.objects.create(
            owner=self.owner,
            name="Membership Store",
            slug="membership-store",
        )

        self.other_store = Store.objects.create(
            owner=self.other_owner,
            name="Other Membership Store",
            slug="other-membership-store",
        )

        StoreMembership.objects.create(
            store=self.store,
            user=self.admin,
            role=StoreMembership.Role.ADMIN,
        )

        StoreMembership.objects.create(
            store=self.store,
            user=self.editor,
            role=StoreMembership.Role.EDITOR,
        )

        self.existing_membership = StoreMembership.objects.create(
            store=self.store,
            user=self.member,
            role=StoreMembership.Role.EDITOR,
        )

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def members_url(self, store=None):
        store = store or self.store
        return f"/api/v1/admin/stores/{store.id}/members/"

    def member_url(self, membership):
        return f"/api/v1/admin/stores/{membership.store_id}/members/{membership.id}/"

    def test_owner_can_list_members(self):
        self.auth(self.owner)

        response = self.client.get(self.members_url())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 3)

    def test_admin_can_list_members(self):
        self.auth(self.admin)

        response = self.client.get(self.members_url())

        self.assertEqual(response.status_code, 200)

    def test_editor_cannot_manage_members(self):
        self.auth(self.editor)

        response = self.client.get(self.members_url())

        self.assertEqual(response.status_code, 403)

    def test_owner_can_add_member(self):
        new_user = User.objects.create_user(
            username="new-member",
            email="new-member@test.local",
            password="StrongPass123!",
        )

        self.auth(self.owner)

        response = self.client.post(
            self.members_url(),
            {
                "user_id": new_user.id,
                "role": StoreMembership.Role.EDITOR,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            StoreMembership.objects.filter(
                store=self.store,
                user=new_user,
                role=StoreMembership.Role.EDITOR,
            ).exists()
        )

    def test_admin_can_add_member(self):
        new_user = User.objects.create_user(
            username="admin-added-member",
            email="admin-added-member@test.local",
            password="StrongPass123!",
        )

        self.auth(self.admin)

        response = self.client.post(
            self.members_url(),
            {
                "user_id": new_user.id,
                "role": StoreMembership.Role.ADMIN,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

    def test_owner_cannot_be_added_as_member(self):
        self.auth(self.admin)

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

    def test_owner_can_change_member_role(self):
        self.auth(self.owner)

        response = self.client.patch(
            self.member_url(self.existing_membership),
            {"role": StoreMembership.Role.ADMIN},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.existing_membership.refresh_from_db()
        self.assertEqual(
            self.existing_membership.role,
            StoreMembership.Role.ADMIN,
        )

    def test_owner_can_remove_member(self):
        self.auth(self.owner)

        response = self.client.delete(
            self.member_url(self.existing_membership)
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            StoreMembership.objects.filter(
                id=self.existing_membership.id
            ).exists()
        )

    def test_cross_store_member_access_is_denied(self):
        other_membership = StoreMembership.objects.create(
            store=self.other_store,
            user=self.member,
            role=StoreMembership.Role.EDITOR,
        )

        self.auth(self.owner)

        response = self.client.get(
            self.member_url(other_membership)
        )

        self.assertEqual(response.status_code, 403)

    def test_anonymous_user_is_rejected(self):
        response = self.client.get(self.members_url())

        self.assertEqual(response.status_code, 401)

