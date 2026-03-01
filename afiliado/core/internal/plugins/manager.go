package plugins

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type Plugin struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Version      string   `json:"version"`
	Description  string   `json:"description"`
	RequiresPlan string   `json:"requiresPlan"`
	Enabled      bool     `json:"enabled"`
	Path         string   `json:"-"`
}

type Manifest struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Version      string   `json:"version"`
	Description  string   `json:"description"`
	RequiresPlan string   `json:"requiresPlan"`
	EntryPoint   string   `json:"entryPoint"`
}

type Manager struct {
	pluginsDir     string
	loadedPlugins  map[string]*Plugin
	enabledPlugins []string
}

func NewManager(pluginsDir string) *Manager {
	return &Manager{
		pluginsDir:    pluginsDir,
		loadedPlugins: make(map[string]*Plugin),
	}
}

func (m *Manager) LoadPlugins() error {
	entries, err := os.ReadDir(m.pluginsDir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		manifestPath := filepath.Join(m.pluginsDir, entry.Name(), "manifest.json")
		data, err := os.ReadFile(manifestPath)
		if err != nil {
			continue
		}

		var manifest Manifest
		if err := json.Unmarshal(data, &manifest); err != nil {
			continue
		}

		plugin := &Plugin{
			ID:           manifest.ID,
			Name:         manifest.Name,
			Version:      manifest.Version,
			Description:  manifest.Description,
			RequiresPlan: manifest.RequiresPlan,
			Enabled:      false,
			Path:         filepath.Join(m.pluginsDir, entry.Name()),
		}

		m.loadedPlugins[plugin.ID] = plugin
	}

	return nil
}

func (m *Manager) EnablePlugin(pluginID string, userPlugins []string) error {
	plugin, exists := m.loadedPlugins[pluginID]
	if !exists {
		return fmt.Errorf("plugin não encontrado: %s", pluginID)
	}

	// Verificar se usuário tem permissão
	hasPermission := false
	for _, p := range userPlugins {
		if p == pluginID {
			hasPermission = true
			break
		}
	}

	if !hasPermission {
		return fmt.Errorf("usuário não tem permissão para este plugin")
	}

	plugin.Enabled = true
	m.enabledPlugins = append(m.enabledPlugins, pluginID)

	return nil
}

func (m *Manager) GetPlugin(pluginID string) (*Plugin, error) {
	plugin, exists := m.loadedPlugins[pluginID]
	if !exists {
		return nil, fmt.Errorf("plugin não encontrado")
	}
	return plugin, nil
}

func (m *Manager) ListPlugins() []*Plugin {
	plugins := make([]*Plugin, 0, len(m.loadedPlugins))
	for _, plugin := range m.loadedPlugins {
		plugins = append(plugins, plugin)
	}
	return plugins
}
