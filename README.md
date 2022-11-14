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

## Sprint presentation - November 15 2022

The next sprint will focus on
* Building out more diverse assets (visual, sounds, etc…)
* Building a visually pleasing scoreboard and splash screen
* Hooking up the scoreboard with our game
* Implement security measures
* More complex game logic (e.g. golden steak acts as wildcard)

Owner: Sacha Bartholme (sbarthol)

[Slides](https://docs.google.com/presentation/d/1jy9ZDymGN-EwAJZe6SN1RIIAMoNEY23YpZ_stpJuZHM/edit?usp=sharing)