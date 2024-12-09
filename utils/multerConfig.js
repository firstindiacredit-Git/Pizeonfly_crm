const multer = require('multer');
const path = require('path');

// File filter to check the allowed file types
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|webp|svg|ico|json|txt|csv|json|xml|json5|json4|json3|json2|json1|json0|mp3|mp4|wav|ogg|webm|avi|mov|mkv|mpeg|mpg|m4a|aac|oga|ogg|wav|webm/;
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
    let uploadPath = './uploads/employee';
    if (file.fieldname === 'resume') {
      uploadPath = './uploads/employee/resumes';
    } else if (file.fieldname === 'aadhaarCard') {
      uploadPath = './uploads/employee/aadhaar';
    } else if (file.fieldname === 'panCard') {
      uploadPath = './uploads/employee/pan';
    } else if (file.fieldname === 'qrCode') {
      uploadPath = './uploads/employee/qr';
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const projectStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'projectIcon') {
      cb(null, './uploads/project/icons');
    } else {
      cb(null, './uploads/project');
    }
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

const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/profile');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const chatStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = './uploads/chat';
    if (file.fieldname === 'images') {
      uploadPath = './uploads/chat/images';
    } else if (file.fieldname === 'video') {
      uploadPath = './uploads/chat/videos';
    } else if (file.fieldname === 'audio' || file.fieldname === 'recording') {
      uploadPath = './uploads/chat/audio';
    } else if (file.fieldname === 'backgroundImage') {
      uploadPath = './uploads/chat/backgrounds';
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadEmployee = multer({
  storage: employeeStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const uploadProject = multer({
  storage: projectStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
}).fields([
  { name: 'projectImage', maxCount: 10 }, // Allow multiple project images
  { name: 'projectIcon', maxCount: 1 }    // Allow one project icon
]);

const uploadTask = multer({
  storage: taskStorage,
  fileFilter: fileFilter, // Apply the file filter 
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const uploadClient = multer({
  storage: clientStorage,
  fileFilter: fileFilter, // Apply the file filter 
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const uploadMessage = multer({
  storage: messageStorage,
  fileFilter: fileFilter, // Apply the file filter 
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const uploadChat = multer({
  storage: chatStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
}).fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'recording', maxCount: 1 },
  { name: 'backgroundImage', maxCount: 1 }
]);

module.exports = { uploadEmployee, uploadProject, uploadTask, uploadClient, uploadMessage, uploadProfile, uploadChat }
