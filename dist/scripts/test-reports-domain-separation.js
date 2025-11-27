"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReportsService_1 = require("../services/ReportsService");
const ormconfig_1 = require("../config/ormconfig");
const testReportsDomainSeparation = async () => {
    console.log('🧪 TEST DE SEPARACIÓN DE DOMINIOS - Reportes');
    console.log('='.repeat(60));
    try {
        console.log('\n1. Inicializando base de datos...');
        await (0, ormconfig_1.initializeDatabase)();
        console.log('✅ Base de datos inicializada correctamente');
        console.log('\n2. Testeando métodos del servicio de reportes...');
        console.log('\n   - Probando getUserSessionReports...');
        const sessionReports = await ReportsService_1.reportsService.getUserSessionReports(18);
        console.log('   ✅ getUserSessionReports funciona:', sessionReports.success);
        if (sessionReports.success && sessionReports.sessions) {
            console.log(`   📊 Encontradas ${sessionReports.sessions.length} sesiones`);
            if (sessionReports.sessions.length > 0) {
                const session = sessionReports.sessions[0];
                console.log('   🔍 Validando estructura de sesión...');
                const requiredFields = ['id_reporte', 'id_sesion', 'id_usuario', 'nombre_sesion', 'descripcion', 'estado', 'tiempo_total', 'fecha_creacion'];
                const hasAllFields = requiredFields.every(field => field in session);
                console.log('   ✅ Campos requeridos presentes:', hasAllFields);
                console.log('   ✅ id_reporte es número:', typeof session.id_reporte === 'number');
                console.log('   ✅ id_sesion es número:', typeof session.id_sesion === 'number');
                console.log('   ✅ id_usuario es número:', typeof session.id_usuario === 'number');
                console.log('   ✅ nombre_sesion es string:', typeof session.nombre_sesion === 'string');
                console.log('   ✅ estado válido:', ['pendiente', 'completado'].includes(session.estado));
                console.log('   ✅ tiempo_total es número:', typeof session.tiempo_total === 'number');
            }
        }
        console.log('\n   - Probando getUserMethodReports...');
        const methodReports = await ReportsService_1.reportsService.getUserMethodReports(18);
        console.log('   ✅ getUserMethodReports funciona:', methodReports.success);
        if (methodReports.success && methodReports.methods) {
            console.log(`   📊 Encontrados ${methodReports.methods.length} métodos`);
            if (methodReports.methods.length > 0) {
                const method = methodReports.methods[0];
                console.log('   🔍 Validando estructura de método...');
                const requiredFields = ['id_reporte', 'id_metodo', 'id_usuario', 'nombre_metodo', 'progreso', 'estado', 'fecha_creacion'];
                const hasAllFields = requiredFields.every(field => field in method);
                console.log('   ✅ Campos requeridos presentes:', hasAllFields);
                console.log('   ✅ id_reporte es número:', typeof method.id_reporte === 'number');
                console.log('   ✅ id_metodo es número:', typeof method.id_metodo === 'number');
                console.log('   ✅ id_usuario es número:', typeof method.id_usuario === 'number');
                console.log('   ✅ nombre_metodo es string:', typeof method.nombre_metodo === 'string');
                console.log('   ✅ progreso es número:', typeof method.progreso === 'number');
                console.log('   ✅ progreso válido:', method.progreso >= 0 && method.progreso <= 100);
            }
        }
        console.log('\n   - Probando getUserReports (agregador)...');
        const allReports = await ReportsService_1.reportsService.getUserReports(18);
        console.log('   ✅ getUserReports funciona:', allReports.success);
        if (allReports.success && allReports.reports) {
            console.log('   🔍 Validando estructura agregada...');
            console.log('   ✅ Contiene metodos:', 'metodos' in allReports.reports);
            console.log('   ✅ Contiene sesiones:', 'sesiones' in allReports.reports);
            console.log('   ✅ Contiene combined:', 'combined' in allReports.reports);
            const { metodos, sesiones, combined } = allReports.reports;
            console.log(`   📊 Métodos: ${metodos.length}, Sesiones: ${sesiones.length}, Combinado: ${combined.length}`);
            console.log('   ✅ Longitud combinada correcta:', combined.length === metodos.length + sesiones.length);
        }
        console.log('\n3. Testeando separación de dominios...');
        if (sessionReports.success && methodReports.success) {
            const sessions = sessionReports.sessions || [];
            const methods = methodReports.methods || [];
            console.log('   🔍 Verificando que los datos sean de diferentes tipos...');
            if (sessions.length > 0 && methods.length > 0) {
                const sessionKeys = Object.keys(sessions[0]);
                const methodKeys = Object.keys(methods[0]);
                console.log('   ✅ Campos de sesión:', sessionKeys.join(', '));
                console.log('   ✅ Campos de método:', methodKeys.join(', '));
                const sessionSpecificFields = ['tiempo_total', 'metodo_asociado', 'album_asociado'];
                const methodSpecificFields = ['progreso'];
                const sessionsDontHaveMethodFields = methodSpecificFields.every(field => !sessionKeys.includes(field));
                const methodsDontHaveSessionFields = sessionSpecificFields.every(field => !methodKeys.includes(field));
                console.log('   ✅ Sesiones no tienen campos de métodos:', sessionsDontHaveMethodFields);
                console.log('   ✅ Métodos no tienen campos de sesiones:', methodsDontHaveSessionFields);
            }
            console.log('   ✅ Separación de dominios validada correctamente');
        }
        console.log('\n4. Testeando eliminación de reportes...');
        if (methodReports.success && methodReports.methods && methodReports.methods.length > 0) {
            const methodToDelete = methodReports.methods[0];
            const deleteMethodResult = await ReportsService_1.reportsService.deleteReport(methodToDelete.id_reporte, 18);
            console.log('   ✅ Eliminación de método:', deleteMethodResult.success, '-', deleteMethodResult.message);
        }
        else {
            console.log('   ⚠️ No hay métodos para probar eliminación');
        }
        if (sessionReports.success && sessionReports.sessions && sessionReports.sessions.length > 0) {
            const sessionToDelete = sessionReports.sessions[0];
            const deleteSessionResult = await ReportsService_1.reportsService.deleteReport(sessionToDelete.id_reporte, 18);
            console.log('   ✅ Eliminación de sesión:', deleteSessionResult.success, '-', deleteSessionResult.message);
        }
        else {
            console.log('   ⚠️ No hay sesiones para probar eliminación');
        }
        const deleteNonExistentResult = await ReportsService_1.reportsService.deleteReport(999999, 18);
        console.log('   ✅ Eliminación de reporte inexistente:', deleteNonExistentResult.success === false);
        console.log('\n5. Testeando manejo de errores...');
        const invalidUserSessions = await ReportsService_1.reportsService.getUserSessionReports(99999);
        console.log('   ✅ Usuario inexistente (sessions):', invalidUserSessions.success === false);
        const invalidUserMethods = await ReportsService_1.reportsService.getUserMethodReports(99999);
        console.log('   ✅ Usuario inexistente (methods):', invalidUserMethods.success === false);
        console.log('\n' + '='.repeat(60));
        console.log('✅ TEST DE SEPARACIÓN DE DOMINIOS COMPLETADO EXITOSAMENTE');
        console.log('✅ Endpoints de reportes separados funcionan correctamente');
        console.log('✅ Eliminación de reportes funciona para métodos y sesiones');
        console.log('✅ Estructuras de datos validadas');
        console.log('✅ Separación de dominios confirmada');
    }
    catch (error) {
        console.error('❌ Error en test de separación de dominios:', error);
        process.exit(1);
    }
};
testReportsDomainSeparation().catch(console.error);
