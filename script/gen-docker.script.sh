docker network create --driver bridge chat-network
docker compose -f docker-compose-redis.yml up -d
docker compose -f docker-compose-mongo.yml up -d