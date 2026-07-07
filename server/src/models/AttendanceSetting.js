const mongoose = require('mongoose');

const attendanceSettingSchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true },
  workingDays: { type: [String], default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
  schoolStartTime: { type: String, default: '08:00' },
  schoolEndTime: { type: String, default: '14:00' },
  lateThreshold: { type: Number, default: 15 },
  absenceThreshold: { type: Number, default: 3 },
  autoNotification: { type: Boolean, default: true },
  notificationEmail: { type: String, default: '' },
  hrEmail: { type: String, default: '' },
  adminEmails: { type: [String], default: [] },
  periodDuration: { type: Number, default: 45 },
  breakDuration: { type: Number, default: 15 },
  allowManualOverride: { type: Boolean, default: true },
  requireApproval: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('AttendanceSetting', attendanceSettingSchema);
