# Shipment Management System

A comprehensive CRUD application for managing shipment records with dynamic field configuration, file uploads, and import/export capabilities.

## Tech Stack

- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **File Processing**: Multer for uploads, CSV/XLSX import/export
- **Testing**: Jest/Vitest for unit tests

## Features

- ✅ **JWT Authentication** - Secure login/register with token-based auth
- ✅ **Multi-User System** - Each user has their own separate data
- ✅ **Role-Based Access** - Super Admin, Admin, Manager, User roles
- ✅ **User Management** - Admin can manage users and permissions
- ✅ Complete CRUD operations for shipments
- ✅ Dynamic field configuration (rename labels, toggle visibility, reorder fields)
- ✅ File uploads for AWB images, weight images, and stickers
- ✅ CSV/XLSX import with column mapping and preview
- ✅ Advanced search, filtering, and pagination
- ✅ Automatic calculation of derived fields (totals, GST)
- ✅ Responsive UI with status badges and live calculations
- ✅ Audit trails (created/updated timestamps and users)
- ✅ **Dynamic Template Download** - Download import templates based on field settings

## Project Structure

```
├── server/                 # Backend Express application
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   └── tests/         # Unit tests
│   ├── uploads/           # File upload directory
│   └── package.json
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Main pages
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Prerequisites**:
   - Node.js (v18 or higher)
   - MongoDB (local installation or MongoDB Atlas)
   - npm or yarn package manager

2. **Clone and setup**:
```bash
git clone <repository-url>
cd shipment-management
```

3. **Backend setup**:
```bash
cd server
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env file with your MongoDB URI and other settings

# Build TypeScript
npm run build

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

4. **Frontend setup** (in new terminal):
```bash
cd client
npm install

# Start development server
npm run dev
```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally and start the service
mongod --dbpath /path/to/your/db
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get connection string and update MONGO_URI in .env

**Option 3: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Available Scripts

#### Backend (server/)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run unit tests
- `npm run seed` - Seed database with sample data
- `npm run lint` - Run ESLint

#### Frontend (client/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run lint` - Run ESLint

## Field Settings

The application features a dynamic field configuration system that allows you to customize the form fields and table columns without changing the underlying data structure.

### How Field Settings Work

1. **FieldsConfig Collection**: Stores metadata for each field including:
   - `key`: Field identifier (immutable)
   - `label`: Display name (customizable)
   - `type`: Data type (text, number, date, enum, etc.)
   - `enumValues`: Options for dropdown fields
   - `visible`: Show/hide in UI
   - `order`: Display order in forms and tables
   - `required`: Whether field is mandatory
   - `validation`: Custom validation rules

2. **Dynamic Form Generation**: Forms are automatically generated based on field configurations

3. **Custom Fields**: Add new fields dynamically using `additionalFields` Map for business-specific requirements

4. **Field Management Features**:
   - **Rename Labels**: Change display names without affecting data
   - **Toggle Visibility**: Show/hide fields in forms and tables
   - **Reorder Fields**: Drag-and-drop to change field order
   - **Add Custom Fields**: Create new fields for specific needs
   - **Validation Rules**: Set custom validation patterns and messages

### Using Field Settings

1. Navigate to **Field Settings** page
2. **Initialize**: Click "Initialize Default Fields" for first-time setup
3. **Customize**:
   - Drag fields to reorder
   - Click eye icon to toggle visibility
   - Click edit icon to modify field properties
   - Click + to add new custom fields
4. **Save**: Click "Save Changes" to apply modifications

The system maintains backward compatibility - existing data remains intact when field configurations change.

## Data Model

### Shipments
Core fields include date, customer info, AWB details, amounts, status tracking, and file attachments. Derived fields (totals) are calculated automatically.

### Validation Rules
- Numbers must be ≥ 0
- Phone numbers follow standard format
- Pincode must be 6 digits
- Required fields: dates, customer names
- File uploads validated by type and size

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### User Management (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/password` - Reset user password
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/roles/list` - Get available roles
- `GET /api/users/permissions/list` - Get available permissions

### Shipments
- `GET /api/shipments` - List with search, filter, pagination
- `POST /api/shipments` - Create new shipment
- `PUT /api/shipments/:id` - Update shipment
- `DELETE /api/shipments/:id` - Delete shipment
- `POST /api/shipments/import` - Import CSV/XLSX
- `GET /api/shipments/export` - Export to CSV/XLSX

### Other
- `POST /api/upload` - File upload endpoint
- `GET /api/fields-config` - Get field configurations
- `PUT /api/fields-config` - Update field configurations
- `GET /api/pincode/:pincode` - Get pincode details
- `GET /api/template/download` - Download import template

## Environment Variables

Create `.env` file in server directory:

```env
MONGO_URI=mongodb://localhost:27017/shipment-management
PORT=3000
UPLOAD_DIR=uploads
NODE_ENV=development
JWT_SECRET=your-secret-key
```

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS

# Check connection string in .env file
MONGO_URI=mongodb://localhost:27017/shipment-management
```

**Port Already in Use**
```bash
# Kill process using port 3000 or 5173
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**File Upload Issues**
- Ensure `uploads` directory exists and has write permissions
- Check `MAX_FILE_SIZE` in .env (default 5MB)
- Verify `ALLOWED_FILE_TYPES` configuration

**Import/Export Not Working**
- Check file format (CSV/XLSX only)
- Ensure proper column headers
- Verify data types match field configurations

### Performance Tips

1. **Database Indexing**: Indexes are automatically created for frequently queried fields
2. **Pagination**: Use appropriate page sizes (default: 10 items)
3. **File Uploads**: Compress images before uploading
4. **Search**: Use specific search terms for better performance

## Development

### Code Structure

```
├── server/                 # Backend Express application
│   ├── src/
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   ├── config/        # Configuration files
│   │   ├── scripts/       # Database seeding
│   │   └── tests/         # Unit tests
│   └── uploads/           # File storage
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript definitions
│   │   └── tests/         # Component tests
│   └── public/            # Static assets
```

### Adding New Features

1. **Backend**: Add routes in `server/src/routes/`
2. **Frontend**: Create components in `client/src/components/`
3. **Database**: Update models in `server/src/models/`
4. **Types**: Add TypeScript types in `client/src/types/`
5. **Tests**: Add tests in respective `tests/` directories

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write unit tests for new features
- Use ESLint and Prettier for code formatting
- Follow conventional commit messages
- Update documentation for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

This application is production-ready and can be deployed to various platforms.

### Recommended Deployment Stack

- **Frontend**: Vercel or Netlify (React + Vite)
- **Backend**: Render or Railway (Node.js + Express)
- **Database**: MongoDB Atlas (Free tier available)

### Quick Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guide including:
- MongoDB Atlas setup
- Backend deployment to Render
- Frontend deployment to Vercel
- Environment configuration
- Security best practices
- Troubleshooting tips

### Deployment Checklist

Use [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) to ensure all steps are completed.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the API documentation at `/api` endpoints
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
