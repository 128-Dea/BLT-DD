from django.urls import path
from .views import get_warga

urlpatterns = [
    path('warga/', get_warga),
]