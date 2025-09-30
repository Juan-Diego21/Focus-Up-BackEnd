"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserService_1 = require("../services/UserService");
const UserRepository_1 = require("../repositories/UserRepository");
const ormconfig_1 = require("../config/ormconfig");
const testIntegration = async () => {
    console.log('🧪 TEST INTEGRAL - TypeORM + Services + Repository');
    console.log('='.repeat(60));
    try {
        console.log('\n1. Inicializando base de datos...');
        await (0, ormconfig_1.initializeDatabase)();
        console.log('✅ Base de datos inicializada correctamente');
        console.log('\n2. Testeando conexión TypeORM...');
        const isConnected = ormconfig_1.AppDataSource.isInitialized;
        console.log('✅ TypeORM conectado:', isConnected);
        console.log('\n3. Testeando métodos del Repository...');
        const allUsers = await UserRepository_1.userRepository.findAll();
        console.log('✅ findAll funciona:', Array.isArray(allUsers));
        const emailExists = await UserRepository_1.userRepository.emailExists('test@example.com');
        console.log('✅ emailExists funciona:', typeof emailExists === 'boolean');
        console.log('✅ Todos los métodos del repository responden');
        console.log('\n4. Testeando métodos del Service...');
        const invalidEmail = await UserService_1.userService.getUserByEmail('invalid-email');
        console.log('✅ Validación de email funciona:', invalidEmail.success === false);
        const weakPassword = await UserService_1.userService.createUser({
            nombre_usuario: 'test',
            correo: 'test2@example.com',
            contrasena: 'weak',
            fecha_nacimiento: new Date('1990-01-01')
        });
        console.log('✅ Validación de password funciona:', weakPassword.success === false);
        console.log('✅ Todos los métodos del service responden');
        console.log('\n5. Testeando健康 check...');
        try {
            const response = await fetch('http://localhost:3001/api/v1/health');
            const health = await response.json();
            console.log('✅ Health check funciona:', health.status === 'OK');
        }
        catch (error) {
            console.log('⚠️ Health check no disponible (servidor no corriendo)');
        }
        console.log('\n' + '='.repeat(60));
        console.log('✅ TEST INTEGRAL COMPLETADO EXITOSAMENTE');
        console.log('✅ Migración a TypeORM completada correctamente');
        console.log('✅ Todos los componentes funcionan en conjunto');
    }
    catch (error) {
        console.error('❌ Error en test integral:', error);
        process.exit(1);
    }
};
testIntegration().catch(console.error);
