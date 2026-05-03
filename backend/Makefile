PROJECT_NAME := task-board

ps:
	docker compose --project-name $(PROJECT_NAME) ps

up:
	docker compose --project-name $(PROJECT_NAME) down --remove-orphans
	docker compose --project-name $(PROJECT_NAME) up --build -d
	sleep 3
	docker compose --project-name $(PROJECT_NAME) logs -f