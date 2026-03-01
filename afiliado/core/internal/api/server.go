package api

import (
	"afiliado-core/internal/config"
	"afiliado-core/internal/security"
	"afiliado-core/internal/vps"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Server struct {
	vpsClient    *vps.Client
	config       *config.Config
	sessionToken string
	router       *gin.Engine
}

func NewServer(vpsClient *vps.Client, cfg *config.Config) *Server {
	gin.SetMode(gin.ReleaseMode)
	
	s := &Server{
		vpsClient: vpsClient,
		config:    cfg,
		router:    gin.Default(),
	}

	s.setupRoutes()
	return s
}

func (s *Server) setupRoutes() {
	s.router.Use(corsMiddleware())
	
	api := s.router.Group("/api/v1")
	{
		api.POST("/login", s.handleLogin)
		api.GET("/status", s.authMiddleware(), s.handleStatus)
		api.GET("/quota", s.authMiddleware(), s.handleQuota)
		api.GET("/plugins", s.authMiddleware(), s.handlePlugins)
		api.POST("/validate-action", s.authMiddleware(), s.handleValidateAction)
	}
}

func (s *Server) Start(port int) error {
	return s.router.Run(fmt.Sprintf(":%d", port))
}

func (s *Server) handleLogin(c *gin.Context) {
	var req struct {
		Phone string `json:"phone" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "telefone inválido"})
		return
	}

	// Validar número com Pastorini API
	exists, jid, err := s.vpsClient.ValidateNumberWithPastorini(
		s.config.PastoriniInstanceID,
		req.Phone,
	)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "erro ao validar número",
			"details": err.Error(),
		})
		return
	}

	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Número não registrado no WhatsApp",
			"phone": req.Phone,
		})
		return
	}

	fingerprint := security.GenerateFingerprint()
	
	// Validar usuário no VPS
	resp, err := s.vpsClient.ValidateUser(req.Phone, fingerprint)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "falha na validação",
			"details": err.Error(),
		})
		return
	}

	if !resp.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "usuário não autorizado"})
		return
	}

	// Verificar assinatura do token (se chave pública estiver configurada)
	if s.config.PublicKey != "" {
		if err := security.VerifySignature(resp.Token.Token, resp.Token.Signature); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "assinatura inválida"})
			return
		}
	}

	s.sessionToken = resp.Token.Token

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user":    resp.User,
		"plugins": resp.Plugins,
		"token":   resp.Token.Token,
		"jid":     jid,
	})
}

func (s *Server) handleStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "active",
		"core":   "running",
	})
}

func (s *Server) handleQuota(c *gin.Context) {
	userID := c.GetString("userID")
	
	used, limit, err := s.vpsClient.CheckQuota(userID, s.sessionToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "erro ao verificar quota"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"used":      used,
		"limit":     limit,
		"remaining": limit - used,
	})
}

func (s *Server) handlePlugins(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"plugins": []string{},
	})
}

func (s *Server) handleValidateAction(c *gin.Context) {
	var req struct {
		Action string `json:"action" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ação inválida"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"authorized": true,
		"actionID":   uuid.New().String(),
	})
}

func (s *Server) authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" || token != "Bearer "+s.sessionToken {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "não autorizado"})
			c.Abort()
			return
		}
		c.Next()
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	}
}
