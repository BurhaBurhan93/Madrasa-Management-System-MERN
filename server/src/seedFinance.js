const connectDB = require('./config/db');
const Transaction = require('./models/Transaction');
const Account = require('./models/Account');
const User = require('./models/User');
require('dotenv').config();

const seedFinance = async () => {
  try {
    await connectDB();

    const admin = await User.findOne({ role: 'admin' });

    let account = await Account.findOne({ accountCode: 'MAIN' });
    if (!account) {
      account = await Account.create({
        accountCode: 'MAIN',
        accountName: 'Main Account',
        accountType: 'cash',
        openingBalance: 0,
        currentBalance: 0,
        currency: 'USD',
        status: 'active',
        createdBy: admin?._id || null
      });
    } else {
      account.currentBalance = 0;
      await account.save();
    }

    await Transaction.deleteMany({});

    const types = ['income', 'expense'];
    const refs = ['Fee Collection', 'Salary', 'Books', 'Maintenance', 'Utilities', 'Equipment'];
    const statuses = ['verified', 'pending', 'rejected'];

    let balance = account.currentBalance || 0;

    for (let i = 0; i < 12; i++) {
      const amount = 1000 + i * 250;
      const transactionType = types[i % 2];
      const impact = transactionType === 'income' ? amount : -amount;
      balance += impact;

      await Transaction.create({
        transactionCode: `TXN-SEED-${Date.now()}-${i}`,
        account: account._id,
        transactionType,
        amount,
        transactionDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        referenceType: refs[i % refs.length],
        balanceAfter: balance,
        performedBy: admin?._id || null,
        verifiedBy: admin?._id || null,
        verificationStatus: statuses[i % statuses.length],
        description: `Seeded finance transaction ${i + 1} for ${refs[i % refs.length]}`
      });
    }

    account.currentBalance = balance;
    await account.save();

    console.log('? Finance seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('? Finance seeding failed:', error);
    process.exit(1);
  }
};

seedFinance();
