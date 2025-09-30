import { Router } from 'express';
import { eventosController } from '../controllers/EventoController';

const router = Router();

//Listar Eveentos
router.get('/', eventosController.listEventos.bind(eventosController))

//crearEvento
router.post('/crear' ,eventosController.crearEvento.bind(eventosController))

//Actualizar Evento
router.put('/:id', eventosController.updateEvento.bind(eventosController)) 
//Eliminar Evento
router.delete('/:id', eventosController.deleteEvento.bind(eventosController))

export default router;