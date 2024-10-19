const multer = require('multer');
const path = require('path');

// File filter to check the allowed file types
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, DOC, DOCX, XLS, and XLSX files are allowed!'));
  }
};

const employeeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/employee')
  },
  filename: function (req, file, cb) {
    // console.log(req.file, "multer1");
    const uniqueSuffix = Date.now() + '-' + file.originalname
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const projectStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/project');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const taskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/task');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const clientStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/client');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});
const messageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/message');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const uploadEmployee = multer({
  storage: employeeStorage,
  fileFilter: fileFilter, // Apply the file filter  
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadProject = multer({
  storage: projectStorage,
  fileFilter: fileFilter // Apply the file filter
});

const uploadTask = multer({
  storage: taskStorage,
  fileFilter: fileFilter // Apply the file filter 
});
const uploadClient = multer({
  storage: clientStorage,
  fileFilter: fileFilter // Apply the file filter 
});
const uploadMessage = multer({
  storage: messageStorage,
  fileFilter: fileFilter // Apply the file filter 
});

module.exports = { uploadEmployee, uploadProject, uploadTask, uploadClient, uploadMessage }
