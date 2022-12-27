from django import forms

def string_is_short(s):
    return len(s) <= 64

class GameForm(forms.Form):
    room = forms.CharField(max_length=256)
    username = forms.CharField(max_length=256)

    def clean_room(self):
        room = self.cleaned_data.get('room')
        if not string_is_short(room):
            raise forms.ValidationError("Room name is too long.")

        return room

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if not string_is_short(username):
            raise forms.ValidationError("Username is too long.")
        return username
