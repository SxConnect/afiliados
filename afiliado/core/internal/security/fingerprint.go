package security

import (
	"crypto/sha256"
	"fmt"
	"os"
	"runtime"
)

func GenerateFingerprint() string {
	data := fmt.Sprintf("%s-%s-%s", 
		runtime.GOOS,
		runtime.GOARCH,
		getHostname(),
	)
	
	hash := sha256.Sum256([]byte(data))
	return fmt.Sprintf("%x", hash)
}

func getHostname() string {
	hostname, err := os.Hostname()
	if err != nil {
		return "unknown"
	}
	return hostname
}
