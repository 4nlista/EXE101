const ProjectHistory = require('../models/ProjectHistory');
const User = require('../models/User');

const createProjectHistory = async (userId, data) => {
  const newProjectHistory = new ProjectHistory({
    ...data,
    userId
  });

  const savedHistory = await newProjectHistory.save();

  await User.findByIdAndUpdate(userId, {
    $push: { projectHistory: savedHistory._id }
  });

  return savedHistory;
};

const updateProjectHistory = async (userId, historyId, data) => {
  const history = await ProjectHistory.findOne({ _id: historyId, userId });
  
  if (!history) {
    throw new Error('Không tìm thấy lịch sử dự án hoặc bạn không có quyền chỉnh sửa.');
  }

  const updatedHistory = await ProjectHistory.findByIdAndUpdate(
    historyId,
    { $set: data },
    { new: true, runValidators: true }
  );

  return updatedHistory;
};

const deleteProjectHistory = async (userId, historyId) => {
  const history = await ProjectHistory.findOne({ _id: historyId, userId });
  
  if (!history) {
    throw new Error('Không tìm thấy lịch sử dự án hoặc bạn không có quyền xóa.');
  }

  await ProjectHistory.findByIdAndDelete(historyId);

  await User.findByIdAndUpdate(userId, {
    $pull: { projectHistory: historyId }
  });

  return true;
};

module.exports = {
  createProjectHistory,
  updateProjectHistory,
  deleteProjectHistory
};
