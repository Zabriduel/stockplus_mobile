import {api} from "../api/api";

export class MovimentacaoRepository {

  async create(data: any) {
    const response = await api.post('/movimentacoes', data);
    return response.data;
  }

  async findAll() {
    const response = await api.get('/movimentacoes');
    return response.data;
  }

  async findByLote(idLote: number) {
    const response = await api.get(`/movimentacoes?idLote=${idLote}`);
    return response.data;
  }

  async update(id: number, data: any) {
    const response = await api.patch(`/movimentacoes?id=${id}`, data);
    return response.data;
  }

  async delete(id: number) {
    const response = await api.delete(`/movimentacoes?id=${id}`);
    return response.data;
  }

}