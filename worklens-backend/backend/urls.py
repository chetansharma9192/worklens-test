from django.contrib import admin
from django.urls import path
from api.views import receive_code

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/receive-code/', receive_code, name='receive_code'),
]