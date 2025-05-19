# Makefile for model-service

run-model:
	uvicorn app:app --reload --port 8000

run-model-docker:
	docker compose up --build

run-model-docker-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build