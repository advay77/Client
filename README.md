# E-commerce Admin Panel

A full-stack responsive admin panel for e-commerce platforms built with React, Node.js, and MongoDB/PostgreSQL.

## Features

- **Product Management**: Add, edit, delete, and list products with image upload
- **Dashboard**: Real-time charts and statistics using Recharts
- **Multi-Language Support**: English, Spanish, Korean, Japanese (react-i18next)
- **Authentication**: JWT-based admin login/register system
- **Responsive Design**: Mobile-friendly interface with TailwindCSS
- **Real-time Updates**: Dynamic updates when products are modified

## Tech Stack

### Frontend
- React 18
- React Router DOM
- TailwindCSS
- React i18next (internationalization)
- Recharts (data visualization)
- Axios (HTTP client)
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose (or PostgreSQL)
- JWT Authentication
- Multer (file uploads)
- bcryptjs (password hashing)

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (or PostgreSQL)
- npm or yarn

### Installation

1. **Clone and install dependencies**
\`\`\`bash
git clone <repository-url>
cd ecommerce-admin-panel
npm run install-deps
\`\`\`

2. **Setup environment variables**
\`\`\`bash
cd server
cp .env.example .env
# Edit .env with your database connection and JWT secret
\`\`\`

3. **Start the application**
\`\`\`bash
# From root directory
npm run dev
\`\`\`

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Default Admin Account
After first run, you can register an admin account or use the seeded account:
- Email: admin@example.com
- Password: admin123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register admin
- `POST /api/auth/login` - Admin login

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Project Structure

\`\`\`
ecommerce-admin-panel/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   ├── i18n/          # Internationalization
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── uploads/          # File uploads
│   └── package.json
└── README.md
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
