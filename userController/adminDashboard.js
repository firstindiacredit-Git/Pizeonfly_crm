const express = require('express');
const router = express.Router();
const AdminDash = require('../userModel/adminDashModel');

// Excel Sheet
router.post('/adminExcelSheet', async (req, res) => {
    try {
        const { tables, userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        let existingSheet = await AdminDash.findOne({ 
            userId: userId,
            excelSheet: { $exists: true }
        });

        if (existingSheet) {
            existingSheet.excelSheet = JSON.stringify(tables);
            await existingSheet.save();
            res.json({
                _id: existingSheet._id,
                tables: JSON.parse(existingSheet.excelSheet)
            });
        } else {
            const newExcelSheet = new AdminDash({
                userId: userId,
                excelSheet: JSON.stringify(tables)
            });
            await newExcelSheet.save();
            res.status(201).json({
                _id: newExcelSheet._id,
                tables: JSON.parse(newExcelSheet.excelSheet)
            });
        }
    } catch (error) {
        console.error('Excel Sheet Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// NotePad
router.post('/adminNotePad', async (req, res) => {
    try {
        const { notes, userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        let existingNotePad = await AdminDash.findOne({ 
            userId: userId,
            notePad: { $exists: true }
        });

        if (existingNotePad) {
            existingNotePad.notePad = notes;
            await existingNotePad.save();
            res.json({
                _id: existingNotePad._id,
                notes: existingNotePad.notePad
            });
        } else {
            const newNotePad = new AdminDash({
                userId: userId,
                notePad: notes
            });
            await newNotePad.save();
            res.status(201).json({
                _id: newNotePad._id,
                notes: newNotePad.notePad
            });
        }
    } catch (error) {
        console.error('NotePad Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Todo List
router.post('/adminTodoList', async (req, res) => {
    try {
        const { todos, userId } = req.body;
        const newTodoList = new AdminDash({
            userId,
            todoList: JSON.stringify(todos)
        });
        await newTodoList.save();
        res.status(201).json(newTodoList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET routes
router.get('/adminExcelSheet/:userId', async (req, res) => {
    try {
        const excelSheet = await AdminDash.findOne({ 
            userId: req.params.userId,
            excelSheet: { $exists: true } 
        });
        res.json({ 
            _id: excelSheet?._id,
            tables: excelSheet ? JSON.parse(excelSheet.excelSheet) : [] 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/adminNotePad/:userId', async (req, res) => {
    try {
        const notePad = await AdminDash.findOne({ 
            userId: req.params.userId,
            notePad: { $exists: true } 
        });
        res.json({ notes: notePad ? notePad.notePad : '' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/adminTodoList/:userId', async (req, res) => {
    try {
        const todoList = await AdminDash.findOne({ 
            userId: req.params.userId,
            todoList: { $exists: true } 
        });
        const todos = todoList ? JSON.parse(todoList.todoList) : [];
        res.json({ 
            _id: todoList?._id,
            todos: todos 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT routes
router.put('/adminExcelSheet/:id', async (req, res) => {
    try {
        const { tables, userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        if (!Array.isArray(tables) || tables.length === 0) {
            return res.status(400).json({ message: 'At least one table must exist' });
        }

        const updatedExcelSheet = await AdminDash.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: userId
            },
            { excelSheet: JSON.stringify(tables) },
            { new: true }
        );
        
        if (!updatedExcelSheet) {
            return res.status(404).json({ message: 'Excel sheet not found' });
        }
        
        res.json({
            _id: updatedExcelSheet._id,
            tables: JSON.parse(updatedExcelSheet.excelSheet)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/adminNotePad/:id', async (req, res) => {
    try {
        const { notes, userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const updatedNotePad = await AdminDash.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: userId
            },
            { notePad: notes },
            { new: true }
        );

        if (!updatedNotePad) {
            return res.status(404).json({ message: 'NotePad not found' });
        }

        res.json({
            _id: updatedNotePad._id,
            notes: updatedNotePad.notePad
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/adminTodoList/:id', async (req, res) => {
    try {
        const { todos } = req.body;
        const updatedTodoList = await AdminDash.findByIdAndUpdate(
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

// Color management routes
router.get('/adminColors/:userId', async (req, res) => {
    try {
        const adminDash = await AdminDash.findOne({ userId: req.params.userId });
        
        if (!adminDash) {
            return res.json({
                notepadColor: '#fff3cd',
                todoColor: '#cfe2ff',
                excelSheetColor: '#d4edda'
            });
        }
        
        res.json({
            notepadColor: adminDash.notepadColor || '#fff3cd',
            todoColor: adminDash.todoColor || '#cfe2ff',
            excelSheetColor: adminDash.excelSheetColor || '#d4edda'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/adminColors/:userId', async (req, res) => {
    try {
        const { notepadColor, todoColor, excelSheetColor } = req.body;
        
        const updatedDash = await AdminDash.findOneAndUpdate(
            { userId: req.params.userId },
            { 
                $set: { 
                    notepadColor,
                    todoColor,
                    excelSheetColor
                } 
            },
            { new: true, upsert: true }
        );
        
        res.json({
            notepadColor: updatedDash.notepadColor,
            todoColor: updatedDash.todoColor,
            excelSheetColor: updatedDash.excelSheetColor
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
