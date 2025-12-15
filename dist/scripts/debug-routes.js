"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ormconfig_1 = require("../config/ormconfig");
const UserRepository_1 = require("../repositories/UserRepository");
const debugRoutes = async () => {
    console.log('🔍 DEBUG: Verificando rutas y base de datos');
    try {
        await (0, ormconfig_1.initializeDatabase)();
        console.log('✅ Base de datos conectada');
        const users = await UserRepository_1.userRepository.findAll();
        console.log(`✅ Repository funciona - Usuarios encontrados: ${users.length}`);
        const tableExists = await ormconfig_1.AppDataSource.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usuario')");
        console.log('✅ Tabla usuario existe:', tableExists[0].exists);
        console.log('\n📋 RUTAS ESPERADAS:');
        console.log('POST   /api/v1/users');
        console.log('GET    /api/v1/users');
        console.log('GET    /api/v1/users/:id');
        console.log('POST   /api/v1/users/login');
        console.log('GET    /api/v1/health');
    }
    catch (error) {
        console.error('❌ Error en debug:', error);
    }
};
debugRoutes();
