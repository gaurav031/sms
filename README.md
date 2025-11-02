# School Management System

A comprehensive, secure, real-time, role-based School Management System built with modern web technologies.

## 🚀 Features

### Role-Based Access Control
- **Students**: View attendance, fees, e-content, timetable, apply for leave, receive notifications
- **Teachers**: Manage classes, take attendance, upload content, post notices
- **Principals**: View school-wide reports, approve policies, monitor activities
- **Admins**: Full CRUD operations, user management, system configuration
- **Non-teaching Staff**: Specialized modules for transport, library, sports, finance

### Core Functionality
- **Real-time Notifications**: Socket.IO powered instant notifications
- **Email Alerts**: Automated email notifications using Nodemailer
- **File Management**: Secure file upload and management
- **Attendance Tracking**: Comprehensive attendance management
- **Content Management**: E-learning content upload and streaming
- **Leave Management**: Digital leave application and approval system
- **Fee Management**: Track and manage student fees
- **Timetable Management**: Dynamic class scheduling

## 🛠 Tech Stack

### Backend
- **Node.js** (LTS) + Express.js
- **MongoDB** (Atlas) + Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication with refresh tokens
- **bcryptjs** for password hashing
- **Nodemailer** for email services
- **Multer** for file uploads
- **Express Rate Limit** for API protection

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Query** for state management
- **React Hook Form** for form handling
- **Socket.IO Client** for real-time features
- **Axios** for API calls

### Security Features
- JWT access & refresh tokens
- Role-based middleware
- Input validation & sanitization
- Rate limiting
- Helmet.js security headers
- File upload restrictions
- CORS configuration

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Clone Repository
```bash
git clone <repository-url>
cd school-management-system
```

### Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

### Root Level (Optional)
```bash
# Install concurrently for running both servers
npm install

# Run both backend and frontend
npm run dev
```

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@schoolmanagement.com
FROM_NAME=School Management System

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)
1. Create new web service
2. Connect your repository
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set environment variables
5. Deploy

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Configure network access
3. Create database user
4. Get connection string

## 📱 Usage

### Default Login Credentials
```
Admin: admin@school.com / password123
Teacher: teacher@school.com / password123
Student: student@school.com / password123
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get user profile

#### Students
- `GET /api/students/dashboard` - Student dashboard
- `GET /api/students/attendance` - Attendance records
- `GET /api/students/content` - Learning content
- `POST /api/students/leave` - Apply for leave

#### Teachers
- `GET /api/teachers/dashboard` - Teacher dashboard
- `GET /api/teachers/students` - Assigned students
- `POST /api/teachers/attendance` - Mark attendance
- `POST /api/teachers/content` - Upload content

#### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - User management
- `POST /api/admin/users` - Create user
- `GET /api/admin/classes` - Class management

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Input Validation**: Express-validator
- **Rate Limiting**: Prevent API abuse
- **File Upload Security**: Type and size restrictions
- **Password Hashing**: bcryptjs with salt rounds
- **CORS**: Configured for specific origins
- **Security Headers**: Helmet.js implementation

## 📊 Real-time Features

- **Live Notifications**: Instant alerts for all users
- **Socket Authentication**: Secure WebSocket connections
- **Room-based Communication**: Class and role-specific channels
- **Real-time Updates**: Live data synchronization

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Performance Optimization

- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Redis integration (optional)
- **Compression**: Gzip compression enabled
- **Image Optimization**: File size limits and validation
- **Code Splitting**: React lazy loading
- **Bundle Optimization**: Vite build optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@schoolmanagement.com or create an issue in the repository.

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the database
- Socket.IO team for real-time capabilities
- Tailwind CSS team for the utility-first CSS framework
- All contributors and testers

---

**Built with ❤️ for educational institutions worldwide**