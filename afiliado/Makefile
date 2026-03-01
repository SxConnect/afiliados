.PHONY: help install dev build start stop clean test lint docker-build docker-up docker-down

# Cores para output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)

help: ## Mostra esta ajuda
	@echo ''
	@echo 'Uso:'
	@echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  ${YELLOW}%-15s${GREEN}%s${RESET}\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Instala todas as dependências
	@echo "${GREEN}Instalando dependências do Core...${RESET}"
	npm install
	@echo "${GREEN}Instalando dependências da VPS...${RESET}"
	cd vps && npm install
	@echo "${GREEN}Instalando dependências da UI...${RESET}"
	cd ui && npm install
	@echo "${GREEN}✓ Todas as dependências instaladas!${RESET}"

dev: ## Inicia em modo desenvolvimento
	@echo "${GREEN}Iniciando em modo desenvolvimento...${RESET}"
	npm run dev

dev-ui: ## Inicia apenas a UI em desenvolvimento
	@echo "${GREEN}Iniciando UI...${RESET}"
	cd ui && npm run dev

dev-vps: ## Inicia apenas a VPS
	@echo "${GREEN}Iniciando VPS...${RESET}"
	cd vps && npm start

build: ## Build da aplicação
	@echo "${GREEN}Building aplicação...${RESET}"
	cd ui && npm run build
	@echo "${GREEN}✓ Build concluído!${RESET}"

build-electron: ## Build do Electron
	@echo "${GREEN}Building Electron...${RESET}"
	cd ui && npm run build:electron
	@echo "${GREEN}✓ Electron build concluído!${RESET}"

start: ## Inicia em produção
	@echo "${GREEN}Iniciando em produção...${RESET}"
	npm start

stop: ## Para todos os processos
	@echo "${YELLOW}Parando processos...${RESET}"
	pkill -f "node src/core/server.js" || true
	pkill -f "node vps/server.js" || true
	@echo "${GREEN}✓ Processos parados!${RESET}"

clean: ## Limpa arquivos temporários
	@echo "${YELLOW}Limpando arquivos temporários...${RESET}"
	rm -rf node_modules
	rm -rf vps/node_modules
	rm -rf ui/node_modules
	rm -rf ui/dist
	rm -rf ui/dist-electron
	@echo "${GREEN}✓ Limpeza concluída!${RESET}"

test: ## Executa testes
	@echo "${GREEN}Executando testes...${RESET}"
	npm test

lint: ## Executa linter
	@echo "${GREEN}Executando linter...${RESET}"
	cd ui && npm run lint

docker-build: ## Build das imagens Docker
	@echo "${GREEN}Building imagens Docker...${RESET}"
	docker-compose build
	@echo "${GREEN}✓ Imagens criadas!${RESET}"

docker-up: ## Inicia containers Docker
	@echo "${GREEN}Iniciando containers...${RESET}"
	docker-compose up -d
	@echo "${GREEN}✓ Containers iniciados!${RESET}"

docker-down: ## Para containers Docker
	@echo "${YELLOW}Parando containers...${RESET}"
	docker-compose down
	@echo "${GREEN}✓ Containers parados!${RESET}"

docker-logs: ## Mostra logs dos containers
	docker-compose logs -f

docker-clean: ## Remove containers e volumes
	@echo "${YELLOW}Removendo containers e volumes...${RESET}"
	docker-compose down -v
	@echo "${GREEN}✓ Limpeza Docker concluída!${RESET}"

setup: install ## Setup completo do projeto
	@echo "${GREEN}Setup completo realizado!${RESET}"
	@echo "${YELLOW}Próximos passos:${RESET}"
	@echo "  1. Configure o arquivo .env"
	@echo "  2. Execute: make dev"
	@echo "  3. Acesse: http://localhost:5173"
