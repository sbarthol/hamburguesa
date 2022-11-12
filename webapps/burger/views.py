from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse
import uuid

from burger.forms import CreateForm
from burger.models import Score

from django.utils import timezone

uuids = []

def register_player(request):
  if len(uuids) == 2:
    return HttpResponse("there are already two players registered", status = 400)
  new_uuid = str(uuid.uuid4())
  uuids.append(new_uuid)
  return render(request, 'game.html', {"uuid": new_uuid})

def index(request):
  return render(request, "index.html")

def room(request, room_name):
  # if len(uuids) == 2:
  #   return HttpResponse("there are already two players registered", status = 400)
  new_uuid = str(uuid.uuid4())
  uuids.append(new_uuid)
  return render(request, 'game.html', {"uuid": new_uuid, "room_name": room_name})
  # return render(request, "room.html", {"room_name": room_name})

# TODO: add security measures.
def submit_score(request):
    if request.method == 'GET':
        c = CreateForm()
        context = { 'form': c, 'items': Score.objects.all() }
        return render(request, 'scoreboard.html', context)

    entry = Score(ip_addr=request.META['REMOTE_ADDR'])

    entry.created_by=request.user
    entry.creation_time=timezone.now()
    entry.updated_by=request.user
    entry.update_time=timezone.now()

    create_form = CreateForm(request.POST, instance=entry)
    if not create_form.is_valid():
        context = { 'form': create_form }
        return render(request, 'scoreboard.html', context)

    create_form.save()
    
    context = { 'form': CreateForm(), 'items': Score.objects.all() }
    return render(request, 'scoreboard.html', context)