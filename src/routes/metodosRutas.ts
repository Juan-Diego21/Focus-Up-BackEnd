import { Router } from 'express';
import { MetodoEstudioController } from '../controllers/MetodoEstudioController';


const router = Router();

router.get('/', MetodoEstudioController.getMetodoList.bind(MetodoEstudioController))
router.get('/:id' ,MetodoEstudioController.getMetodoById.bind(MetodoEstudioController))
router.get('/nombre/:nombre', MetodoEstudioController.getMetodoByname.bind(MetodoEstudioController))


export default router;