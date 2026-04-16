from django.http import JsonResponse
from .models import Warga

def home(request):
    return JsonResponse({
        "message": "Backend BLT berhasil berjalan"
    })

def get_warga(request):
    data = list(Warga.objects.values())
    return JsonResponse(data, safe=False)