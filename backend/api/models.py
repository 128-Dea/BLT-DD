from django.db import models

class Warga(models.Model):
    nik = models.CharField(max_length=20)
    nama = models.CharField(max_length=100)
    alamat = models.TextField()
    jumlah_anggota = models.IntegerField()
    jumlah_tanggungan = models.IntegerField()
    pendapatan = models.CharField(max_length=50)
    pekerjaan = models.CharField(max_length=100)
    status = models.CharField(max_length=20)

    def __str__(self):
        return self.nama