const projectHistoryService = require('../services/projectHistoryService');

const createProjectHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = req.body;
    
    // Clean data if type is personal
    if (data.type === 'personal') {
      delete data.role;
      delete data.task;
    }

    const newHistory = await projectHistoryService.createProjectHistory(userId, data);
    res.status(201).json({ success: true, data: newHistory });
  } catch (err) {
    next(err);
  }
};

const updateProjectHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const data = req.body;

    // Clean data if type is personal
    if (data.type === 'personal') {
      data.role = undefined;
      data.task = undefined;
    }

    const updatedHistory = await projectHistoryService.updateProjectHistory(userId, id, data);
    res.status(200).json({ success: true, data: updatedHistory });
  } catch (err) {
    if (err.message.includes('Không tìm thấy')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};

const deleteProjectHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await projectHistoryService.deleteProjectHistory(userId, id);
    res.status(200).json({ success: true, message: 'Đã xóa lịch sử dự án' });
  } catch (err) {
    if (err.message.includes('Không tìm thấy')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};

module.exports = {
  createProjectHistory,
  updateProjectHistory,
  deleteProjectHistory
};
