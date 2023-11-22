const jwt = require('jsonwebtoken');
const conexion = require('../config/config');
const moment = require('moment');

module.exports={
    auth:async function (req, res) {
        if(req.session.loggedin) {
            var dateToConsult = moment().format('YYYY-MM-DD');
            dateToConsult = dateToConsult.replace(/-/gi, '');
            console.log(dateToConsult);
            new conexion.Request()
            .input('sucursal', req.session.sucursal)
            .input('dateToConsult', dateToConsult)
            .query(`SELECT * FROM cap_maxmin 
                    WHERE sucursal = @sucursal AND estatus IN ('0', '3') AND fec_cre >= @dateToConsult`, async(error, results) => {
                data = {
                    nombre_lar: req.session.nombre_lar,
                    puesto: req.session.puesto,
                    sucursal: req.session.sucursal,
                    tabla: results.recordset
                }
                res.render('pages/maxmin', {data:data});
            });
        } else {
            try{
                //RECIBE LAS VARIABLES DEL HTML
                const user = req.body.user.toUpperCase().trim();
                const contraseña = req.body.password.toUpperCase();
                console.log("Usuario: "+user+" Contraseña: "+contraseña);

                //COMPRUEBA EXISTENCIA DE DATOS Y DE ESTAR MAL RECARGA LA PÁGINA CON UNA ALERTA
                if(!user || !contraseña){
                    console.log("Usuario y contraseña vacíos");
                    res.render('login/login', {
                        alert: true,
                        alertTitle: "Error",
                        alertText: "No ha ingresado usuario o contraseña",
                        alertIcon: "error",
                        alertButton: "Ok"
                    })
                }

                //BUSCA LOS DATOS DE ACCESO EN LA DB
                else{
                    console.log("Usuario y contraseña no vacíos");
                    new conexion.Request()
                    .input('user', user)
                    .query(`SELECT * FROM tcausr WHERE nombre = @user AND puesto != 'BAJA'`, async (error, results) => {

                        //SI NO EXISTE EL USUARIO O LA CONTRASEÑA NO COINCIDE RECARGA LOGIN CON UNA ALERTA
                        if(results.recordset.length == 0 || contraseña != results.recordsets[0][0].pwd.trim()){
                            console.log('Usuario no existe o contraseña incorrecta')
                            res.render('login/login', {
                                alert: true,
                                alertTitle: "Error",
                                alertText: "Datos de acceso incorrectos",
                                alertIcon: "error",
                                alertButton: "Ok"
                            });
                        }

                        //EN CASO DE QUE EL USUARIO SEA CORRECTO, ACCEDE AL DASHBOARD
                        else{
                            console.log('usuario si existe')
                            //GENERA EL TOKEN
                            /*const token = jwt.sign({id:user}, process.env.JWT_SECRETO, {
                                expiresIn: process.env.JWT_TIEMPO_EXPIRA
                            })
                            console.log(process.env.JWT_SECRETO);

                            //GENERA LA COOKIE
                            const cookiesOptions = {
                                expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES*24*60*60*1000),
                                httpOnly: true
                            }
                            res.cookie('jwt', token, cookiesOptions)*/

                            //LO REDIRIGUE AL DASHBOARD
                            console.log('dashboard')
                            req.session.loggedin = true;
                            req.session.user = user;

                            var data;
                            const nombre_lar = results.recordsets[0][0].nombre_lar.trim();
                            const puesto = results.recordsets[0][0].puesto.trim();
                            const sucursal = results.recordsets[0][0].cia_ventas.trim();
                            req.session.nombre_lar = nombre_lar;
                            req.session.puesto = puesto;
                            req.session.sucursal = sucursal;

                            var today = new Date();
                            today = new Date().toDateString().split(" ");
                            console.log("todays date", today);

                            var dateToConsult = moment().format('YYYY-MM-DD');
                            dateToConsult = dateToConsult.replace(/-/gi, '');
                            console.log(dateToConsult);

                            new conexion.Request()
                            .input('usr', nombre_lar)
                            .input('dateToConsult', dateToConsult)
			                .input('sucursal', sucursal)
                            .query(`SELECT * FROM cap_maxmin 
                                    WHERE sucursal = @sucursal AND estatus IN ('0', '3') AND fec_cre >= @dateToConsult`, async(error, results) => {
                                data = {
                                    nombre_lar: nombre_lar,
                                    puesto: puesto,
                                    sucursal: sucursal,
                                    tabla: results.recordset,
                                    alert: true,
                                    alertTitle: "¡Bienvenido!",
                                    alertText: "Datos de acceso correctos",
                                    alertIcon: "success",
                                    alertButton: "Ok"
                                }
                                console.log(results.recordset);
                                console.log('length: '+results.recordset.length);
                                res.render('pages/maxmin', {data:data});
                            });

                            //res.redirect('../pages/');
                        }
                    })
                }

            //MANEJO DEL ERROR
            }catch(error){
                console.log(error)
            }
        }
    },

    maxmin:function (req,res) {
        if(req.session.loggedin) {
            var dateToConsult = moment().format('YYYY-MM-DD');
            dateToConsult = dateToConsult.replace(/-/gi, '');
            console.log(dateToConsult);
            new conexion.Request()
            .input('usr', req.session.nombre_lar)
            .input('dateToConsult', dateToConsult)
	        .input('sucursal', req.session.sucursal)
            .query(`SELECT * FROM cap_maxmin 
                    WHERE sucursal = @sucursal 
                    AND estatus IN ('0', '3') 
                    AND fec_cre >= @dateToConsult
                    ORDER BY ID`, async(error, results) => {
                data = {
                    nombre_lar: req.session.nombre_lar,
                    puesto: req.session.puesto,
                    sucursal: req.session.sucursal,
                    tabla: results.recordset
                }
                res.render('pages/maxmin', {data:data});
            });
        } else {
            res.redirect('/maxmin/');
        }
    },

    captura:function (req,res) {
        if(req.session.loggedin) {
            var dateToConsult = moment().format('YYYY-MM-DD');
            dateToConsult = dateToConsult.replace(/-/gi, '');
            console.log(dateToConsult);
            new conexion.Request()
            .input('usr', req.session.nombre_lar)
            .input('dateToConsult', dateToConsult)
	        .input('sucursal', req.session.sucursal)
            .query(`SELECT * FROM cap_ped 
                    WHERE sucursal = @sucursal 
                    AND estatus IN ('0', '3') 
                    AND fec_cre >= @dateToConsult
                    ORDER BY id`, async(error, results) => {
                data = {
                    nombre_lar: req.session.nombre_lar,
                    puesto: req.session.puesto,
                    sucursal: req.session.sucursal,
                    tabla: results.recordset
                }
                console.log(results.recordset)
                res.render('pages/captura', {data:data});
            });
            /*data = {
                nombre_lar: req.session.nombre_lar,
                puesto: req.session.puesto
            }
            res.render('pages/captura', {data:data});*/
        } else {
            res.redirect('/maxmin/');
        }
    },

    negada:function (req,res) {
        if(req.session.loggedin) {
            data = {
                nombre_lar: req.session.nombre_lar,
                puesto: req.session.puesto
            }
            res.render('pages/negada', {data:data});
        } else {
            res.redirect('/maxmin/');
        }
    },

    rebajas:function (req,res) {
        if(req.session.loggedin) {
            data = {
                nombre_lar: req.session.nombre_lar,
                puesto: req.session.puesto
            }
            res.render('pages/rebajas', {data:data});
        } else {
            res.redirect('/maxmin/');
        }
    },

    getProductData: function(req, res, next) {
        console.log('entrando al método getProductData');
        try {
            // OBTENEMOS VALORES CODIGO Y SUCURSAL PARA REALIZAR BÚSQUEDA
            const sucursal = req.session.sucursal;
            const codigo = req.body.searchValue;
            // CONFIGURAMOS ALMC, ALMM Y CODE PARA QUE FUNCIONEN COMO CALUSULAS WHERE PARA DEFINIR LA BÚSQUEDA
            const almC = sucursal+"C";
            const almM = sucursal+"M";
            var code = codigo+"%";
            console.log('hasta aquí todo bien');
            console.log(`valores a buscar: ${sucursal} - ${codigo} - ${code} - ${almC} - ${almM}`);
            // ACCEDEMOS A LA DB PARA OBTENER DATOS
            new conexion.Request()
            .input('code', code)
            .input('sucursal', sucursal)
            .query(`SELECT DISTINCT TOP 1
                    iar.art CveArt, iar.cve_lar Barcode, iars.alm Almacen, iar.lin Linea, iar.des1 Descripcion
                    FROM inviar iar
                    JOIN invart iart ON iar.art = iart.art
                    JOIN invars iars ON iar.art = iars.cve_art
                    WHERE iars.alm = @sucursal AND (iar.art LIKE @code OR iar.des1 LIKE @code OR iar.cve_lar LIKE @code)
                    ORDER BY iar.art ASC`, async(error, results) => {
                // SI HEMOS OBTENIDO 1 O MÁS RESULTADOS EN NUESTRA BÚQUEDA, CONTINUAMOS, CASO CONTRARIO ES QUE NO HAY COINCIDENCIAS
                console.log('seguimos bien');
                if (results.rowsAffected>0) {
                    console.log("5. results: ");
                    console.log('rowsAffected > 0');
                    // DEFINIMOS VARIABLE CON DATOS QUE OCUPAREMOS MÁS ADELANTE
                    const dataTemp = {
                        codigo: results.recordsets[0][0].CveArt,
                        existenciaAlmC: results.recordsets[0][0].Existencia,
                        descripcion: results.recordsets[0][0].Descripcion.trim(),
                        barcode: results.recordsets[0][0].Barcode.trim(),
                        almacen: results.recordsets[0][0].Almacen.trim(),
                        productos: results.recordset
                    }
                    // CREAMOS UNA NUEVA CONSULTA PARA SABER LA VENTA PROMEDIO
                    new conexion.Request()
                    .input('codigo', dataTemp.codigo)
                    .input('almc', almC)
                    .input('almm', almM)
                    .query(`SELECT * FROM resumendos 
                            WHERE Codigo = @codigo AND subalm IN (@almc, @almm)`, async(error, results) => {
                        console.log('y todo sigue bien');
                        // SI OBTENEMOS MÁS DE UN RESULTADO ES PORQUE TIENE VALORES EN ALMACÉN C Y M
                        if (results.rowsAffected > 1) {
                            console.log('aún bien');
                            //var datos = results.recordsets;
                            console.log('datos');
                            console.log('rowsAffected > 1');
                            // SUMAMOS LOS VALORES EN ALMACÉN C Y M PARA OBTENER EL PROMEDIO FINAL
                            var promedio = results.recordsets[0][0].PromUnidades + results.recordsets[0][1].PromUnidades;
                            promedio = Math.round(promedio * 10000) / 10000;
                            // CREAMOS UNA VARIABLE DATA CON TODA LA INFORMACIÓN
                            const data = {
                                nombre_lar: req.session.nombre_lar,
                                puesto: req.session.puesto,
                                sucursal: req.session.sucursal,
                                codigo: dataTemp.codigo,
                                existenciaAlmC: dataTemp.existenciaAlmC,
                                descripcion: dataTemp.descripcion,
                                barcode: dataTemp.barcode,
                                almacen: dataTemp.almacen,
                                productos: dataTemp.productos,
                                promedio: promedio,
                                hasData: true
                            }
                            // ENVIAMOS LA INFORMACIÓN
                            res.send({data:data});
                        // SI SÓLO ES UN RESULTADO ES PORQUE SÓLO TIENEN VALORES EN C Ó EN M, APLICAMOS DIRECTO EL VALOR
                        } else if (results.rowsAffected == 1) {
                            console.log('rowsAffected = 1');
                            const data = {
                                nombre_lar: req.session.nombre_lar,
                                puesto: req.session.puesto,
                                sucursal: req.session.sucursal,
                                codigo: dataTemp.codigo,
                                existenciaAlmC: dataTemp.existenciaAlmC,
                                descripcion: dataTemp.descripcion,
                                barcode: dataTemp.barcode,
                                almacen: dataTemp.almacen,
                                productos: dataTemp.productos,
                                promedio: results.recordsets[0][0].PromUnidades,
                                hasData: true
                            }
                            // ENVIAMOS LA INFORMACIÓN
                            res.send({data:data});
                        } else {
                            console.log('rowAffected < 1 || rowsAffected = 0');
                            const data = {
                                nombre_lar: req.session.nombre_lar,
                                puesto: req.session.puesto,
                                sucursal: req.session.sucursal,
                                hasData: false
                            }
                            // ENVIAMOS LA INFORMACIÓN
                            res.send({data:data});
                        }
                    });
                    //getPromedioVentas(data);
                    //res.send({data:data});
                } else {
                    //TODO: Enviar un SweetAlert que diga "Sin existencias"
                    console.log('no hay existencias')
                    const data = {
                        nombre_lar: req.session.nombre_lar,
                        puesto: req.session.puesto,
                        sucursal: req.session.sucursal,
                        hasData: false
                    }
                    // ENVIAMOS LA INFORMACIÓN
                    res.send({data:data});
                }

                if (error) {
                    console.log('hay errores en el primer query');
                    console.log(error);
                }
            });
        } catch (error) {
            console.log('hay errores en el try catch');
            console.log(error);
        }
        
    },

    getTopTenProductsData: function(req, res) {
        console.log('entrando en método para buscar top 6 artículos');
        // OBTENEMOS VALORES CODIGO Y SUCURSAL PARA REALIZAR BÚSQUEDA
        const sucursal = req.session.sucursal;
        const codigo = req.body.searchValue;
        // CONFIGURAMOS ALMC, ALMM Y CODE PARA QUE FUNCIONEN COMO CALUSULAS WHERE PARA DEFINIR LA BÚSQUEDA
        const almC = sucursal+"C";
        const almM = sucursal+"M";
        var code = codigo+"%";
        // ACCEDEMOS A LA DB PARA OBTENER DATOS
        new conexion.Request()
        .input('code', code)
        .input('sucursal', sucursal)
        .query(`SELECT DISTINCT TOP 6
                iar.art CveArt, iars.alm Almacen, iar.des1 Descripcion
                FROM inviar iar
                JOIN invars iars ON iar.art = iars.cve_art
                WHERE iars.alm = @sucursal AND (iar.art LIKE @code OR iar.des1 LIKE @code OR iar.cve_lar LIKE @code)
                ORDER BY iar.art ASC`, async(error, results) => {
            // SI HEMOS OBTENIDO 1 O MÁS RESULTADOS EN NUESTRA BÚQUEDA, CONTINUAMOS, CASO CONTRARIO ES QUE NO HAY COINCIDENCIAS
            console.log('query ejecutado');

            if (results.rowsAffected>0) {
                console.log('rowsAffected > 0');
                console.log("4. results: ");
                //console.log(results);
                // DEFINIMOS VARIABLE CON DATOS QUE OCUPAREMOS MÁS ADELANTE
                const data = {
                    productos: results.recordset,
                    hayCoincidencias: true,
                    msg: "Hay coincidencias"
                }
                // ENVIAMOS LA INFORMACIÓN
                res.send({data:data});
            } else {
                console.log('rowsAffected <= 0');
                const data = {
                    hayCoincidencias: false,
                    msg: 'No hay coincidencias'
                }
                res.send({data:data});
                //TODO: Enviar un SweetAlert que diga "Sin existencias"
            }

            
        });
    },

    getProductDataById: function(req, res) {
        console.log('método getProductDataById');
        const sucursal = req.session.sucursal;
        const codigo = req.body.searchValue;
        const alm = req.body.alm;
        console.log("cve_art seleccionado: "+codigo);
        console.log("sucursal seleccionado: "+sucursal);
        console.log("alm seleccionado: "+alm);
        new conexion.Request()
        .input('codigo', codigo)
        .input('sucursal', sucursal)
        .query(`SELECT DISTINCT 
        iar.art CveArt, iar.cve_lar Barcode, iars.alm Almacen, iar.lin Linea, iar.des1 Descripcion
        FROM inviar iar
        JOIN invart iart ON iar.art = iart.art
        JOIN invars iars ON iar.art = iars.cve_art
        WHERE iars.alm = @sucursal AND iar.art = @codigo 
        ORDER BY iar.art`, async(error, results) => {
            if(results.rowsAffected>0) {
                const dataTemp = {
                    codigo: results.recordsets[0][0].CveArt,
                    existenciaAlmC: results.recordsets[0][0].Existencia,
                    descripcion: results.recordsets[0][0].Descripcion.trim(),
                    barcode: results.recordsets[0][0].Barcode.trim(),
                    almacen: results.recordsets[0][0].Almacen.trim(),
                    productos: results.recordset
                }
                // CREAMOS UNA NUEVA CONSULTA PARA SABER LA VENTA PROMEDIO
                new conexion.Request()
                .input('codigo', dataTemp.codigo)
                .query(`SELECT * FROM resumendos WHERE Codigo = @codigo`, async(error, results) => {
                    console.log(results);
                    // SI OBTENEMOS MÁS DE UN RESULTADO ES PORQUE TIENE VALORES EN ALMACÉN C Y M
                    if (results.rowsAffected > 1) {
                        var datos = results.recordsets;
                        console.log('datos');
                        //console.log(datos);
                        // SUMAMOS LOS VALORES EN ALMACÉN C Y M PARA OBTENER EL PROMEDIO FINAL
                        var promedio = results.recordsets[0][0].PromUnidades + results.recordsets[0][1].PromUnidades;
                        promedio = Math.round(promedio * 10000) / 10000;
                        // CREAMOS UNA VARIABLE DATA CON TODA LA INFORMACIÓN
                        const data = {
                            nombre_lar: req.session.nombre_lar,
                            puesto: req.session.puesto,
                            sucursal: req.session.sucursal,
                            codigo: dataTemp.codigo,
                            existenciaAlmC: dataTemp.existenciaAlmC,
                            descripcion: dataTemp.descripcion,
                            barcode: dataTemp.barcode,
                            almacen: dataTemp.almacen,
                            productos: dataTemp.productos,
                            promedio: promedio
                        }
                        // ENVIAMOS LA INFORMACIÓN
                        res.send({data:data});
                    // SI SÓLO ES UN RESULTADO ES PORQUE SÓLO TIENEN VALORES EN C Ó EN M, APLICAMOS DIRECTO EL VALOR
                    } else if (results.rowsAffected == 1) {
                        const data = {
                            nombre_lar: req.session.nombre_lar,
                            puesto: req.session.puesto,
                            sucursal: req.session.sucursal,
                            codigo: dataTemp.codigo,
                            existenciaAlmC: dataTemp.existenciaAlmC,
                            descripcion: dataTemp.descripcion,
                            barcode: dataTemp.barcode,
                            almacen: dataTemp.almacen,
                            productos: dataTemp.productos,
                            promedio: results.recordsets[0][0].PromUnidades
                        }
                        // ENVIAMOS LA INFORMACIÓN
                        res.send({data:data});
                    }
                });
            }
        })
    },

    guardarDatosMM: function(req, res) {
        if(req.session.loggedin) {
            console.log('entrando en el método para guardar datos');
            const codigo = req.body.cCodigo;
            const descripcion = req.body.cDescripcion;
            const promedio = req.body.cPromedio;
            const canasta = req.body.cCanasta;
            const catalogo = req.body.cCatalogo;
            const maxCjsC = req.body.cMaxCjsC;
            const minCjsC = req.body.cMinCjsC;
            const maxCjsM = req.body.cMaxCjsM;
            const minPzsM = req.body.cMinPzsM;
            const alm = req.body.cAlm;
            var date = moment().format('YYYY-MM-DD HH:mm:ss');
            console.log(date);
            var dateToConsult = moment().format('YYYY-MM-DD');
            dateToConsult = dateToConsult.replace(/-/gi, '');
            console.log(dateToConsult);

            // ANTES DE INCERTAR EL REGISTRO VALIDAMOS QUE NO EXISTA NINGÚN REGISTRO PARA 
            // ESE ARTÍCULO EN LA MISMA FECHA
            new conexion.Request()
            .input('codigo', codigo)
            .input('sucursal', req.session.sucursal)
            .input('dateToConsult', dateToConsult)
            .query(`SELECT * FROM cap_maxmin 
                    WHERE cve_art = @codigo AND sucursal = @sucursal AND fec_cre >= @dateToConsult`, 
                    async(err, result) => {
                        if(result.rowsAffected!=0) {
                            const data = {
                                nombre_lar: req.session.nombre_lar,
                                puesto: req.session.puesto,
                                sucursal: req.session.sucursal,
                                addToList: false,
                                alert: true,
                                alertTitle: "¡ERROR!",
                                alertText: "Ya existe un registro para este producto el día de hoy",
                                alertIcon: "error"
                            }
                            res.send({data:data});
                        } else {
                            // COMPROBAMOS QUE NO EXISTE NINGÚN REGISTRO IGUAL EN LA MISMA FECHA
                            // AHORA SI INSERTAMOS
                            new conexion.Request()
                            .input('codigo', codigo)
                            .input('descripcion', descripcion)
                            .input('promedio', promedio.trim())
                            .input('canasta', canasta)
                            .input('catalogo', catalogo)
                            .input('maxCjsC', maxCjsC)
                            .input('minCjsC', minCjsC)
                            .input('maxCjsM', maxCjsM)
                            .input('minPzsM', minPzsM)
                            .input('date', date)
                            .input('usr', req.session.nombre_lar)
                            .input('sucursal', req.session.sucursal)
                            .query(`INSERT INTO 
                                    cap_maxmin VALUES (
                                        @codigo, 
                                        @descripcion, 
                                        @promedio, 
                                        @canasta, 
                                        @catalogo, 
                                        @maxCjsC, 
                                        @minCjsC, 
                                        @maxCjsM, 
                                        @minPzsM, 
                                        '0', 
                                        '0',
                                        '0', 
                                        '0', 
                                        @date, 
                                        @usr, 
                                        @sucursal, 
                                        null, 
                                        null,
                                        '0')`, async(err, result) => {
                                console.log('Se insertó, creo');
                                console.log(codigo);
                                console.log(descripcion);
                                console.log(promedio.trim());
                                console.log(canasta);
                                console.log(catalogo);
                                console.log(maxCjsC);
                                console.log(minCjsC);
                                console.log(maxCjsM);
                                console.log(minPzsM);
                                console.log(date);
                                console.log(req.session.nombre_lar);
                                console.log(req.session.sucursal);
                                console.log(result);
                                const data = {
                                    nombre_lar: req.session.nombre_lar,
                                    puesto: req.session.puesto,
                                    sucursal: req.session.sucursal,
                                    addToList: true,
                                    alert: true,
                                    alertTitle: "¡Guardado!",
                                    alertText: "Producto agregado correctamente",
                                    alertIcon: "success"
                                }
                                res.send({data:data});
                            });
                        }
                    });
        } else {
            res.redirect('/maxmin/');
        }
    },

    editarDatosMM: function(req, res) {
        if(req.session.loggedin) {
            console.log('entrando en el método para actualizar datos');
            const codigo = req.body.cCodigo;
            const canasta = req.body.cCanasta;
            const catalogo = req.body.cCatalogo;
            const maxCjsC = req.body.cMaxCjsC;
            const minCjsC = req.body.cMinCjsC;
            const maxCjsM = req.body.cMaxCjsM;
            const minPzsM = req.body.cMinPzsM;
            var date = moment().format('YYYY-MM-DD HH:mm:ss');
            console.log(date);
            var dateToConsult = moment().format('YYYY-MM-DD');
            dateToConsult = dateToConsult.replace(/-/gi, '');
            console.log(dateToConsult);

            new conexion.Request()
            .input('usr', req.session.nombre_lar)
            .input('sucursal', req.session.sucursal)
            .input('codigo', codigo)
            .input('canasta', canasta)
            .input('catalogo', catalogo)
            .input('maxCjsC', maxCjsC)
            .input('minCjsC', minCjsC)
            .input('maxCjsM', maxCjsM)
            .input('minPzsM', minPzsM)
            .input('date', date)
            .input('dateToConsult', dateToConsult)
            .query(`UPDATE cap_maxmin 
                    SET usr_cre = @usr, cta_bsc = @canasta, art_cat_serv = @catalogo, 
                    max_cjs_c = @maxCjsC, min_cjs_c = @minCjsC,
                    max_cjs_m = @maxCjsM, min_pzs_m = @minPzsM,
                    fec_cre = @date, estatus = '3'
                    WHERE cve_art = @codigo AND sucursal = @sucursal AND fec_cre >= @dateToConsult`, async(err, result) => {
                console.log('Se actualizó, creo');
                console.log(result);
                const data = {
                    nombre_lar: req.session.nombre_lar,
                    puesto: req.session.puesto,
                    sucursal: req.session.sucursal,
                    alert: true,
                    alertTitle: "¡Guardado!",
                    alertText: "Producto agregado correctamente",
                    alertIcon: "success"
                }
                res.send({data:data});
            });
        } else {
            res.redirect('/maxmin/');
        }
    },

    eliminarDatosMM: function(req, res) {
        if (req.session.loggedin) {
            console.log('entrando en el método para eliminar datos');
            const codigo = req.body.cCodigo;
            var dateToConsult = moment().format('YYYY-MM-DD');
            dateToConsult = dateToConsult.replace(/-/gi, '');
            //console.log(dateToConsult);
            //console.log("codigo: "+codigo.trim());
            //console.log("------");

            new conexion.Request()
            .input('codigo', codigo.trim())
            .input('sucursal', req.session.sucursal)
            .input('usr', req.session.nombre_lar)
            .input('dateToConsult', dateToConsult)
            .query(`UPDATE cap_maxmin 
                    SET estatus = '4', usr_cre = @usr
                    WHERE cve_art = @codigo AND sucursal = @sucursal AND fec_cre >= @dateToConsult`, async(err, result) => {
                console.log('Se eliminó, creo');
                console.log(result);
                const data = {
                    nombre_lar: req.session.nombre_lar,
                    puesto: req.session.puesto,
                    sucursal: req.session.sucursal,
                    alert: true,
                    alertTitle: "¡Eliminado!",
                    alertText: "Producto eliminado correctamente",
                    alertIcon: "success"
                }
                res.send({data:data});
            });
            /*.query(`DELETE FROM cap_maxmin 
                    WHERE cve_art = @codigo AND sucursal = @sucursal AND fec_cre >= @dateToConsult`, async(err, result) => {
                console.log('Se eliminó, creo');
                console.log(result);
                const data = {
                    nombre_lar: req.session.nombre_lar,
                    puesto: req.session.puesto,
                    sucursal: req.session.sucursal,
                    alert: true,
                    alertTitle: "¡Eliminado!",
                    alertText: "Producto eliminado correctamente",
                    alertIcon: "success"
                }
                res.send({data:data});
            });*/
        } else {
            res.redirect('/maxmin/');
        }
    },

    getProductsCaptura: function(req, res) {
        if(req.session.loggedin) {
            const type = req.body.type;
            const sucursal = req.session.sucursal;
            // CONFIGURAMOS ALMC y ALMM PARA QUE FUNCIONEN COMO CALUSULAS WHERE PARA DEFINIR LA BÚSQUEDA
            const almc = sucursal+"C";
            const almm = sucursal+"M";
            new conexion.Request()
            .input('type', type+'%')
            .query(`SELECT DISTINCT
                    iar.art CveArt, iar.lin Linea, iar.des1 Descripcion
                    FROM inviar iar
                    JOIN invars iars ON iar.art = iars.cve_art
                    WHERE iar.des1 LIKE @type 
                    AND iar.des1 NOT LIKE 'PANTENE%' 
                    AND iar.des1 NOT LIKE 'PAÑAL%' 
                    AND iar.des1 NOT LIKE 'PAÑUELOS%' 
                    AND iar.des1 NOT LIKE '%NO USAR%'
                    AND iar.lin IN ('ALIM', 'PERE')
                    ORDER BY iar.art ASC`, async (error, results) => {
                if (results.rowsAffected > 1) {
                    res.send({
                        data:results.recordset,
                        hasData: true
                    });
                } else {
                    res.send({
                        data:results.recordset,
                        hasData: false
                    });
                }
                
            });
        } else {
            res.redirect('/maxmin/');
        }
    },

    storeProductCaptura: function(req, res) {
        if (req.session.loggedin) {
            const product = req.body.product.split(' - ')[0];
            //const subAlm = req.body.product.split(' - ')[1];
            const codigo = req.body.product.split(' - ')[1];
            const type = req.body.type;
            const factor = req.body.factor;
            const quantity = req.body.quantity;
            var date = moment().format('YYYY-MM-DD HH:mm:ss');
            console.log(date);
            var dateToConsult = moment().format('YYYY-MM-DD');
            dateToConsult = dateToConsult.replace(/-/gi, '');

            console.log(`product details: ${product} - ${codigo} - ${type} - ${quantity}`);
            console.log(`dates: ${date} - ${dateToConsult}`);
            console.log(`sucursal: ${req.session.sucursal}`);
            
            new conexion.Request()
            .input('codigo', codigo)
            .input('sucursal', req.session.sucursal)
            .input('dateToConsult', dateToConsult)
            .query(`SELECT * FROM cap_ped
                    WHERE cve_art = @codigo 
                    AND estatus IN ('0', '3') 
                    AND sucursal = @sucursal 
                    AND fec_cre >= @dateToConsult`,
                    async (err, result) => {
                        console.log('result');
                        console.log(result);
                        if (result.rowsAffected != 0 ) {
                            res.send({hasStored: false, productExist: true});
                        } else {
                            console.log('vamos bien');
                            new conexion.Request()
                            .input('type', type)
                            .input('description', product)
                            .input('quantity', quantity)
                            .input('date', date)
                            .input('sucursal', req.session.sucursal)
                            .input('usr', req.session.nombre_lar)
                            .input('codigo', codigo)
                            .input('factor', factor)
                            .query(`INSERT INTO cap_ped 
                                    VALUES (@type, @description, @quantity, @date, @sucursal, @usr, @codigo, @factor, '0')`, async (error, results) => {
                                console.log('Producto insertado');
                                if (results.rowsAffected > 0) {
                                    res.send({hasStored: true, productExist: false});
                                } else {
                                    res.send({hasStored: false, productExist: false});
                                }
                            });
                        }

                        if (err) {
                            console.log('oh rayos!');
                            console.log(err)
                        }
                    });
        } else {
            res.redirect('/maxmin/');
        }
    },

    deleteProductCaptura: function(req, res) {
        if (req.session.loggedin) {
            console.log('entrando en el método para eliminar datos de pedido');
            const id = req.body.id;
            var dateToConsult = moment().format('YYYY-MM-DD');
            dateToConsult = dateToConsult.replace(/-/gi, '');

            new conexion.Request()
            .input('id', id)
            .input('sucursal', req.session.sucursal)
            .input('usr', req.session.nombre_lar)
            .input('dateToConsult', dateToConsult)
            .query(`UPDATE cap_ped
                    SET estatus = '4', usr = @usr
                    WHERE id = @id`, async(err, result) => {
                        console.log('se eliminó');
                        console.log(result);
                        const data = {
                            nombre_lar: req.session.nombre_lar,
                            puesto: req.session.puesto,
                            sucursal: req.session.sucursal,
                            alert: true,
                            alertTitle: "¡Eliminado!",
                            alertText: "Producto eliminado correctamente",
                            alertIcon: "success"
                        }
                        res.send({data:data});
                    });
        } else {
            res.redirect('/maxmin/');
        }
    },

    searchProductVentaNegada: function(req, res) {
        if (req.session.loggedin) {
            // OBTENEMOS VALORES CODIGO Y SUCURSAL PARA REALIZAR BÚSQUEDA
            const sucursal = req.session.sucursal;
            const product = req.body.searchValue;
            // CONFIGURAMOS ALMC, ALMM Y CODE PARA QUE FUNCIONEN COMO CALUSULAS WHERE PARA DEFINIR LA BÚSQUEDA
            //const almC = sucursal+"C";
            //const almM = sucursal+"M";
            var code = product+"%";
            // ACCEDEMOS A LA DB PARA OBTENER DATOS
            new conexion.Request()
            .input('code', code)
            .input('sucursal', sucursal)
            .query(`SELECT DISTINCT TOP 10
                    iar.art CveArt, iars.alm Almacen, iar.lin Linea, iar.des1 Descripcion
                    FROM inviar iar
                    JOIN invart iart ON iar.art = iart.art
                    JOIN invars iars ON iar.art = iars.cve_art
                    WHERE iars.alm = @sucursal AND (iar.art LIKE @code OR iar.des1 LIKE @code)
                    ORDER BY iar.art ASC`, async(error, results) => {
                // SI HEMOS OBTENIDO 1 O MÁS RESULTADOS EN NUESTRA BÚQUEDA, ENVIAMOS INFORMACIÓN
                if (results.rowsAffected>0) {
                    console.log("4. results: ");
                    console.log(results);
                    res.send({data:results.recordset, hasData: true});
                } else {
                    //TODO: Enviar un SweetAlert que diga "Sin existencias"
                }
            });
        } else {
            res.redirect('/maxmin/');
        }
    },

    storeVentaNegada: function(req, res) {
        if (req.session.loggedin) {
            const product = req.body.des_art;
            const codigo = req.body.cve_art;
            const usr = req.session.nombre_lar;
            const sucursal = req.session.sucursal;
            var date = moment().format('YYYY-MM-DD HH:mm:ss');
            var dateToConsult = moment().format('YYYY-MM-DD');
            dateToConsult = dateToConsult.replace(/-/gi, '');

            console.log(`product details: ${product} - ${usr} - ${sucursal}`);
            console.log(`dates: ${date} - ${dateToConsult}`);
            
            new conexion.Request()
            .input('codigo', codigo)
            .input('sucursal', req.session.sucursal)
            .input('dateToConsult', dateToConsult)
            .query(`SELECT * FROM cap_neg
                    WHERE cve_art = @codigo 
                    AND estatus IN ('0', '3') 
                    AND sucursal = @sucursal 
                    AND fec_cre >= @dateToConsult`,
                    async (err, result) => {
                        console.log('result');
                        console.log(result);
                        if (result.rowsAffected != 0 ) {
                            res.send({hasStored: false, productExist: true});
                        } else {
                            console.log('vamos bien');
                            new conexion.Request()
                            .input('codigo', codigo)
                            .input('description', product)
                            .input('date', date)
                            .input('sucursal', sucursal)
                            .input('usr', usr)
                            .query(`INSERT INTO cap_neg
                                    VALUES (@description, @date, @usr, @sucursal, '0', @codigo)`, async (error, results) => {
                                console.log('Venta negada insertada');
                                if (results.rowsAffected > 0) {
                                    res.send({hasStored: true, productExist: false});
                                } else {
                                    res.send({hasStored: false, productExist: false});
                                }
                            });
                        }

                        if (err) {
                            console.log('oh rayos!');
                            console.log(err)
                        }
                    });
        } else {
            res.redirect('/maxmin/');
        }
    }
}
