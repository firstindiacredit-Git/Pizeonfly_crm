const express = require('express');
const router = express.Router();
const EmployeeDash = require('../model/employeeDashModel');

//Excel Sheet
router.post('/employeeExcelSheet', async (req, res) => {
    try {
        const { tables } = req.body;
        const newExcelSheet = new EmployeeDash({
            excelSheet: JSON.stringify(tables)
        });
        await newExcelSheet.save();
        res.status(201).json(newExcelSheet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/employeeExcelSheet', async (req, res) => {
    try {
        const excelSheet = await EmployeeDash.findOne({ excelSheet: { $exists: true } });
        res.json({ 
            _id: excelSheet?._id,
            tables: excelSheet ? JSON.parse(excelSheet.excelSheet) : [] 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/employeeExcelSheet/:id', async (req, res) => {
    try {
        const { tables } = req.body;
        const updatedExcelSheet = await EmployeeDash.findByIdAndUpdate(
            req.params.id,
            { excelSheet: JSON.stringify(tables) },
            { new: true }
        );
        
        if (!updatedExcelSheet) {
            return res.status(404).json({ message: 'Excel sheet not found' });
        }
        
        res.json({
            _id: updatedExcelSheet._id,
            excelSheet: updatedExcelSheet.excelSheet
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/employeeExcelSheet/:id', async (req, res) => {
    try {
        await EmployeeDash.findByIdAndDelete(req.params.id);
        res.json({ message: 'Excel sheet deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//NotePad
router.post('/employeeNotePad', async (req, res) => {
    try {
        const { notes } = req.body;
        const newNotePad = new EmployeeDash({
            notePad: notes
        });
        await newNotePad.save();
        res.status(201).json(newNotePad);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/employeeNotePad', async (req, res) => {
    try {
        const notePad = await EmployeeDash.findOne({ notePad: { $exists: true } });
        res.json({ notes: notePad ? notePad.notePad : '' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/employeeNotePad/:id', async (req, res) => {
    try {
        const { notes } = req.body;
        const updatedNotePad = await EmployeeDash.findByIdAndUpdate(
            req.params.id,
            { notePad: notes },
            { new: true }
        );
        res.json(updatedNotePad);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/employeeNotePad/:id', async (req, res) => {
    try {
        await EmployeeDash.findByIdAndDelete(req.params.id);
        res.json({ message: 'NotePad deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//Todo List
router.post('/employeeTodoList', async (req, res) => {
    try {
        const { todos } = req.body;
        const newTodoList = new EmployeeDash({
            todoList: JSON.stringify(todos)
        });
        await newTodoList.save();
        res.status(201).json(newTodoList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/employeeTodoList', async (req, res) => {
    try {
        const todoList = await EmployeeDash.findOne({ todoList: { $exists: true } });
        const todos = todoList ? JSON.parse(todoList.todoList) : [];
        res.json({ 
            _id: todoList?._id,
            todos: todos 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/employeeTodoList/:id', async (req, res) => {
    try {
        const { todos } = req.body;
        const updatedTodoList = await EmployeeDash.findByIdAndUpdate(
            req.params.id,
            { todoList: JSON.stringify(todos) },
            { new: true }
        );
        
        if (!updatedTodoList) {
            return res.status(404).json({ message: 'Todo list not found' });
        }
        
        res.json({
            _id: updatedTodoList._id,
            todos: JSON.parse(updatedTodoList.todoList)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/employeeTodoList/:id', async (req, res) => {
    try {
        await EmployeeDash.findByIdAndDelete(req.params.id);
        res.json({ message: 'TodoList deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;