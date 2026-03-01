import { useState, useCallback } from 'react';
import { whatsappService } from '@services/api';
import { toast } from 'react-hot-toast';

export function useWhatsApp() {
  const [loading, setLoading] = useState(false);

  const createInstance = useCallback(async (instanceId: string) => {
    setLoading(true);
    try {
      const data = await whatsappService.createInstance(instanceId);
      if (data.success) {
        toast.success('Instância criada!');
        return data;
      }
      toast.error(data.error);
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getQRCode = useCallback(async (instanceId: string) => {
    setLoading(true);
    try {
      const data = await whatsappService.getQRCode(instanceId);
      return data.success ? data.qrImage : null;
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (
    instanceId: string,
    jid: string,
    text: string
  ) => {
    setLoading(true);
    try {
      const data = await whatsappService.sendText(instanceId, jid, text);
      if (data.success) {
        toast.success('Mensagem enviada!');
        return true;
      }
      toast.error(data.error);
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createInstance,
    getQRCode,
    sendMessage,
  };
}
