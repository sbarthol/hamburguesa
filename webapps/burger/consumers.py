# from https://channels.readthedocs.io/en/latest/tutorial/part_2.html
# consumers.py
import json

from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync


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
        text_data_json = json.loads(text_data)
        ingredientId = text_data_json["ingredientId"]
        # print(f'user {self.channel_name} send {pos}')

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "game_message", "ingredientId": ingredientId, "from": self.channel_name}
        )

    # Receive message from room group
    def game_message(self, event):
        ingredientId = event["ingredientId"]
        from_name = event["from"]
        # print(f'socket {self.channel_name} receive {ingredientId} from {from_name}')


        # Send message to WebSocket
        if from_name != self.channel_name:
            # print(f'send {ingredientId} to user {self.channel_name} ')
            self.send(text_data=json.dumps({"ingredientId": ingredientId}))