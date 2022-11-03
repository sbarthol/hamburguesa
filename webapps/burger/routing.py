# from https://channels.readthedocs.io/en/latest/tutorial/part_2.html
# chat/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/(?P<room_name>\w+)/$", consumers.GameConsumer.as_asgi()),
]
