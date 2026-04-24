const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ctrl = require('./kitchenController');

router.use(auth);

router.get('/inventory', ctrl.getInventory);
router.post('/inventory', ctrl.createInventoryItem);
router.put('/inventory/:id', ctrl.updateInventoryItem);
router.delete('/inventory/:id', ctrl.deleteInventoryItem);

router.get('/purchases', ctrl.getPurchases);
router.post('/purchases', ctrl.createPurchase);
router.delete('/purchases/:id', ctrl.deletePurchase);

router.get('/consumption', ctrl.getDailyConsumption);
router.get('/consumption/student-count', ctrl.getActiveStudentCount);
router.post('/consumption', ctrl.createDailyConsumption);
router.put('/consumption/:id', ctrl.updateDailyConsumption);
router.delete('/consumption/:id', ctrl.deleteDailyConsumption);

router.get('/budgets', ctrl.getBudgets);
router.post('/budgets', ctrl.createBudget);
router.put('/budgets/:id', ctrl.updateBudget);

router.get('/menu', ctrl.getWeeklyMenu);
router.post('/menu', ctrl.createWeeklyMenu);
router.put('/menu/:id', ctrl.updateWeeklyMenu);
router.delete('/menu/:id', ctrl.deleteWeeklyMenu);

router.get('/suppliers', ctrl.getSuppliers);
router.post('/suppliers', ctrl.createSupplier);
router.put('/suppliers/:id', ctrl.updateSupplier);
router.delete('/suppliers/:id', ctrl.deleteSupplier);
router.get('/suppliers/:id/history', ctrl.getSupplierHistory);

router.get('/waste', ctrl.getWaste);
router.post('/waste', ctrl.createWaste);
router.delete('/waste/:id', ctrl.deleteWaste);

router.get('/reports', ctrl.getReports);

module.exports = router;
