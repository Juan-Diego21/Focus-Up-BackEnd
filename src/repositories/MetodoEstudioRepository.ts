import { Repository } from "typeorm"
import { AppDataSource } from "../config/ormconfig"
import {MetodoEstudio} from "../models/MedotoEstudio.entity"

AppDataSource.getRepository(MetodoEstudio)
export const MetodoEstudioRepository: Repository<MetodoEstudio> = AppDataSource.getRepository(MetodoEstudio);
