from django.urls import path

from .views import warga_collection

urlpatterns = [
    path('warga/', warga_collection),
]
