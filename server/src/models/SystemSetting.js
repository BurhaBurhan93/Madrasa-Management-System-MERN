const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
    enum: ['academic', 'notifications', 'security', 'backup', 'api']
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
