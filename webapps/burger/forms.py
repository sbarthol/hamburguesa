from django import forms
import burger.ws as websocket

class GameForm(forms.Form):
    room = forms.CharField(max_length=256)
    username = forms.CharField(max_length=256)

    def clean_room(self):
        room = self.cleaned_data.get('room')
        encoded_room_name = websocket.base64_encode(room.encode("utf-8")).decode("ascii")
        if len(encoded_room_name) > 100:
            raise forms.ValidationError("Room name is too long.")

        return room

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if len(username) > 64:
            raise forms.ValidationError("Username is too long.")
        return username
