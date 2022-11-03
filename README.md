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