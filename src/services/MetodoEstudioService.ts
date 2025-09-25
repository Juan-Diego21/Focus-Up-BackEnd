import { MetodoEstudioRepository } from '../repositories/MetodoEstudioRepository';
import { MetodoEstudio } from '../models/MedotoEstudio.entity';
import { ifError } from 'assert';


export const MetodoEstudioService = {
  async getMetodoById(idMetodo: number ) {
    try {
      const metodo = await MetodoEstudioRepository.findOneBy({ idMetodo: idMetodo });
      if (!metodo) {
        return { success: false, error: 'Método de estudio no encontrado por id ' };
      }
      return { success: true, metodo };
    } catch (error) {
      console.error('Error en getMetodoById:', error);
      return { success: false, error: 'Error interno al buscar el método' };
    }
  },
//Función: listarMetodos()
    async getMetodoByname (nombreMetodo:string){
        try{
            const metodoNombre = await MetodoEstudioRepository.findBy({ nombreMetodo })
        if (metodoNombre.length === 0) {
        return { success: false, error: 'No se encontraron métodos con ese nombre' };
        } 
        }catch (error) {
        console.error('Error en getMetodoByname:', error);
        return { success: false, error: 'Error interno al buscar por nombre' };
        }


    },   

  async getMetodoList() {
    try {
      const lista = await MetodoEstudioRepository.find();
      return { success: true, data: lista };
    } catch (error) {
      console.error('Error al traer todos los metodos:', error);
      return { success: false, error: 'Error al listar métodos' };
    }
  }
};
export default MetodoEstudioService;

