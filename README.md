# Burger (F22 Team 34)

## Build
1. Install [Channels/Daphne](https://channels.readthedocs.io/en/latest/installation.html) and channels_redis:
```
python3 -m pip install -U channels["daphne"]
python3 -m pip install channels_redis
```
2. Install [Docker](https://docs.docker.com/get-docker/)

3. Run
```
docker run -p 6379:6379 -d redis:5
python3 manage.py runserver
```

## Project proposal - October 13 2022

[Doc](https://docs.google.com/document/d/1PWi0D4n9Ewtf7P_U6JnpySDEJVUSHDuBC707slY0qi4/edit?usp=sharing)

## Project specification - November 2 2022

[Doc](https://docs.google.com/document/d/1MV4VEQqHGmwVlGkUqLYgXefBsELdKJruy_gkZG19qq8/edit?usp=sharing)

## Sprint presentation - November 3 2022

The next sprint will focus on
* Implement scoreboard (models, html mockup)
* Updating & wiring the scoreboard 
* Implement simple game mechanism (movement of hands reflecting on both sides for Websocket, ingredient workflow)

Owner: Tianqi Wu (tianqiw2)

[Slides](https://docs.google.com/presentation/d/18yzldj4aZCfyOvOVwXs5LmhDw4C99zRL-DESmb1Dd4w/edit?usp=sharing)

## Sprint presentation - November 15 2022

The next sprint will focus on
* Building out more diverse assets (visual, sounds, etc…)
* Building a visually pleasing scoreboard and splash screen
* Hooking up the scoreboard with our game
* Implement security measures
* More complex game logic (e.g. golden steak acts as wildcard)

Owner: Sacha Bartholme (sbarthol)

[Slides](https://docs.google.com/presentation/d/1jy9ZDymGN-EwAJZe6SN1RIIAMoNEY23YpZ_stpJuZHM/edit?usp=sharing)