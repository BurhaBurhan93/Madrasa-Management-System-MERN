const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id }).sort({ date: -1 });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, date, time, location, description, type } = req.body;
    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Title and date are required' });
    }

    const newEvent = new Event({
      title,
      date,
      time,
      location,
      description,
      type,
      createdBy: req.user.id
    });

    await newEvent.save();
    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
