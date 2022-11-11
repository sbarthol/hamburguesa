from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse
import uuid

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