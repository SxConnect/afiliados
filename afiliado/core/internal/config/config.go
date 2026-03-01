package config

import (
	"os"
)

type Config struct {
	VPSEndpoint        string
	PublicKey          string
	Environment        string
	PastoriniAPIKey    string
	PastoriniInstanceID string
}

func Load() *Config {
	return &Config{
		VPSEndpoint:        getEnv("VPS_ENDPOINT", "https://api.afiliado.com"),
		PublicKey:          getEnv("PUBLIC_KEY", ""),
		Environment:        getEnv("ENVIRONMENT", "production"),
		PastoriniAPIKey:    getEnv("PASTORINI_API_KEY", ""),
		PastoriniInstanceID: getEnv("PASTORINI_INSTANCE_ID", "afiliado-validation"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
