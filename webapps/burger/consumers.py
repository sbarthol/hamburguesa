# from https://channels.readthedocs.io/en/latest/tutorial/part_2.html
# consumers.py
import json

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
import burger.ws as websocket


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "game_%s" % self.room_name
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await websocket.disconnect(self.room_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        # Send message to room group
        data = json.loads(text_data)
        data["type"] = "game_message"
        data["from"] = self.channel_name
        await self.channel_layer.group_send(self.room_group_name, data)

    # Receive message from room group
    async def game_message(self, data):
        if data["from"] == self.channel_name:
            print(f'game_message({data})')
            message_type = data["message_type"]
            if (message_type == "register"):
                await websocket.register_websocket(data["uuid"], data["username"], self)
            elif (message_type == "pick_ingredient"):
                await websocket.player_pick_ingredient(
                    data["ingredient_id"], self.room_name, data["uuid"])
