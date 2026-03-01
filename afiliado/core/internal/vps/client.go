package vps

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Client struct {
	endpoint string
	apiKey   string
	client   *http.Client
}

// Estruturas para integração com Pastorini API
type PastoriniCheckNumberRequest struct {
	Phone string `json:"phone"`
}

type PastoriniCheckNumberResponse struct {
	Exists bool   `json:"exists"`
	JID    string `json:"jid"`
}

type ValidationRequest struct {
	Phone       string `json:"phone"`
	Fingerprint string `json:"fingerprint"`
}

type ValidationResponse struct {
	Valid         bool              `json:"valid"`
	User          User              `json:"user"`
	Token         SessionToken      `json:"token"`
	Plugins       []Plugin          `json:"plugins"`
}

type User struct {
	ID            string   `json:"id"`
	Phone         string   `json:"phone"`
	Plan          string   `json:"plan"`
	QuotaUsed     int      `json:"quotaUsed"`
	QuotaLimit    int      `json:"quotaLimit"`
	ActivePlugins []string `json:"activePlugins"`
	Fingerprint   string   `json:"fingerprint"`
}

type SessionToken struct {
	Token     string `json:"token"`
	ExpiresAt int64  `json:"expiresAt"`
	Signature string `json:"signature"`
}

type Plugin struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Version      string `json:"version"`
	Enabled      bool   `json:"enabled"`
	RequiresPlan string `json:"requiresPlan"`
}

func NewClient(endpoint, apiKey string) *Client {
	return &Client{
		endpoint: endpoint,
		apiKey:   apiKey,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// ValidateNumberWithPastorini valida se o número existe no WhatsApp usando Pastorini API
func (c *Client) ValidateNumberWithPastorini(instanceID, phone string) (bool, string, error) {
	url := fmt.Sprintf("%s/api/instances/%s/check-number/%s", c.endpoint, instanceID, phone)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, "", err
	}

	// Adicionar API Key se configurada
	if c.apiKey != "" {
		req.Header.Set("x-api-key", c.apiKey)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return false, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, "", fmt.Errorf("falha ao validar número: %d", resp.StatusCode)
	}

	var result PastoriniCheckNumberResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, "", err
	}

	return result.Exists, result.JID, nil
}

func (c *Client) ValidateUser(phone, fingerprint string) (*ValidationResponse, error) {
	req := ValidationRequest{
		Phone:       phone,
		Fingerprint: fingerprint,
	}

	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequest("POST", 
		fmt.Sprintf("%s/api/v1/validate", c.endpoint),
		bytes.NewBuffer(body),
	)
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		httpReq.Header.Set("x-api-key", c.apiKey)
	}

	resp, err := c.client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("validação falhou: %d", resp.StatusCode)
	}

	var result ValidationResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (c *Client) CheckQuota(userID, token string) (int, int, error) {
	req, err := http.NewRequest("GET", 
		fmt.Sprintf("%s/api/v1/quota/%s", c.endpoint, userID), 
		nil,
	)
	if err != nil {
		return 0, 0, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	if c.apiKey != "" {
		req.Header.Set("x-api-key", c.apiKey)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return 0, 0, err
	}
	defer resp.Body.Close()

	var result struct {
		Used  int `json:"used"`
		Limit int `json:"limit"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, 0, err
	}

	return result.Used, result.Limit, nil
}
