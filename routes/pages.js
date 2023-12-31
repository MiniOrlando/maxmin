var express = require('express');
var router = express.Router();
const pagesController = require("../controllers/pagesController")

/* GET home page. */
router.get('/maxmin', pagesController.maxmin);
router.post('/maxmin', pagesController.auth);
router.get('/captura', pagesController.captura);
router.get('/negada', pagesController.negada);
router.get('/rebajas', pagesController.rebajas);
router.get('/updateTablaMaxmin', pagesController.updateTablaMaxmin);
router.get('/updatePedidos', pagesController.updatePedidos);
router.post('/getProductData', pagesController.getProductData);
router.post('/getTopTenProductsData', pagesController.getTopTenProductsData);
router.post('/getProductDataById', pagesController.getProductDataById);
router.post('/editarDatosMM', pagesController.editarDatosMM);
router.post('/guardarDatosMM', pagesController.guardarDatosMM);
router.post('/eliminarDatosMM', pagesController.eliminarDatosMM);
router.post('/getProductsCaptura', pagesController.getProductsCaptura);
router.post('/storeProductCaptura', pagesController.storeProductCaptura);
router.post('/deleteProductCaptura', pagesController.deleteProductCaptura);
router.post('/searchProductVentaNegada', pagesController.searchProductVentaNegada);
router.post('/storeVentaNegada', pagesController.storeVentaNegada);

module.exports = router;
