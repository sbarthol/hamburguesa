from django.shortcuts import render
import uuid
from burger.models import Score
from burger.forms import GameForm

import burger.ws as websocket
from django.shortcuts import render
from django.db.models import Count, Max


def index(request):
  if request.method == 'POST':
    form = GameForm(request.POST)
    if form.is_valid():
      username = form.cleaned_data.get("username")
      room_name = form.cleaned_data.get("room")

      new_uuid = str(uuid.uuid4())
      websocket.uuid2room_name[new_uuid] = room_name

      print(f'room_name2uuids = {websocket.room_name2uuids}')
      print(f'uuid2room_name = {websocket.uuid2room_name}')

      return render(request, 'game.html', {"uuid": new_uuid, "room_name": room_name, "username": username})
    else:
      return render(request, "index.html", {"form": form})
  else:
    return render(request, "index.html", {"form": GameForm()})


def scoreboard(request):
  best_scores = Score.objects.order_by("duration_millis")[:5]
  recent_scores = Score.objects.order_by("-start_time")[:5]
  savvy_players = Score.objects.values("winner_name").annotate(
      wins=Count('winner_name')).order_by('-wins')[:3]
  for player in savvy_players:
    most_recent = Score.objects.filter(winner_name=player["winner_name"]).aggregate(
        most_recent=Max("start_time"))["most_recent"]
    player["most_recent"] = most_recent
  context = {"best_scores": best_scores,
             "recent_scores": recent_scores, "savvy_players": savvy_players}
  return render(request, 'scoreboard.html', context)


def rules(request):
  return render(request, 'rules.html', {})
