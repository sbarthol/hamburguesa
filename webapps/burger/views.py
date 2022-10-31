from django.shortcuts import render

# Create your views here.
def foo(request):
  return render(request, 'base.html', {})