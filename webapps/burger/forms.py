from django import forms
import string
allowed = set(string.ascii_lowercase + string.ascii_uppercase + string.digits + '_')

def string_is_valid(s):
    return set(s) <= allowed

def string_is_short(s):
    return len(s) <= 64

class GameForm(forms.Form):
    room = forms.CharField(max_length = 256)
    username = forms.CharField(max_length = 256)
    def clean_room(self):
        room = self.cleaned_data.get('room')
        if not string_is_valid(room):
            raise forms.ValidationError("Room name contains invalid characters.")
        if not string_is_short(room):
            raise forms.ValidationError("Room name is too long.")

        return room
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if not string_is_valid(username):
            raise forms.ValidationError("Username contains invalid characters.")
        if not string_is_short(username):
            raise forms.ValidationError("Username is too long.")
        return username
    
