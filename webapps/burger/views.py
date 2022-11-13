from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse
import uuid
import json
from burger.forms import CreateForm
from burger.models import Score
from django.utils import timezone
import asyncio
from random import randrange

room_name2uuids = {}
uuid2websocket = {}
uuid2room_name = {}
room_name2game = {}

non_bun_ingredients = ["mayo", "lettuce", "ketchup", "steak", "onion", "cheese"]
all_ingredients = non_bun_ingredients + ["bun"]
recipe_size = 1


class Game:
    # picked_ingredients[uuid][ingredient_id] -> boolean
    picked_ingredients = {}
    current_progress = {}  # current_progress[uuid] -> int
    ingredient_id2ingredient = {}
    recipe = []
    next_ingredient_id = 1
    uuids = []
    is_game_over = False

    def get_other_uuid(self, uuid):
      if (self.uuids[0] == uuid):
        return self.uuids[1]
      else:
        return self.uuids[0]

    async def send_next_ingredient_to_player(self):
      ingredient_id = self.next_ingredient_id
      self.next_ingredient_id = self.next_ingredient_id + 1
      ingredient_name = all_ingredients[randrange(len(all_ingredients))]
      self.ingredient_id2ingredient[ingredient_id] = ingredient_name
      for uuid in self.uuids:
        ws = uuid2websocket[uuid]
        await ws.send(text_data=json.dumps({"message_type": "next_ingredient",
                                            "ingredient_id": ingredient_id, "ingredient_name": ingredient_name}))

    async def send_next_layer_to_player(self, uuid):
      ingredient_name = self.recipe[self.current_progress[uuid]]
      ws = uuid2websocket[uuid]
      await ws.send(text_data=json.dumps(
          {"message_type": "next_layer", "ingredient_name": ingredient_name}))

    async def send_next_ingredient_loop(self):
      while (not self.is_game_over):
        await self.send_next_ingredient_to_player()
        await asyncio.sleep(1.5)

    async def start_game(self, uuids):
      self.uuids = uuids
      self.picked_ingredients = {uuids[0]: {}, uuids[1]: {}}
      self.recipe = ["bun"]
      for _ in range(recipe_size):
        self.recipe.append(non_bun_ingredients[randrange(len(non_bun_ingredients))])
      self.recipe.append("bun")
      self.current_progress = {uuids[0]: 0, uuids[1]: 0}
      await self.send_next_layer_to_player(uuids[0])
      await self.send_next_layer_to_player(uuids[1])
      loop = asyncio.get_event_loop()
      loop.create_task(self.send_next_ingredient_loop())

    async def game_over(self, winner_uuid):
      winner_ws = uuid2websocket[winner_uuid]
      await winner_ws.send(text_data=json.dumps({"message_type": "game_over_win"}))
      loser_uuid = self.get_other_uuid(winner_uuid)
      loser_ws = uuid2websocket[loser_uuid]
      await loser_ws.send(text_data=json.dumps({"message_type": "game_over_lose"}))
      self.is_game_over = True
      # Todo: write score to database

    async def pick_ingredient(self, uuid, ingredient_id):
      if (not self.ingredient_is_picked(ingredient_id)):
        self.picked_ingredients[uuid][ingredient_id] = True
        if (self.recipe[self.current_progress[uuid]] == self.ingredient_id2ingredient[ingredient_id]):
          self.current_progress[uuid] = self.current_progress[uuid] + 1
          if (self.current_progress[uuid] == len(self.recipe)):
            await self.game_over(uuid)
          else:
            await self.send_next_layer_to_player(uuid)

    def ingredient_is_picked(self, ingredient_id):
      return ingredient_id in self.picked_ingredients[self.uuids[0]] or ingredient_id in self.picked_ingredients[self.uuids[1]]


def index(request):
  return render(request, "index.html")


def room(request, room_name):
  new_uuid = str(uuid.uuid4())
  uuid2room_name[new_uuid] = room_name

  print(f'room_name2uuids = {room_name2uuids}')
  print(f'uuid2room_name = {uuid2room_name}')

  return render(request, 'game.html', {"uuid": new_uuid, "room_name": room_name})


# maintain websocket channel names
# communicate via websockets, not requests
# call methods from consumer.py
async def player_pick_ingredient(ingredient_id, room_name, uuid):
  print(f'player_pick_ingredient({ingredient_id, room_name, uuid})')
  await room_name2game[room_name].pick_ingredient(uuid, ingredient_id)
  other_uuid = get_other_uuid(room_name, uuid)
  ws = uuid2websocket[other_uuid]
  await ws.send(text_data=json.dumps(
      {"message_type": "pick_ingredient", "ingredient_id": ingredient_id}))


def get_other_uuid(room_name, uuid):
  assert (len(room_name2uuids[room_name]) == 2)
  if (room_name2uuids[room_name][0] == uuid):
    return room_name2uuids[room_name][1]
  else:
    return room_name2uuids[room_name][0]


async def register_websocket(uuid, ws):
  print(f'register_websocket({uuid})')
  uuid2websocket[uuid] = ws
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

# TODO: add security measures.
# yes, the server will maintain the game logic
# and will know which player won
# instead of exposing a route to the clieint, the server
# will simply update the DB at the end of the game


def submit_score(request):
    if request.method == 'GET':
        c = CreateForm()
        context = {'form': c, 'items': Score.objects.all()}
        return render(request, 'scoreboard.html', context)

    entry = Score(ip_addr=request.META['REMOTE_ADDR'])

    entry.created_by = request.user
    entry.creation_time = timezone.now()
    entry.updated_by = request.user
    entry.update_time = timezone.now()

    create_form = CreateForm(request.POST, instance=entry)
    if not create_form.is_valid():
        context = {'form': create_form}
        return render(request, 'scoreboard.html', context)

    create_form.save()

    context = {'form': CreateForm(), 'items': Score.objects.all()}
    return render(request, 'scoreboard.html', context)

