const HostelRoom = require('../../models/HostelRoom');
const HostelAllocation = require('../../models/HostelAllocation');
const HostelMeal = require('../../models/HostelMeal');
const HostelMealAttendance = require('../../models/HostelMealAttendance');
const Student = require('../../models/Student');

// ==================== ROOM CONTROLLERS ====================

const getAllRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, building } = req.query;
    const query = { deletedAt: null };
    
    if (status) query.status = status;
    if (building) query.building = building;
    if (search) {
      query.$or = [
        { roomNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const rooms = await HostelRoom.find(query)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ building: 1, roomNumber: 1 });
    
    const count = await HostelRoom.countDocuments(query);
    
    res.json({
      success: true,
      data: rooms,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await HostelRoom.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!room || room.deletedAt) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const room = new HostelRoom({
      ...req.body,
      createdBy: req.user?._id
    });
    await room.save();
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const room = await HostelRoom.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?._id },
      { new: true }
    );
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await HostelRoom.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await HostelRoom.find({ 
      status: 'available', 
      deletedAt: null 
    }).sort({ building: 1, roomNumber: 1 });
    
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ALLOCATION CONTROLLERS ====================

const getAllAllocations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const query = { deletedAt: null };
    
    if (status) query.status = status;
    
    const allocations = await HostelAllocation.find(query)
      .populate('student', 'firstName lastName studentCode phone')
      .populate('room', 'roomNumber building floor')
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ checkInDate: -1 });
    
    const count = await HostelAllocation.countDocuments(query);
    
    res.json({
      success: true,
      data: allocations,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllocationById = async (req, res) => {
  try {
    const allocation = await HostelAllocation.findById(req.params.id)
      .populate('student', 'firstName lastName studentCode phone email')
      .populate('room', 'roomNumber building floor amenities')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!allocation || allocation.deletedAt) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }
    
    res.json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAllocation = async (req, res) => {
  try {
    const { student, room, ...allocationData } = req.body;
    
    // Check if student already has an active allocation
    const existingAllocation = await HostelAllocation.findOne({
      student,
      status: 'active',
      deletedAt: null
    });
    
    if (existingAllocation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student already has an active hostel allocation' 
      });
    }
    
    // Check room availability
    const roomDoc = await HostelRoom.findById(room);
    if (!roomDoc || roomDoc.status !== 'available') {
      return res.status(400).json({ 
        success: false, 
        message: 'Room is not available' 
      });
    }
    
    const allocation = new HostelAllocation({
      student,
      room,
      ...allocationData,
      createdBy: req.user?._id
    });
    await allocation.save();
    
    // Update room occupancy
    roomDoc.currentOccupancy += 1;
    if (roomDoc.currentOccupancy >= roomDoc.capacity) {
      roomDoc.status = 'occupied';
    }
    await roomDoc.save();
    
    // Update student hostel status
    await Student.findByIdAndUpdate(student, {
      isHostelResident: true,
      hostelRoom: room,
      hostelCheckInDate: allocationData.checkInDate || new Date()
    });
    
    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateAllocation = async (req, res) => {
  try {
    const allocation = await HostelAllocation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?._id },
      { new: true }
    );
    
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }
    
    res.json({ success: true, data: allocation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAllocation = async (req, res) => {
  try {
    const allocation = await HostelAllocation.findById(req.params.id);
    
    if (!allocation || allocation.deletedAt) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }
    
    // Update room occupancy
    const room = await HostelRoom.findById(allocation.room);
    if (room) {
      room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
      if (room.currentOccupancy < room.capacity) {
        room.status = 'available';
      }
      await room.save();
    }
    
    // Update student hostel status
    await Student.findByIdAndUpdate(allocation.student, {
      isHostelResident: false,
      hostelRoom: null,
      hostelCheckInDate: null
    });
    
    allocation.deletedAt = new Date();
    await allocation.save();
    
    res.json({ success: true, message: 'Allocation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkoutAllocation = async (req, res) => {
  try {
    const allocation = await HostelAllocation.findById(req.params.id);
    
    if (!allocation || allocation.deletedAt) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }
    
    allocation.status = 'checked-out';
    allocation.actualCheckOutDate = new Date();
    allocation.updatedBy = req.user?._id;
    await allocation.save();
    
    // Update room occupancy
    const room = await HostelRoom.findById(allocation.room);
    if (room) {
      room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
      if (room.currentOccupancy < room.capacity) {
        room.status = 'available';
      }
      await room.save();
    }
    
    // Update student hostel status
    await Student.findByIdAndUpdate(allocation.student, {
      isHostelResident: false,
      hostelRoom: null,
      hostelCheckInDate: null
    });
    
    res.json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== MEAL CONTROLLERS ====================

const getAllMeals = async (req, res) => {
  try {
    const { page = 1, limit = 10, date, mealType } = req.query;
    const query = { deletedAt: null };
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }
    if (mealType) query.mealType = mealType;
    
    const meals = await HostelMeal.find(query)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1, mealType: 1 });
    
    const count = await HostelMeal.countDocuments(query);
    
    res.json({
      success: true,
      data: meals,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMealById = async (req, res) => {
  try {
    const meal = await HostelMeal.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!meal || meal.deletedAt) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    
    res.json({ success: true, data: meal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createMeal = async (req, res) => {
  try {
    const meal = new HostelMeal({
      ...req.body,
      createdBy: req.user?._id
    });
    await meal.save();
    res.status(201).json({ success: true, data: meal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateMeal = async (req, res) => {
  try {
    const meal = await HostelMeal.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?._id },
      { new: true }
    );
    
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    
    res.json({ success: true, data: meal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteMeal = async (req, res) => {
  try {
    const meal = await HostelMeal.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    
    res.json({ success: true, message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUpcomingMeals = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const meals = await HostelMeal.find({
      date: { $gte: today, $lte: nextWeek },
      deletedAt: null
    }).sort({ date: 1, mealType: 1 });
    
    res.json({ success: true, data: meals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== MEAL ATTENDANCE CONTROLLERS ====================

const getMealAttendance = async (req, res) => {
  try {
    const { mealId, date } = req.query;
    const query = {};
    
    if (mealId) query.meal = mealId;
    
    const attendance = await HostelMealAttendance.find(query)
      .populate('student', 'firstName lastName studentCode')
      .populate('meal', 'mealType date')
      .populate('markedBy', 'name')
      .sort({ markedAt: -1 });
    
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { student, meal, status } = req.body;
    
    let attendance = await HostelMealAttendance.findOne({ student, meal });
    
    if (attendance) {
      attendance.status = status;
      attendance.markedAt = new Date();
      attendance.markedBy = req.user?._id;
    } else {
      attendance = new HostelMealAttendance({
        student,
        meal,
        status,
        markedBy: req.user?._id
      });
    }
    
    await attendance.save();
    
    // Update meal attendance count
    const mealDoc = await HostelMeal.findById(meal);
    if (mealDoc) {
      const presentCount = await HostelMealAttendance.countDocuments({
        meal,
        status: 'present'
      });
      mealDoc.attendedCount = presentCount;
      await mealDoc.save();
    }
    
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STUDENT HOSTEL CONTROLLERS ====================

const getStudentHostelInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const student = await Student.findOne({ user: userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    if (!student.isHostelResident) {
      return res.json({
        success: true,
        data: { isResident: false }
      });
    }
    
    const allocation = await HostelAllocation.findOne({
      student: student._id,
      status: 'active',
      deletedAt: null
    }).populate('room');
    
    res.json({
      success: true,
      data: {
        isResident: true,
        student: student,
        room: allocation?.room,
        allocation: allocation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Rooms
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
  
  // Allocations
  getAllAllocations,
  getAllocationById,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  checkoutAllocation,
  
  // Meals
  getAllMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  getUpcomingMeals,
  
  // Meal Attendance
  getMealAttendance,
  markAttendance,
  
  // Student
  getStudentHostelInfo
};
