const Message = require('../models/Message');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

// ================= MESSAGES =================

// Get all messages for the current user
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      recipient: req.user.id,
      isDeletedByRecipient: false
    })
    .populate('sender', 'name email role')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientRole, recipient: recipientInput, subject, title, content } = req.body;
    const targetRole = recipientRole || recipientInput || 'admin';
    const messageSubject = subject || title;

    if (!messageSubject || !content) {
      return res.status(400).json({ success: false, message: 'Subject and content are required' });
    }
    
    // Find a recipient based on role (e.g., admin or teacher)
    // In a real app, you might want to specify which teacher or admin
    let recipient;
    if (targetRole === 'admin') {
      recipient = await User.findOne({ role: 'admin' });
    } else if (targetRole === 'teacher') {
      // For now, just find any teacher
      recipient = await User.findOne({ role: 'teacher' });
    } else if (targetRole === 'staff') {
      recipient = await User.findOne({ role: 'staff' });
    }

    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      recipient: recipient._id,
      subject: messageSubject,
      content
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { status: 'read' },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= ANNOUNCEMENTS =================

// Get announcements for the current user's role
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      isActive: true,
      $and: [
        {
          $or: [
            { targetRoles: req.user.role },
            { targetRoles: { $size: 0 } } // empty means for all roles
          ]
        },
        {
          $or: [
            { expiresAt: { $gt: new Date() } },
            { expiresAt: null },
            { expiresAt: { $exists: false } }
          ]
        }
      ]
    })
    .populate('createdBy', 'name role')
    .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create an announcement (Admin/Staff only)
exports.createAnnouncement = async (req, res) => {
  try {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { title, content, priority, targetRoles, expiresAt } = req.body;

    const newAnnouncement = new Announcement({
      title,
      content,
      priority,
      targetRoles,
      expiresAt,
      createdBy: req.user.id
    });

    await newAnnouncement.save();

    res.status(201).json({
      success: true,
      data: newAnnouncement
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
