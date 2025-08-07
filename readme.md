# IAM System – Full Stack App (React + Express + SQLite)


## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Abdul-majid-ashrafi/IAM-system.git
cd IAM-system
```

> Using Node.js v20.14.1.

> Install nodemon globally if not already installed:
```
npm install -g nodemon
```

### 2. Start the Backend

```bash
cd backend
npm install
npm start
```

- The backend will run at: `http://localhost:5000`

> ✅ A default Super Admin user will be created automatically:

```
Username: admin
Password: admin123
```

> 🧠 Note: The backend uses a file-based SQLite database (`iam.db`).

> You can delete this file to reset all data.


---

### 3. Start the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

- The frontend will run at: `http://localhost:5173`

> 🧠 Note: You can now log in using the Super Admin credentials above and begin managing users, groups, roles, modules, and permissions via the web interface.
---

## ✅ Features

### Authentication
- Register & Login (JWT-based)
- Protected APIs using JWT middleware

### Users
- Full CRUD via frontend and backend
- Assign users to groups

### Groups
- Full CRUD
- Assign users to groups
- Assign roles to groups

### Roles
- Full CRUD
- Assign roles to groups
- Assign permissions to roles

### Modules
- Represents business areas like "Users", "Groups", "Modules"
- Full CRUD

### Permissions
- Actions like create/read/update/delete on modules
- Assign permissions to roles

### Access Control
- Users inherit permissions **only via group membership**
- Endpoint `/api/access/me/permissions` returns all effective permissions
- Frontend uses Redux to store permissions and show/hide UI

---

## ⚙️ Tech Stack

| Layer    | Stack                                              |
|----------|----------------------------------------------------|
| Frontend | React, Redux Toolkit, Tailwind CSS, React Router   |
| Backend  | Node.js, Express, SQLite (file-based) |
| Auth     | JWT                                                |

---


