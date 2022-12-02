from django import forms

def string_is_valid(s):
    return s.isalnum()

class GameForm(forms.Form):
    room = forms.CharField(max_length = 256)
    username = forms.CharField(max_length = 256)
    def clean_room(self):
        room = self.cleaned_data.get('room')
        if not string_is_valid(room):
            raise forms.ValidationError("Room name contains invalid characters.")

        return room
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if not string_is_valid(username):
            raise forms.ValidationError("Username contains invalid characters.")
        return username
    
