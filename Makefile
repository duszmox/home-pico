release:
	docker build -t pico-frontend:latest .
	docker compose up -d 