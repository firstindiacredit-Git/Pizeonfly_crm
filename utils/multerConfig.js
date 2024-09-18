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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/employee')
  },
  filename: function (req, file, cb) {
    // console.log(req.file, "multer1");
    const uniqueSuffix = Date.now() + '-' + file.originalname
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const project_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/project');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const task_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/task');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const client_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/client');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter // Apply the file filter  
});

const project_upload = multer({
  storage: project_storage,
  fileFilter: fileFilter // Apply the file filter
});

const task_upload = multer({
  storage: task_storage,
  fileFilter: fileFilter // Apply the file filter 
});
const client_upload = multer({ 
  storage: client_storage,
  fileFilter: fileFilter // Apply the file filter 
});

module.exports = { upload, project_upload, task_upload, client_upload }