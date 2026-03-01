.PHONY: help install build run clean test

help:
	@echo "Comandos disponíveis:"
	@echo "  make install    - Instalar dependências"
	@echo "  make build      - Build de todos os componentes"
	@echo "  make run        - Executar em modo desenvolvimento"
	@echo "  make clean      - Limpar builds"
	@echo "  make test       - Executar testes"

install:
	@echo "Instalando dependências..."
	cd vps && npm install
	cd ui && npm install
	cd core && go mod download

build:
	@echo "Building Core..."
	cd core && go build -ldflags="-s -w" -o afiliado-core.exe main.go
	@echo "Building UI..."
	cd ui && npm run build

run:
	@echo "Iniciando VPS..."
	cd vps && npm start &
	@echo "Iniciando Core..."
	cd core && go run main.go &
	@echo "Iniciando UI..."
	cd ui && npm run electron:dev

clean:
	@echo "Limpando builds..."
	rm -rf core/afiliado-core.exe
	rm -rf ui/dist
	rm -rf ui/build

test:
	@echo "Executando testes..."
	cd core && go test ./...
	cd ui && npm test
