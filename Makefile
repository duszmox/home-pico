release:
	docker build -t pico-frontend:latest .
	docker build -t pico-caddy -f Dockerfile.caddy --build-arg CADDYFILE=./Caddyfile .
	docker compose up -d 