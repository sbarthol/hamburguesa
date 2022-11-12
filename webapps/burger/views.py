from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse
import uuid

room2uuids = {} # room name -> uuid list

def index(request):
  return render(request, "index.html")

def room(request, room_name):

  # if more than two players join
  # last two will be considered
  new_uuid = str(uuid.uuid4())
  if (not room_name in room2uuids):
    room2uuids[room_name] = [new_uuid]
  elif(len(room2uuids[room_name]) == 1):
    room2uuids[room_name].append(new_uuid)
  else:
    room2uuids[room_name] = room2uuids[room_name][1:]
    room2uuids[room_name].append(new_uuid)

  print(f'uuids = {room2uuids}')

  return render(request, 'game.html', {"uuid": new_uuid, "room_name": room_name})
