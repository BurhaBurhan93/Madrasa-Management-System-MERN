const mongoose = require('mongoose');
const KitchenInventory = require('../../models/KitchenInventory');

const safeUserId = (req) =>
  mongoose.isValidObjectId(req.user?.id) ? req.user.id : undefined;
const KitchenPurchase = require('../../models/KitchenPurchase');
const KitchenExpense = require('../../models/KitchenExpense');
const DailyFoodConsumption = require('../../models/DailyFoodConsumption');
const KitchenBudget = require('../../models/KitchenBudget');
const WeeklyMenu = require('../../models/WeeklyMenu');
const Supplier = require('../../models/Supplier');
const KitchenWaste = require('../../models/KitchenWaste');
const Student = require('../../models/Student');

// ==================== INVENTORY ====================

exports.getInventory = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) query.itemName = { $regex: search, $options: 'i' };
    const items = await KitchenInventory.find(query).sort({ itemName: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createInventoryItem = async (req, res) => {
  try {
    const item = await KitchenInventory.create(req.body);
    res.status(201).json({ success: true, message: 'Item added successfully', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await KitchenInventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item updated', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await KitchenInventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PURCHASES ====================

exports.getPurchases = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};
    if (month && year) {
      query.purchaseDate = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59)
      };
    }
    const purchases = await KitchenPurchase.find(query)
      .sort({ purchaseDate: -1 });
    res.json({ success: true, count: purchases.length, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const data = { ...req.body };
    const uid3 = safeUserId(req);
    if (uid3) data.recordedBy = uid3;
    data.totalPrice = data.quantity * data.unitPrice;
    const purchase = await KitchenPurchase.create(data);
    await KitchenInventory.findOneAndUpdate(
      { itemName: data.itemName },
      { $inc: { quantity: data.quantity }, unit: data.unit, unitPrice: data.unitPrice },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true, message: 'Purchase recorded', data: purchase });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePurchase = async (req, res) => {
  try {
    const purchase = await KitchenPurchase.findByIdAndDelete(req.params.id);
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
    res.json({ success: true, message: 'Purchase deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DAILY CONSUMPTION ====================

exports.getDailyConsumption = async (req, res) => {
  try {
    const { date, month, year } = req.query;
    let query = {};
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      query.consumptionDate = { $gte: start, $lte: end };
    } else if (month && year) {
      query.consumptionDate = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59)
      };
    }
    const records = await DailyFoodConsumption.find(query).sort({ consumptionDate: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveStudentCount = async (req, res) => {
  try {
    const count = await Student.countDocuments({ status: 'active', deletedAt: null });
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDailyConsumption = async (req, res) => {
  try {
    const record = await DailyFoodConsumption.create(req.body);
    if (req.body.itemName && req.body.quantityUsed) {
      await KitchenInventory.findOneAndUpdate(
        { itemName: req.body.itemName },
        { $inc: { quantity: -req.body.quantityUsed } }
      );
    }
    res.status(201).json({ success: true, message: 'Consumption recorded', data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateDailyConsumption = async (req, res) => {
  try {
    const record = await DailyFoodConsumption.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record updated', data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteDailyConsumption = async (req, res) => {
  try {
    const record = await DailyFoodConsumption.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== BUDGET ====================

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await KitchenBudget.find().populate('approvedBy', 'name').sort({ year: -1, month: -1 });
    res.json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const budget = await KitchenBudget.create(req.body);
    res.status(201).json({ success: true, message: 'Budget request submitted', data: budget });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.approvedBy && !mongoose.isValidObjectId(payload.approvedBy)) delete payload.approvedBy;
    const budget = await KitchenBudget.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });
    res.json({ success: true, message: 'Budget updated', data: budget });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==================== WEEKLY MENU ====================

exports.getWeeklyMenu = async (req, res) => {
  try {
    const { weekStart } = req.query;
    let query = {};
    if (weekStart) {
      const start = new Date(weekStart); start.setHours(0, 0, 0, 0);
      const end = new Date(weekStart); end.setDate(end.getDate() + 6); end.setHours(23, 59, 59, 999);
      query.weekStartDate = { $gte: start, $lte: end };
    }
    const menu = await WeeklyMenu.find(query).sort({ day: 1, mealType: 1 });
    res.json({ success: true, count: menu.length, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createWeeklyMenu = async (req, res) => {
  try {
    const data = { ...req.body };
    const uid = safeUserId(req);
    if (uid) data.createdBy = uid;
    const menu = await WeeklyMenu.create(data);
    res.status(201).json({ success: true, message: 'Menu item added', data: menu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateWeeklyMenu = async (req, res) => {
  try {
    const menu = await WeeklyMenu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    res.json({ success: true, message: 'Menu updated', data: menu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteWeeklyMenu = async (req, res) => {
  try {
    await WeeklyMenu.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SUPPLIERS ====================

exports.getSuppliers = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    const suppliers = await Supplier.find(query).sort({ name: 1 });
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, message: 'Supplier added', data: supplier });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, message: 'Supplier updated', data: supplier });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSupplierHistory = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    const purchases = await KitchenPurchase.find({ supplier: supplier.name }).sort({ purchaseDate: -1 });
    const totalSpent = purchases.reduce((s, p) => s + p.totalPrice, 0);
    res.json({ success: true, data: { supplier, purchases, totalSpent } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== WASTE ====================

exports.getWaste = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};
    if (month && year) {
      query.wasteDate = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59)
      };
    }
    const waste = await KitchenWaste.find(query).sort({ wasteDate: -1 });
    res.json({ success: true, count: waste.length, data: waste });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createWaste = async (req, res) => {
  try {
    const wasteData = { ...req.body };
    const uid2 = safeUserId(req);
    if (uid2) wasteData.recordedBy = uid2;
    const waste = await KitchenWaste.create(wasteData);
    await KitchenInventory.findOneAndUpdate(
      { itemName: req.body.itemName },
      { $inc: { quantity: -req.body.quantity } }
    );
    res.status(201).json({ success: true, message: 'Waste recorded', data: waste });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteWaste = async (req, res) => {
  try {
    await KitchenWaste.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Waste record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== REPORTS ====================

exports.getReports = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    const dateRange = { $gte: new Date(y, m - 1, 1), $lte: new Date(y, m, 0, 23, 59, 59) };

    const [purchases, consumption, inventory, budget, waste, activeStudents] = await Promise.all([
      KitchenPurchase.find({ purchaseDate: dateRange }),
      DailyFoodConsumption.find({ consumptionDate: dateRange }),
      KitchenInventory.find().select('quantity minimumStock itemName unit'),
      KitchenBudget.findOne({ month: m, year: y }),
      KitchenWaste.find({ wasteDate: dateRange }),
      Student.countDocuments({ status: 'active', deletedAt: null })
    ]);

    const totalPurchases = purchases.reduce((s, p) => s + p.totalPrice, 0);
    const totalWaste = waste.reduce((s, w) => s + w.quantity, 0);
    const totalStudentMeals = consumption.reduce((s, c) => s + c.numberOfStudents, 0);
    const totalStaffMeals = consumption.reduce((s, c) => s + c.numberOfStaff, 0);
    const lowStockItems = inventory.filter(i => i.quantity <= i.minimumStock);

    res.json({
      success: true,
      data: {
        totalPurchases, totalStudentMeals, totalStaffMeals,
        totalMeals: totalStudentMeals + totalStaffMeals,
        lowStockItems: lowStockItems.length,
        totalInventoryItems: inventory.length,
        budget: budget || null,
        purchaseCount: purchases.length,
        consumptionCount: consumption.length,
        totalWasteRecords: waste.length,
        totalWasteQuantity: totalWaste,
        activeStudents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
