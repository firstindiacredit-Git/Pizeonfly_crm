const express = require('express');
const Chat = require('../model/chatModel');


// Create a new Chat 
exports.createTaskChat = async (req, res) => {
  try {
    // const { taskId, senderId, adminId, empId, message } = req.body;
    const isOkPayload = validatePayload(req.body, ["taskId", "senderId", "adminId", "empId", "message"]);
    if (!isOkPayload) return res.status(200).send({ valid: false, message: "Invalid payload" })
    const newChat = await Chat.create(req.body);
    res.status(201).json(newChat);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.getTaskChat = async (req, res) => {
  const params = req.params;
  const isOk = validatePayload(params, ["taskId"])
  const { taskId } = params;
  if (!isOk) return res.send({ valid: false, message: "TaskId is required" });
  if (!isValidObjectId(taskId)) return res.send({ valid: false, message: "Invalid taskId" })

  try {
    const taskChat = await Chat.find({ taskId: taskId });
    return res.status(200).send(taskChat);
  } catch (err) {
    return res.sendStatus(500);
  }

}