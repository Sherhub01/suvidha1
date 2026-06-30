# Suvidha1 — Backend

Node.js + Express REST API for the Suvidha1 service-booking platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | MongoDB (via Mongoose) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Email | Nodemailer |
| File Upload | Multer |
| Environment | dotenv |
| CORS | cors middleware |

---

## Project Structure

```
Backend/
├── config/
│   ├── db.js           # MongoDB connection
│   └── mailer.js       # Nodemailer transporter + email helpers
├── controller/
│   ├── adminController.js    # All admin logic (login, stats, bookings, users)
│   ├── authcontroller.js     # Register, login, OTP, forgot password
│   ├── bookingController.js  # Booking CRUD, staff alerts, consumer alerts
│   └── staffController.js    # Staff profile create/update/fetch/approve
├── middleware/
│   ├── adminAuth.js    # JWT verify for admin routes
│   ├── auth.js         # JWT verify for user routes
│   └── upload.js       # Multer config for avatar/document uploads
├── models/
│   ├── admin.js        # Admin schema
│   ├── booking.js      # Booking schema
│   ├── consumerAlert.js # Notifications for consumer (booking confirmed etc.)
│   ├── notification.js  # Admin broadcast notifications
│   ├── staffAlert.js    # Notifications for professional (new booking)
│   ├── staffProfile.js  # Professional's extended profile
│   └── user.js         # Consumer + Professional user schema
├── router/
│   ├── adminRoutes.js   # /api/admin/*
│   ├── aiRoutes.js      # /api/ai/*
│   ├── authroutes.js    # /api/auth/*
│   ├── bookingRoutes.js # /api/bookings/*
│   └── staffRoutes.js   # /api/staff/*
├── uploads/
│   └── avatars/         # Stored profile photos
├── utils/
│   └── otpGenerator.js  # Random 6-digit OTP
├── .env
├── package.json
└── server.js            # Entry point
```

---

## How to Run

```bash
cd Backend
npm install
# create .env (see below)
npm run dev     # uses nodemon
# or
node server.js
```

### .env Variables

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/suvidha1
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

---

## Database Models

### User (`models/user.js`)
Stores both **consumer** and **professional** accounts.
```js
{
  firstName, lastName, username, email, phone,
  password,          // bcrypt hashed
  role,              // "consumer" | "staff"
  avatar,            // file path
  address, location: { type: "Point", coordinates: [lng, lat] },
  isVerified,        // email OTP verified
  profileCompleted,  // profile setup done
  otp, otpExpire     // for forgot-password flow
}
```

### StaffProfile (`models/staffProfile.js`)
Extended profile for professionals — created after user registers as staff.
```js
{
  user: ObjectId(User),
  fullName, category, subCategory, experience,
  skills: [], certificates: [],
  photo, documents: [],
  serviceCity, street, city, state,
  price, priceType,  // "fixed" | "hourly"
  status,            // "pending" | "approved" | "rejected"
  bio, rating, reviewsCount,
  location: { type: "Point", coordinates: [lng, lat] }
}
```

### Booking (`models/booking.js`)
```js
{
  consumer: ObjectId(User),
  staff:    ObjectId(User),
  staffProfile: ObjectId(StaffProfile),
  service, category, description,
  date, time, address,
  price, paymentMethod, paymentStatus,  // "Pending"|"Paid"|"Refunded"
  status,   // "Scheduled"|"Confirmed"|"Completed"|"Cancelled"
  workerName, workerPhone, workerPhoto,  // denormalized for speed
  rating    // consumer rating after completion
}
```

### StaffAlert (`models/staffAlert.js`)
In-app notification sent to professional when consumer books.
```js
{
  staff:   ObjectId(User),
  booking: ObjectId(Booking),
  type:    "new_booking" | "booking_cancelled" | "booking_updated",
  title, message,
  isRead: false
}
```

### ConsumerAlert (`models/consumerAlert.js`)
In-app notification sent to consumer when professional confirms/completes.
```js
{
  consumer: ObjectId(User),
  booking:  ObjectId(Booking),
  type:     "booking_confirmed" | "booking_completed" | "booking_cancelled",
  title, message,
  isRead: false
}
```

### Admin (`models/admin.js`)
```js
{ name, email, password, otp, otpExpire }
```

### Notification (`models/notification.js`)
Admin broadcast notifications to consumers/staff.
```js
{ title, message, audience: "all"|"consumers"|"staff", sentBy: ObjectId(Admin) }
```

---

## API Routes

### Auth — `/api/auth`

| Method | Path | Description |
|---|---|---|
| POST | `/register` | Register user (consumer or staff) |
| POST | `/login` | Login with role check, returns JWT |
| POST | `/send-otp` | Send email OTP for verification |
| POST | `/verify-otp` | Verify OTP → mark isVerified |
| POST | `/forgot-password` | Send reset OTP |
| POST | `/reset-password` | Reset with OTP |
| GET | `/me` | Get logged-in user profile |
| PATCH | `/profile` | Update profile |
| PATCH | `/location` | Update GPS coordinates |

### Bookings — `/api/bookings`

| Method | Path | Who | Description |
|---|---|---|---|
| POST | `/` | Consumer | Create a booking → triggers StaffAlert |
| GET | `/consumer` | Consumer | Get my bookings |
| PATCH | `/:id/cancel` | Consumer | Cancel booking |
| PATCH | `/:id/rate` | Consumer | Rate a completed booking |
| PATCH | `/:id/complete` | Consumer | Mark as completed |
| GET | `/staff` | Professional | Get my assigned bookings |
| PATCH | `/:id/accept` | Professional | Confirm booking → triggers ConsumerAlert |
| PATCH | `/:id/done` | Professional | Mark as completed |
| GET | `/alerts` | Professional | Get booking notifications |
| GET | `/alerts/unread-count` | Professional | Bell badge count |
| PATCH | `/alerts/read-all` | Professional | Mark all alerts read |
| PATCH | `/alerts/:id/read` | Professional | Mark one alert read |
| GET | `/consumer-alerts` | Consumer | Get status-update notifications |
| PATCH | `/consumer-alerts/read-all` | Consumer | Mark all read |
| PATCH | `/consumer-alerts/:id/read` | Consumer | Mark one read |
| GET | `/approved-staff` | Consumer | List approved professionals |

### Staff — `/api/staff`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/profile/:profileId` | User JWT | Get single public staff profile (consumer-facing) |
| GET | `/approved` | User JWT | List all approved professionals (consumer-facing) |
| GET | `/profile` | User JWT | Get own staff profile |
| POST | `/step` | User JWT | Save a profile wizard step |
| POST | `/submit` | User JWT | Submit profile for admin review |
| GET | `/status` | User JWT | Get approval status |
| GET | `/admin/list` | Admin JWT | List all staff (filter by status) |
| GET | `/admin/detail/:profileId` | Admin JWT | Single staff detail |
| PATCH | `/admin/approve/:profileId` | Admin JWT | Approve professional |
| PATCH | `/admin/reject/:profileId` | Admin JWT | Reject professional |

### Admin — `/api/admin`

| Method | Path | Description |
|---|---|---|
| POST | `/login` | Admin login |
| POST | `/send-otp` | Signup OTP |
| POST | `/signup` | Admin register |
| POST | `/forgot-password` | Send reset OTP |
| POST | `/reset-password` | Reset admin password |
| GET | `/me` | Admin profile |
| GET | `/dashboard-stats` | Totals: users, bookings, revenue |
| GET | `/bookings` | All bookings (paginated, filterable) |
| GET | `/staff` | All professionals (search, filter by status) |
| GET | `/staff/:id` | Single staff detail + their bookings |
| PATCH | `/staff/:id/approve` | Approve professional |
| PATCH | `/staff/:id/reject` | Reject professional |
| DELETE | `/staff/:id` | Delete staff account |
| GET | `/consumers` | All consumers (search, paginate) |
| GET | `/consumers/:id` | Single consumer detail + bookings |
| DELETE | `/consumers/:id` | Delete consumer account |
| GET | `/reports` | Revenue, booking trends by date range |
| GET | `/export` | Export data as JSON |
| POST | `/notifications` | Broadcast notification |
| GET | `/notifications` | List sent notifications |

---

## Core Flow: Booking & Notification

```
Consumer clicks "Book Service"
    │
    ▼
POST /api/bookings  (consumer JWT)
    │
    ├── Creates Booking document (status: "Scheduled")
    │
    ├── Creates StaffAlert for the professional
    │       { type: "new_booking", title: "New Booking: Plumber", ... }
    │
    └── Sends email confirmation to both consumer & professional
    
Professional's panel polls GET /api/bookings/alerts every 15s
    │
    └── Sees new alert with booking details → can Accept or Complete

Professional clicks "Confirm Job"
    │
    ▼
PATCH /api/bookings/:id/accept  (staff JWT)
    │
    ├── Updates Booking status → "Confirmed"
    │
    └── Creates ConsumerAlert
            { type: "booking_confirmed", title: "Booking Confirmed: Plumber", ... }

Consumer's panel polls GET /api/bookings/consumer-alerts every 15s
    └── Sees "Booking Confirmed" notification with updated status
```

---

## Authentication Flow

```
Register → POST /api/auth/register
    └── Saves user (isVerified: false)
    
Send OTP → POST /api/auth/send-otp
    └── Generates 6-digit OTP, emails it

Verify OTP → POST /api/auth/verify-otp
    └── Sets isVerified: true

Login → POST /api/auth/login
    └── Checks role + password → returns JWT (expires 7d)
    
All protected routes use:
    middleware/auth.js → verifies JWT → sets req.userId
    middleware/adminAuth.js → verifies admin JWT → sets req.adminId
```

---

## Key Code Snippets

### Creating a Booking + Sending Staff Notification
```js
// bookingController.js
const booking = await Booking.create({ consumer: req.userId, staff: staffId, ... });

// Notify professional immediately
await StaffAlert.create({
  staff:   staffId,
  booking: booking._id,
  type:    "new_booking",
  title:   `New Booking: ${service}`,
  message: `${consumerName} has booked your service for ${date} at ${time}.`,
});
```

### Professional Confirms → Notifies Consumer
```js
// bookingController.js — acceptBooking
booking.status = "Confirmed";
await booking.save();

await ConsumerAlert.create({
  consumer: booking.consumer,
  booking:  booking._id,
  type:     "booking_confirmed",
  title:    `Booking Confirmed: ${booking.service}`,
  message:  `${staffName} has confirmed your booking for ${booking.date} at ${booking.time}.`,
});
```

### JWT Middleware
```js
// middleware/auth.js
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.id;
  next();
};
```

---

## Email Notifications

`config/mailer.js` uses Nodemailer with Gmail SMTP.  
Emails are sent on:
- User registration (OTP verification)
- Booking created (confirmation to consumer + professional)
- Password reset (OTP)
- Admin signup/forgot-password (OTP)

---

## Default Admin Account

On first server start, a default admin is seeded:
```
Email:    sswag177@gmail.com
Password: Admin@me
```
Change this after first login via Admin → Settings → Change Password.
