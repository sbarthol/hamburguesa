from django import forms
from burger.models import Score


class CreateForm(forms.ModelForm):
    class Meta:
        model = Score
        exclude = (
            'creation_time',
            'ip_addr',
        )
