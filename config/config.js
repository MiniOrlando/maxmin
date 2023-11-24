const conexion = require('mssql')
const jwt = require('jsonwebtoken')

//MÓDULOS A EXPORTAR
module.exports = conexion

//VARIABLES DE CONEXION

// CONECTAR A OFC PARA PRODUCCIÓN
var SQLConfig = {
    user: 'sa',
    password: 'UaPVMM6P',
    server: '172.16.4.254',
    port: 14301,
    database: 'TCADBMAB',
    options: {
        encrypt: false
    }
}

// CONECTAR A LOCAL PARA PRUEBAS
/*var SQLConfig = {
    user: 'sa',
    password: '12345678',
    server: '172.16.3.202',
    database: 'TCADBMAB',
    options: {
        encrypt: false
    }
}*/

//MANEJO DEL ERROR
conexion.on('error', error => {
    console.log("Error de conexión. " , error)
})

//ESTABLECE LA CONEXION
conexion.connect(SQLConfig, error => {
    if(error){
        throw error 
    }
    console.log('Conexión establecida en: '+SQLConfig.server);
})
