from django.urls import path

from .views import upload_warga_media, warga_collection

urlpatterns = [
    path('warga/upload-media/', upload_warga_media),
    path('warga/', warga_collection),
]
