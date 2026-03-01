package main

import (
	"afiliado-core/internal/api"
	"afiliado-core/internal/config"
	"afiliado-core/internal/security"
	"afiliado-core/internal/vps"
	"fmt"
	"log"
	"net"
)

func main() {
	// Inicializar configuração
	cfg := config.Load()
	
	// Inicializar segurança
	if cfg.PublicKey != "" {
		security.Initialize(cfg.PublicKey)
	} else {
		log.Println("AVISO: Chave pública não configurada. Assinatura desabilitada.")
	}
	
	// Inicializar cliente VPS com API Key da Pastorini
	vpsClient := vps.NewClient(cfg.VPSEndpoint, cfg.PastoriniAPIKey)
	
	// Encontrar porta dinâmica disponível
	port := findAvailablePort()
	
	// Inicializar servidor API
	server := api.NewServer(vpsClient, cfg)
	
	log.Printf("Core Engine iniciado na porta %d", port)
	log.Printf("Pastorini Instance ID: %s", cfg.PastoriniInstanceID)
	
	if err := server.Start(port); err != nil {
		log.Fatalf("Erro ao iniciar servidor: %v", err)
	}
}

func findAvailablePort() int {
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		log.Fatal(err)
	}
	port := listener.Addr().(*net.TCPAddr).Port
	listener.Close()
	return port
}
