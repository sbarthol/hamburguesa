from django.shortcuts import render
import uuid
import json
from burger.forms import GameForm
from burger.game import Game
from django.shortcuts import render

room_name2uuids = {}
uuid2websocket = {}
uuid2room_name = {}
uuid2username = {}
room_name2game = {}


def index(request):
  if request.method == 'POST':
    form = GameForm(request.POST)
    if form.is_valid():
      username = form.cleaned_data.get("username")
      room_name = form.cleaned_data.get("room")

      new_uuid = str(uuid.uuid4())
      uuid2room_name[new_uuid] = room_name

      print(f'room_name2uuids = {room_name2uuids}')
      print(f'uuid2room_name = {uuid2room_name}')

      return render(request, 'game.html', {"uuid": new_uuid, "room_name": room_name, "username": username})
    else:
      return render(request, "index.html", {"form": form})
  else:
    return render(request, "index.html", {"form": GameForm()})


async def player_pick_ingredient(ingredient_id, room_name, uuid):
  print(f'player_pick_ingredient({ingredient_id, room_name, uuid})')
  await room_name2game[room_name].pick_ingredient(uuid, ingredient_id)


def get_other_uuid(room_name, uuid):
  assert (len(room_name2uuids[room_name]) == 2)
  if (room_name2uuids[room_name][0] == uuid):
    return room_name2uuids[room_name][1]
  else:
    return room_name2uuids[room_name][0]


async def disconnect(room_name):
  for uuid in room_name2uuids[room_name]:
    ws = uuid2websocket[uuid]
    await ws.close()
  room_name2uuids[room_name] = []


async def register_websocket(uuid, username, ws):
  print(f'register_websocket({uuid})')
  uuid2websocket[uuid] = ws
  uuid2username[uuid] = username
  room_name = uuid2room_name[uuid]
  if (room_name in room_name2uuids and len(room_name2uuids[room_name]) == 2):
    for old_uuid in room_name2uuids[room_name]:
      ws = uuid2websocket[old_uuid]
      await ws.close()
    room_name2uuids[room_name] = [uuid]
    room_name2game[room_name] = Game()
  elif (room_name in room_name2uuids and len(room_name2uuids[room_name]) == 1):
    other_uuid = room_name2uuids[room_name][0]
    assert (other_uuid in uuid2websocket)
    other_ws = uuid2websocket[other_uuid]
    await other_ws.send(text_data=json.dumps({"message_type": "start_game"}))

    room_name2uuids[room_name].append(uuid)
    await ws.send(text_data=json.dumps({"message_type": "start_game"}))
    await room_name2game[room_name].start_game([uuid, other_uuid])
  else:
    room_name2uuids[room_name] = [uuid]
    room_name2game[room_name] = Game()
