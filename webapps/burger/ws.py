import json
from burger.game import Game
import base64
from urllib.parse import unquote

room_name2uuids = {}
uuid2websocket = {}
uuid2room_name = {}
uuid2username = {}
room_name2game = {}

def base64_encode(bytes):
    """
    Removes any `=` used as padding from the encoded string.
    """
    encoded = base64.urlsafe_b64encode(bytes)
    return encoded.rstrip(b"=")


def base64_decode(bytes):
    """
    Adds back in the required padding before decoding.
    """
    padding = 4 - (len(bytes) % 4)
    bytes = bytes + (b"=" * padding)
    return base64.urlsafe_b64decode(bytes)

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
    del uuid2room_name[uuid]
    del uuid2username[uuid]
    del uuid2websocket[uuid]
  del room_name2game[room_name]
  del room_name2uuids[room_name]


async def register_websocket(uuid, username, ws):
  print(f'register_websocket({uuid})')
  uuid2websocket[uuid] = ws
  uuid2username[uuid] = unquote(username)
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

  print(f'room_name2uuids = {room_name2uuids}')
  print(f'uuid2room_name = {uuid2room_name}')
