# from https://channels.readthedocs.io/en/latest/tutorial/part_2.html
# consumers.py
import json

from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from burger import views


class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "game_%s" % self.room_name

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        # Send message to room group
        data = json.loads(text_data)
        data["type"] = "game_message"
        data["from"] = self.channel_name
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, data
        )

    # Receive message from room group
    def game_message(self, data):
        if data["from"] == self.channel_name:
            print(f'game_message({data})')
            message_type = data["message_type"]
            if(message_type == "register"):
                views.register_websocket(data["uuid"], self)
            elif(message_type == "pick_ingredient"):
                views.player_pick_ingredient(data["ingredient_id"], self.room_name, data["uuid"])
                
        