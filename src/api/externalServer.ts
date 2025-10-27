// Cliente para servidor HTTP externo
const EXTERNAL_SERVER_BASE = 'http://72.60.246.250:8087';
const AUDIO_PATH = `${EXTERNAL_SERVER_BASE}/audios`;
const DATABASE_PATH = `${EXTERNAL_SERVER_BASE}/bancoexterno`;

export interface AudioFile {
  name: string;
  url: string;
}

export interface BackupData {
  timestamp: string;
  data: any;
}

class ExternalServerClient {
  // Áudios disponíveis no servidor
  private audioFiles = [
    'novo_pedido.mp3',
    'estoque_baixo.mp3',
    'pedido_concluido.mp3',
    'alerta_geral.mp3'
  ];

  // Buscar áudio do servidor (sem HEAD para evitar bloqueio mixed-content/CORS)
  async getAudio(audioName: string): Promise<string> {
    // Retorna a URL do servidor para o frontend buscar o áudio
    return `${EXTERNAL_SERVER_BASE}/uploads/${audioName}`;
  }

  // Lista todos os áudios disponíveis - Não é mais necessário, pois a lista de áudios
  // não é fixa e deve ser gerenciada pelo backend, se necessário.
  getAvailableAudios(): AudioFile[] {
    return [];
  }

  // Novo: Fazer upload de arquivo de áudio
  async uploadAudio(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch(`${DATABASE_PATH}/upload_audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro ao fazer upload do áudio: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao fazer upload do áudio:', error);
      throw new Error('Falha ao fazer upload do arquivo de áudio para o servidor SQL.');
    }
  }

  // Salvar dados no banco externo
  async saveToExternalDatabase(entityName: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${DATABASE_PATH}/${entityName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao salvar no banco externo: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao salvar no banco externo:', error);
      throw new Error('Falha ao salvar no banco de dados SQL.');
    }
  }

  // Buscar dados do banco externo
  async getFromExternalDatabase(entityName: string): Promise<any[]> {
    try {
      const response = await fetch(`${DATABASE_PATH}/${entityName}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar do banco externo: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar do banco externo:', error);
      throw new Error('Falha ao buscar do banco de dados SQL.');
    }
  }

  // Atualizar dados no banco externo
  async updateInExternalDatabase(entityName: string, id: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${DATABASE_PATH}/${entityName}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar no banco externo: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar no banco externo:', error);
      throw new Error('Falha ao atualizar no banco de dados SQL.');
    }
  }

  // Deletar do banco externo
  async deleteFromExternalDatabase(entityName: string, id: string): Promise<void> {
    try {
      const response = await fetch(`${DATABASE_PATH}/${entityName}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao deletar do banco externo: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao deletar do banco externo:', error);
      throw new Error('Falha ao deletar do banco de dados SQL.');
    }
  }

  // Novo: Rota de Login
  async login(credentials: { username: string; password_hash: string }): Promise<any> {
    try {
      const response = await fetch(`${DATABASE_PATH}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        // Lançar erro para ser capturado no AuthContext
        throw new Error('Credenciais inválidas');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro durante o login:', error);
      throw error;
    }
  }

  // O backup e a sincronização não são mais necessários, pois o sistema
  // agora depende apenas do backend SQL.
  async createBackup(): Promise<void> {
    console.warn("Backup via localStorage desativado. O sistema usa o backend SQL.");
  }

  async syncPendingData(): Promise<void> {
    console.warn("Sincronização via localStorage desativada. O sistema usa o backend SQL.");
  }
}

export const externalServer = new ExternalServerClient();