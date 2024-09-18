const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },
  empId: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;


/*
1.
 senderId: {type: String, required: true},
 recieverId: {type: String, required: true},
 adminId: {type: mongoose.Schema.Types.ObjectId, ref: "Admin"}


 let chat = Chat.find();
 for(let i of chat){
  const sender = Emplloyee.find({_id: i.senderId})
 }

2. 
  adminId: {type: mongoose.Schema.Types.ObjectId, ref: "Admin"}
 empId: {type: mongoose.Schema.Types.ObjectId, ref: "Employee"}
 senderId: {type: String, required: true}
 */