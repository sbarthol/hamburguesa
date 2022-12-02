from django import forms


class GameForm(forms.Form):
    room = forms.CharField(max_length = 256)
    name = forms.CharField(max_length = 256)
    
