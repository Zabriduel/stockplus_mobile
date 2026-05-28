import api from "../api/api";

export class MovimentacaoRepository {

  async findAll() {
    const response = await api.get('/movimentacoes');
    return response.data;
  }

  async update(id: number, data: any) {
    const response = await api.put(`/movimentacoes/${id}`, data);
    return response.data;
  }

}