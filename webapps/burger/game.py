import uuid
import json
from burger.models import Score
import asyncio
from random import randrange
import datetime
import time
import burger.ws as websocket
from asgiref.sync import sync_to_async

non_top_bun_ingredients = ["mayo", "lettuce",
                           "ketchup", "steak", "onion", "cheese", "mustard", "pickle", "bacon", "tomato", "bottom_bun"]
all_ingredients = non_top_bun_ingredients + ["top_bun"]
recipe_size = 12
next_ingredient_seconds = 0.4


class Game:
    # picked_ingredients[uuid][ingredient_id] -> boolean
    picked_ingredients = {}
    current_progress = {}  # current_progress[uuid] -> int
    ingredient_id2ingredient = {}
    recipe = []
    uuids = []
    is_game_over = False
    start_time = {}
    start_time_timezone = {}

    def generate_ingredient_id(self):
      return str(uuid.uuid4())

    def get_other_uuid(self, uuid):
      if (self.uuids[0] == uuid):
        return self.uuids[1]
      else:
        return self.uuids[0]

    async def send_next_ingredient_to_player(self):
      ingredient_id = self.generate_ingredient_id()
      ingredient_name = all_ingredients[randrange(len(all_ingredients))]
      if (randrange(25) == 0):
        ingredient_name = "spatula"
      elif (randrange(4) == 0):
        ingredient_name = self.recipe[self.current_progress[self.uuids[randrange(
            2)]]]
      self.ingredient_id2ingredient[ingredient_id] = ingredient_name
      for uuid in self.uuids:
        ws = websocket.uuid2websocket[uuid]
        await ws.send(text_data=json.dumps({"message_type": "next_ingredient",
                                            "ingredient_id": ingredient_id, "ingredient_name": ingredient_name}))

    async def send_next_layer_to_player(self, uuid):
      ingredient_name = self.recipe[self.current_progress[uuid]]
      ws = websocket.uuid2websocket[uuid]
      await ws.send(text_data=json.dumps(
          {"message_type": "next_layer", "ingredient_name": ingredient_name}))

    async def send_next_ingredient_loop(self):
      while (not self.is_game_over):
        await self.send_next_ingredient_to_player()
        await asyncio.sleep(next_ingredient_seconds)

    async def start_game(self, uuids):
      self.start_time_timezone = datetime.datetime.now()
      self.start_time = round(time.time() * 1000)
      self.uuids = uuids
      self.picked_ingredients = {uuids[0]: {}, uuids[1]: {}}
      self.recipe = ["bottom_bun", "steak"]
      for _ in range(recipe_size):
        self.recipe.append(
            non_top_bun_ingredients[randrange(len(non_top_bun_ingredients))])
      self.recipe.append("top_bun")
      self.current_progress = {uuids[0]: 0, uuids[1]: 0}
      await self.send_next_layer_to_player(uuids[0])
      await self.send_next_layer_to_player(uuids[1])
      loop = asyncio.get_event_loop()
      loop.create_task(self.send_next_ingredient_loop())

    async def save_to_db(self, winner_uuid, loser_uuid):
      end_time = round(time.time() * 1000)
      new_item = Score(winner_name=websocket.uuid2username[winner_uuid],
                       loser_name=websocket.uuid2username[loser_uuid],
                       room_name=websocket.uuid2room_name[winner_uuid],
                       duration_millis=end_time - self.start_time,
                       start_time=self.start_time_timezone)
      await sync_to_async(new_item.save)()

    async def game_over(self, winner_uuid):
      winner_ws = websocket.uuid2websocket[winner_uuid]
      await winner_ws.send(text_data=json.dumps({"message_type": "game_over_win"}))
      loser_uuid = self.get_other_uuid(winner_uuid)
      loser_ws = websocket.uuid2websocket[loser_uuid]
      await loser_ws.send(text_data=json.dumps({"message_type": "game_over_lose"}))
      self.is_game_over = True
      await self.save_to_db(winner_uuid, loser_uuid)

    async def pick_ingredient(self, uuid, ingredient_id):
      if (not self.ingredient_is_picked(ingredient_id)):
        self.picked_ingredients[uuid][ingredient_id] = True

        ws = websocket.uuid2websocket[uuid]
        await ws.send(text_data=json.dumps({"message_type": "pick_ingredient_you", "ingredient_id": ingredient_id}))

        other_uuid = self.get_other_uuid(uuid)
        other_ws = websocket.uuid2websocket[other_uuid]
        await other_ws.send(text_data=json.dumps({"message_type": "pick_ingredient_other", "ingredient_id": ingredient_id}))

        name = self.ingredient_id2ingredient[ingredient_id]
        if (self.recipe[self.current_progress[uuid]] == self.ingredient_id2ingredient[ingredient_id] or name == "spatula"):
          self.current_progress[uuid] = self.current_progress[uuid] + 1
          if (self.current_progress[uuid] == len(self.recipe)):
            await self.game_over(uuid)
          else:
            await self.send_next_layer_to_player(uuid)

    def ingredient_is_picked(self, ingredient_id):
      return ingredient_id in self.picked_ingredients[self.uuids[0]] or ingredient_id in self.picked_ingredients[self.uuids[1]]
