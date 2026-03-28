const Exam = require('../../models/Exam');
const ExamQuestion = require('../../models/ExamQuestion');
const ExamAnswer = require('../../models/ExamAnswer');
const Student = require('../../models/Student');

// ==================== TEACHER — EXAMS ====================

exports.getExams = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { status } = req.query;
    let query = { createdBy: teacherId };
    if (status) query.status = status;
    const exams = await Exam.find(query)
      .populate('subject', 'name')
      .populate('class', 'name section')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('subject', 'name')
      .populate('class', 'name section');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    const questions = await ExamQuestion.find({ exam: req.params.id });
    res.json({ success: true, data: { ...exam.toObject(), questions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create({ ...req.body, createdBy: req.user.id, status: 'draft' });
    res.status(201).json({ success: true, message: 'Exam created', data: exam });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, message: 'Exam updated', data: exam });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    await ExamQuestion.deleteMany({ exam: req.params.id });
    res.json({ success: true, message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.publishExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const questions = await ExamQuestion.find({ exam: req.params.id });
    if (questions.length === 0) return res.status(400).json({ success: false, message: 'Add at least one question before publishing' });

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    exam.status = 'published';
    exam.totalMarks = totalMarks;
    await exam.save();

    res.json({ success: true, message: 'Exam published', data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.closeExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, { status: 'finished' }, { new: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, message: 'Exam closed', data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== TEACHER — QUESTIONS ====================

exports.addQuestion = async (req, res) => {
  try {
    const question = await ExamQuestion.create({ ...req.body, exam: req.params.examId, createdBy: req.user.id });
    // update totalMarks
    const questions = await ExamQuestion.find({ exam: req.params.examId });
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    await Exam.findByIdAndUpdate(req.params.examId, { totalMarks });
    res.status(201).json({ success: true, message: 'Question added', data: question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const question = await ExamQuestion.findByIdAndUpdate(req.params.questionId, req.body, { new: true });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    const questions = await ExamQuestion.find({ exam: req.params.examId });
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    await Exam.findByIdAndUpdate(req.params.examId, { totalMarks });
    res.json({ success: true, message: 'Question updated', data: question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await ExamQuestion.findByIdAndDelete(req.params.questionId);
    const questions = await ExamQuestion.find({ exam: req.params.examId });
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    await Exam.findByIdAndUpdate(req.params.examId, { totalMarks });
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = await ExamQuestion.find({ exam: req.params.examId });
    res.json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== TEACHER — SUBMISSIONS ====================

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await ExamAnswer.find({ exam: req.params.examId })
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .sort({ submittedAt: -1 });
    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STUDENT — EXAM ATTEMPT ====================

exports.getPublishedExams = async (req, res) => {
  try {
    const exams = await Exam.find({ status: 'published' })
      .populate('subject', 'name')
      .populate('class', 'name section')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExamForAttempt = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, status: 'published' })
      .populate('subject', 'name')
      .populate('class', 'name section');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not available' });

    // hide correct answers from student
    const questions = await ExamQuestion.find({ exam: req.params.id })
      .select('-correctAnswer -answer');

    res.json({ success: true, data: { ...exam.toObject(), questions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findOne({ user: studentId });
    if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });

    const existing = await ExamAnswer.findOne({ exam: req.params.id, student: student._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already submitted this exam' });

    const exam = await Exam.findById(req.params.id);
    if (!exam || exam.status !== 'published') return res.status(400).json({ success: false, message: 'Exam not available' });

    const questions = await ExamQuestion.find({ exam: req.params.id });
    const { answers } = req.body; // { questionId: answer }

    let score = 0;
    questions.forEach(q => {
      if (q.questionType === 'mcq' || q.questionType === 'truefalse') {
        if (answers[q._id] && answers[q._id].toLowerCase() === q.correctAnswer?.toLowerCase()) {
          score += q.marks || 0;
        }
      }
    });

    const submission = await ExamAnswer.create({
      exam: req.params.id,
      student: student._id,
      answers,
      score,
      totalMarks: exam.totalMarks,
      submittedAt: new Date()
    });

    res.status(201).json({ success: true, message: 'Exam submitted successfully', data: { score, totalMarks: exam.totalMarks } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMySubmission = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const submission = await ExamAnswer.findOne({ exam: req.params.id, student: student._id });
    res.json({ success: true, data: submission || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
