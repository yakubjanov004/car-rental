from rest_framework.permissions import BasePermission


class IsOwnerOrAdmin(BasePermission):
    """
    Foydalanuvchi faqat o'z ob'ektlarini ko'ra oladi.
    Admin barcha ob'ektlarni ko'ra oladi.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.user == request.user


class IsAdminOrReadOnly(BasePermission):
    """
    Admin yozish huquqiga ega, boshqalar faqat o'qiy oladi.
    """
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user and request.user.is_staff
