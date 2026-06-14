const Notification = require('../../models/Notification');
const User = require('../../models/User');

/**
 * Notification Service
 * Used by other modules to create notifications when events occur.
 */
class NotificationService {

  /**
   * Create a notification for a specific user
   */
  async create({ recipient, type = 'info', title, message, category = 'system', link = '', data = {} }) {
    try {
      const notification = await Notification.create({
        recipient,
        type,
        title,
        message,
        category,
        link,
        data
      });
      return notification;
    } catch (error) {
      console.error('[NotificationService] Error creating notification:', error.message);
      return null;
    }
  }

  /**
   * Send notification to all users with specific roles
   */
  async notifyRoles(roles, { type = 'info', title, message, category = 'system', link = '', data = {} }) {
    try {
      const users = await User.find({ role: { $in: roles }, deletedAt: null, status: 'active' }).select('_id');
      if (users.length === 0) return;

      const notifications = users.map(u => ({
        recipient: u._id,
        type, title, message, category, link, data
      }));

      // Bulk insert (limit to 500 to avoid memory issues)
      const batch = notifications.slice(0, 500);
      await Notification.insertMany(batch, { ordered: false });
    } catch (error) {
      console.error('[NotificationService] Error sending role notifications:', error.message);
    }
  }

  /**
   * Send notification to all admins
   */
  async notifyAdmins(payload) {
    return this.notifyRoles(['admin'], payload);
  }

  /**
   * Send notification when a new user is created
   */
  async onUserCreated(user, createdBy) {
    const roleLabels = { student: 'Student', teacher: 'Teacher', staff: 'Staff', admin: 'Admin' };
    const label = roleLabels[user.role] || user.role;

    // Notify all admins about new user creation
    await this.notifyAdmins({
      type: 'success',
      title: `New ${label} Created`,
      message: `${user.name} (${user.email}) has been registered as a ${label.toLowerCase()}.`,
      category: 'user',
      link: '/admin/users',
      data: { userId: user._id, role: user.role }
    });
  }

  /**
   * Send notification when a user is deleted
   */
  async onUserDeleted(user, deletedBy) {
    await this.notifyAdmins({
      type: 'warning',
      title: 'User Deleted',
      message: `${user.name} (${user.email}) has been removed from the system.`,
      category: 'user',
      link: '/admin/users',
      data: { userId: user._id }
    });
  }

  /**
   * Send notification when a student is registered
   */
  async onStudentRegistered(student) {
    await this.notifyAdmins({
      type: 'info',
      title: 'New Student Registered',
      message: `Student "${student.firstName || ''} ${student.lastName || ''}" (Code: ${student.studentCode}) has been registered.`,
      category: 'student',
      link: '/admin/users',
      data: { studentId: student._id }
    });
  }

  /**
   * Send notification when an employee is registered
   */
  async onEmployeeRegistered(employee) {
    await this.notifyAdmins({
      type: 'info',
      title: 'New Employee Registered',
      message: `Employee "${employee.fullName}" (Code: ${employee.employeeCode}) has been registered as ${employee.employeeType}.`,
      category: 'employee',
      link: '/staff/hr/employees',
      data: { employeeId: employee._id }
    });
  }
}

module.exports = new NotificationService();
