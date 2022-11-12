from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse
import uuid
import json

room_name2uuids = {} # room name -> uuid list
uuid2websocket = {}
uuid2room_name = {}

def index(request):
  return render(request, "index.html")

def room(request, room_name):

  # if more than two players join
  # last two will be considered
  new_uuid = str(uuid.uuid4())
  if (not room_name in room_name2uuids):
    room_name2uuids[room_name] = [new_uuid]
  elif(len(room_name2uuids[room_name]) == 1):
    room_name2uuids[room_name].append(new_uuid)
  else:
    room_name2uuids[room_name] = room_name2uuids[room_name][1:]
    room_name2uuids[room_name].append(new_uuid)

  uuid2room_name[new_uuid] = room_name

  print(f'room_name2uuids = {room_name2uuids}')
  print(f'uuid2room_name = {uuid2room_name}')

  return render(request, 'game.html', {"uuid": new_uuid, "room_name": room_name})


# maintain websocket channel names
# communicate via websockets, not requests
# call methods from consumer.py
def user_pick_ingredient(ingredient_id, room_name, uuid):
  print(f'user_pick_ingredient({ingredient_id, room_name, uuid})')
  other_uuid = get_other_uuid(room_name, uuid)
  ws = uuid2websocket[other_uuid]
  ws.send(text_data=json.dumps({"message_type": "pick_ingredient", "ingredient_id": ingredient_id}))


def get_other_uuid(room_name, uuid):
  assert(len(room_name2uuids[room_name]) == 2)
  if(room_name2uuids[room_name][0] == uuid):
    return room_name2uuids[room_name][1]
  else:
    return room_name2uuids[room_name][0]

def register_websocket(uuid, ws):
  print(f'register_websocket({uuid})')
  uuid2websocket[uuid] = ws
  room_name = uuid2room_name[uuid]
  if(len(room_name2uuids[room_name]) == 2):
    other_uuid = get_other_uuid(room_name, uuid)
    if(other_uuid in uuid2websocket):
      ws1 = uuid2websocket[other_uuid]
      ws1.send(text_data=json.dumps({"message_type": "start_game"}))
      ws2 = uuid2websocket[uuid]
      ws2.send(text_data=json.dumps({"message_type": "start_game"}))

def send_next_ingredient(ingredient_id, room_name, uuid):
  print(f'add_ingredient({ingredient_id, room_name, uuid})')

def start_game(room_name):
  print(f'start_game({room_name})')

def finish_game(room_name):
  print(f'start_game({room_name})')
