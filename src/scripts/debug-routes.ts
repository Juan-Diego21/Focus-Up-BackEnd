import { AppDataSource } from '../config/ormconfig';
import { initializeDatabase } from '../config/ormconfig';
import { userRepository } from '../repositories/UserRepository';

const debugRoutes = async () => {
    console.log('🔍 DEBUG: Verificando rutas y base de datos');

    try {
        // 1. Verificar conexión a BD
        await initializeDatabase();
        console.log('✅ Base de datos conectada');

        // 2. Verificar que el repository funciona
        const users = await userRepository.findAll();
        console.log(`✅ Repository funciona - Usuarios encontrados: ${users.length}`);

        // 3. Verificar que la tabla existe
        const tableExists = await AppDataSource.query(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usuario')"
        );
        console.log('✅ Tabla usuario existe:', tableExists[0].exists);

        console.log('\n📋 RUTAS ESPERADAS:');
        console.log('POST   /api/v1/users');
        console.log('GET    /api/v1/users');
        console.log('GET    /api/v1/users/:id');
        console.log('POST   /api/v1/users/login');
        console.log('GET    /api/v1/health');

    } catch (error) {
        console.error('❌ Error en debug:', error);
    }
};

debugRoutes();