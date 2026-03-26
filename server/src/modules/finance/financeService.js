const Transaction = require('../../models/Transaction');
const Account = require('../../models/Account');
const mongoose = require('mongoose');

const generateTransactionCode = () => {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TXN-${stamp}-${rand}`;
};

const toNumber = (value, fallback = null) => {
  if (value === undefined || value === null || value === '') return fallback;
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

class FinanceService {
  async listTransactions(filters = {}) {
    const query = {};

    if (filters.type && ['income', 'expense'].includes(filters.type)) {
      query.transactionType = filters.type;
    }

    if (filters.status && ['pending', 'verified', 'rejected'].includes(filters.status)) {
      query.verificationStatus = filters.status;
    }

    if (filters.accountId && mongoose.isValidObjectId(filters.accountId)) {
      query.account = filters.accountId;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.transactionDate = {};
      if (filters.dateFrom) query.transactionDate.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.transactionDate.$lte = new Date(filters.dateTo);
    }

    const minAmount = toNumber(filters.minAmount, null);
    const maxAmount = toNumber(filters.maxAmount, null);
    if (minAmount !== null || maxAmount !== null) {
      query.amount = {};
      if (minAmount !== null) query.amount.$gte = minAmount;
      if (maxAmount !== null) query.amount.$lte = maxAmount;
    }

    if (filters.search) {
      const safe = String(filters.search).trim();
      if (safe.length > 0) {
        query.$or = [
          { transactionCode: { $regex: safe, $options: 'i' } },
          { referenceType: { $regex: safe, $options: 'i' } },
          { description: { $regex: safe, $options: 'i' } }
        ];
      }
    }

    const page = Math.max(1, toNumber(filters.page, 1));
    const limit = Math.min(200, Math.max(1, toNumber(filters.limit, 20)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Transaction.find(query)
        .populate('account', 'accountCode accountName')
        .populate('performedBy', 'name email')
        .populate('verifiedBy', 'name email')
        .sort({ transactionDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(query)
    ]);

    return { data, total, page, limit };
  }

  async getTransactionById(id) {
    return await Transaction.findById(id)
      .populate('account', 'accountCode accountName')
      .populate('performedBy', 'name email')
      .populate('verifiedBy', 'name email');
  }

  async resolveAccount(body = {}) {
    if (body.account && mongoose.isValidObjectId(body.account)) {
      const acc = await Account.findById(body.account);
      if (!acc) throw new Error('Account not found');
      return acc;
    }

    if (body.accountCode) {
      const acc = await Account.findOne({ accountCode: body.accountCode.trim() });
      if (!acc) throw new Error('Account not found with provided accountCode');
      return acc;
    }

    // Fallback to default account to avoid creation failures
    let acc = await Account.findOne({ accountCode: 'MAIN' });
    if (!acc) {
      acc = await Account.create({
        accountCode: 'MAIN',
        accountName: 'Main Account',
        accountType: 'cash',
        openingBalance: 0,
        currentBalance: 0,
        currency: 'USD',
        status: 'active',
        createdBy: body.performedBy || null
      });
    }
    return acc;
  }

  async createTransaction(payload) {
    const account = await this.resolveAccount(payload);

    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    const transactionType = payload.transactionType;
    if (!['income', 'expense'].includes(transactionType)) {
      throw new Error('Invalid transaction type');
    }

    const transactionCode = payload.transactionCode ? payload.transactionCode.trim() : generateTransactionCode();
    if (payload.verificationStatus && !['pending', 'verified', 'rejected'].includes(payload.verificationStatus)) {
      throw new Error('Invalid verification status');
    }

    const impact = transactionType === 'income' ? amount : -amount;
    const balanceAfter = (account.currentBalance || 0) + impact;

    const transaction = await Transaction.create({
      transactionCode,
      account: account._id,
      transactionType,
      amount,
      transactionDate: payload.transactionDate ? new Date(payload.transactionDate) : new Date(),
      referenceType: payload.referenceType || '',
      referenceId: payload.referenceId || null,
      balanceAfter,
      performedBy: payload.performedBy || null,
      verifiedBy: payload.verifiedBy || null,
      verificationStatus: payload.verificationStatus || 'verified',
      description: payload.description || ''
    });

    account.currentBalance = balanceAfter;
    await account.save();

    return transaction;
  }

  async updateTransaction(id, payload) {
    const existing = await Transaction.findById(id);
    if (!existing) return null;

    const oldAccount = await Account.findById(existing.account);
    if (!oldAccount) throw new Error('Account not found for existing transaction');

    const newAccount = payload.account || payload.accountCode ? await this.resolveAccount(payload) : oldAccount;

    const newAmount = payload.amount !== undefined ? Number(payload.amount) : existing.amount;
    if (!Number.isFinite(newAmount) || newAmount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    const newType = payload.transactionType || existing.transactionType;
    if (!['income', 'expense'].includes(newType)) {
      throw new Error('Invalid transaction type');
    }
    if (payload.verificationStatus && !['pending', 'verified', 'rejected'].includes(payload.verificationStatus)) {
      throw new Error('Invalid verification status');
    }

    // Roll back old impact
    const oldImpact = existing.transactionType === 'income' ? existing.amount : -existing.amount;
    oldAccount.currentBalance = (oldAccount.currentBalance || 0) - oldImpact;
    await oldAccount.save();

    // Apply new impact
    const newImpact = newType === 'income' ? newAmount : -newAmount;
    const newBalance = (newAccount.currentBalance || 0) + newImpact;

    newAccount.currentBalance = newBalance;
    await newAccount.save();

    existing.transactionCode = payload.transactionCode ? payload.transactionCode.trim() : existing.transactionCode;
    existing.account = newAccount._id;
    existing.transactionType = newType;
    existing.amount = newAmount;
    existing.transactionDate = payload.transactionDate ? new Date(payload.transactionDate) : existing.transactionDate;
    existing.referenceType = payload.referenceType !== undefined ? payload.referenceType : existing.referenceType;
    existing.referenceId = payload.referenceId !== undefined ? payload.referenceId : existing.referenceId;
    existing.balanceAfter = newBalance;
    existing.performedBy = payload.performedBy !== undefined ? payload.performedBy : existing.performedBy;
    existing.verifiedBy = payload.verifiedBy !== undefined ? payload.verifiedBy : existing.verifiedBy;
    existing.verificationStatus = payload.verificationStatus || existing.verificationStatus;
    existing.description = payload.description !== undefined ? payload.description : existing.description;

    await existing.save();
    return existing;
  }

  async deleteTransaction(id) {
    const transaction = await Transaction.findById(id);
    if (!transaction) return null;

    const account = await Account.findById(transaction.account);
    if (!account) throw new Error('Account not found for transaction');

    const impact = transaction.transactionType === 'income' ? transaction.amount : -transaction.amount;
    account.currentBalance = (account.currentBalance || 0) - impact;
    await account.save();

    await transaction.deleteOne();
    return transaction;
  }
}

module.exports = new FinanceService();
