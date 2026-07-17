const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'Review', 'Done'], 
    default: 'To Do' 
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  storyPoints: { type: Number, default: 0 },
  comments: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);