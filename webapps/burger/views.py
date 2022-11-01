from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse
import uuid

uuids = []

def json_error(message, status=400):
    # You can create your JSON by constructing the string representation yourself (or just use json.dumps)
    response_json = '{ "error": "' + message + '" }'
    return HttpResponse(response_json, content_type='application/json', status=status)

def register_player(request):
  if len(uuids) == 2:
    return HttpResponse("there are already two players registered", status = 400)
  new_uuid = str(uuid.uuid4())
  uuids.append(new_uuid)
  return render(request, 'base.html', {"uuid": new_uuid})

def new_game(request):
  del uuids[:]
  return redirect(reverse('register-player'))

def add_ingredient(request):
  if not 'uuid' in request.POST:
        return json_error("uuid field missing in POST")
  if not 'ingredient' in request.POST:
        return json_error("ingredient field missing in POST")
  uuid = request.POST['uuid']
  ingredient = request.POST['ingredient']
  if uuid == uuids[0]:
    print("player A adds " + ingredient)
    return HttpResponse()
  elif uuid == uuids[1]:
    print("player B adds" + ingredient)
    return HttpResponse()
  else:
    return json_error("uuid not recognized")