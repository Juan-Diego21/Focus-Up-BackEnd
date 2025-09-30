import {EventoRepository} from '../repositories/EventoRepository';
import {} from '../models/Evento.entity';
import {IEventoCreate } from '../types/IEventoCreate'
import {MetodoEstudioRepository } from '../repositories/MetodoEstudioRepository'

export const EventoService ={
    async listEvento () {
        try {
            const eventist = await EventoRepository.find();
            return {
                success: true,
                data: eventist
            };
        } catch (error) {
            console.error('Error al traer los eventos', error);
            return { success: false, error: 'Error al traer eventos' };
        }
    },
    async crearEvento (data:IEventoCreate, idMetodo:any){
        try{
            console.log("Creando los eventos con :", data)

            const metodo = await MetodoEstudioRepository.findOneBy({idMetodo:idMetodo})
            if(!metodo){
                return {success:false,
                    error:'Metodo de estudio no valido'
                }
            }
            //Intacia de evento para crear añadir el metod 
            const nuevoEvento=  EventoRepository.create({
                nombreEvento: data.nombreEvento,
                fechaEvento: data.fechaEvento,
                horaEvento: data.horaEvento,
                descripcionEvento:data.descripcionEvento,
                metodoEstudio:metodo
            });
            const guardarEvento = await EventoRepository.save(nuevoEvento);
            return {
                success: true,
                message:"Evento creado correcramente ",
                data: guardarEvento
            }
        }catch (error)
        {console.log('error al crear el evento', error)
            return {
                success:false,
                error:'error interno al crear evento'
            }
        }
    }, 
    //Elimiinar evento
    async deleteEvento(id_evento: number) {
    try {
        const evento = await EventoRepository.findOneBy({ idEvento: id_evento });

        if (!evento) {
        return {success: false,
            error: "Evento no encontrado",
        };
        }

        await EventoRepository.remove(evento);

            return {success: true,
            message: "Evento eliminado correctamente",
            };
        } catch (error) {
            console.error("Error al eliminar evento:", error);
            return {
            success: false,
            error: "Error interno al eliminar evento",
            };
        }
    },
    //Actualizar Evento
    async updateEvento(id: number, data: {
        nombreEvento?: string;
        fechaEvento?: Date;
        horaEvento?: string;
        descripcionEvento?: string;
        }) {
        try {
            const evento = await EventoRepository.findOneBy({ idEvento: id });

            if (!evento) {
            return {
                success: false,
                error: "Evento no encontrado",
                timestamp: new Date()
            };
            }

                await EventoRepository.update(evento, {
            nombreEvento: data.nombreEvento,
            fechaEvento: data.fechaEvento,
            horaEvento: data.horaEvento,
            descripcionEvento: data.descripcionEvento
            });

            const eventoActualizado = await EventoRepository.findOneBy(evento);
                return {
            success: true,
            message: "Evento actualizado correctamente",
            data: eventoActualizado,
            };
        } catch (error) {
            console.error("Error al actualizar evento:", error);

                return {
            success: false,
            error: "Error interno al actualizar evento",
            };
        }
    }

    
}
