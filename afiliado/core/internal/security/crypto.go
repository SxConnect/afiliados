package security

import (
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
)

var publicKey *rsa.PublicKey

func Initialize(publicKeyPEM string) error {
	block, _ := pem.Decode([]byte(publicKeyPEM))
	if block == nil {
		return errors.New("falha ao decodificar chave pública")
	}

	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return err
	}

	var ok bool
	publicKey, ok = pub.(*rsa.PublicKey)
	if !ok {
		return errors.New("não é uma chave RSA")
	}

	return nil
}

func VerifySignature(data, signature string) error {
	if publicKey == nil {
		return errors.New("chave pública não inicializada")
	}

	sig, err := base64.StdEncoding.DecodeString(signature)
	if err != nil {
		return err
	}

	hash := sha256.Sum256([]byte(data))
	return rsa.VerifyPKCS1v15(publicKey, crypto.SHA256, hash[:], sig)
}
