# 💇‍♀️ Salon Appointment Management System

![Salon Management Preview](https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=300&fit=crop&auto=format)

A comprehensive salon appointment management system with automated reminders, client management, and admin dashboard. Built with Next.js, MongoDB, and integrated with Twilio for SMS/WhatsApp notifications.

## ✨ Features

- **Client Management**: Complete CRUD operations for client profiles
- **Smart Scheduling**: Automated next appointment calculations (30-day intervals)
- **Multi-Channel Notifications**: SMS, WhatsApp, and Email reminders via Twilio
- **Admin Dashboard**: Search, filter, and export client data
- **Calendar View**: Monthly appointment scheduling and management
- **Responsive Design**: Mobile-optimized interface
- **Secure Authentication**: Admin login system
- **Export Functionality**: Excel/CSV client data export
- **Service History**: Complete appointment tracking per client

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=68cc4b48fe0840663f650560&clone_repository=68cc4cf8fe0840663f650563)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> No content model prompt provided - app built from existing content structure

### Code Generation Prompt

> I want you to create a responsive web application for a salon appointment management system. Requirements: 1. User Data Collection: Store client details: Name, Mobile Number, Email, Service Taken, Date of Last Visit. Option to add/edit/delete client records. 2. Appointment & Notifications: When a new client is added, system should automatically calculate "Next Due Date" (30 days from last visit). Dashboard should show upcoming appointments for the current month. Admin should receive notification/reminder when a client's due date is near. Option to send SMS/WhatsApp/Email reminders to clients. 3. Admin Dashboard: Search & filter clients by name, mobile, or service type. Calendar view of monthly appointments. Export client list in Excel/CSV. 4. Tech Stack: Use React.js (frontend) + Node.js/Express.js (backend). Database: MongoDB (store all client info & appointments). Authentication for admin login (username/password). 5. UI/UX: Clean and modern design with cards and tables. Mobile responsive. Add "Add Client" button + "Upcoming Appointments" section. 6. Extra Features (if possible): Auto reminders via Twilio/WhatsApp API. Appointment history for each client. Deliver a complete working web app code with proper folder structure, APIs, and database schema.

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠 Technologies Used

- **Frontend**: Next.js 15, React 18, TypeScript
- **Database**: MongoDB with Mongoose ODM  
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS with custom components
- **Notifications**: Twilio API for SMS/WhatsApp
- **Email**: Resend API for email notifications
- **Export**: SheetJS for Excel/CSV export
- **UI Components**: Custom responsive components
- **Content Management**: Cosmic CMS integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun runtime
- MongoDB database (local or MongoDB Atlas)
- Twilio account for SMS/WhatsApp (optional)
- Resend account for emails (optional)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd salon-management-system
bun install
```

2. **Set up environment variables**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/salon-management
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# Twilio (Optional - for SMS/WhatsApp)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Email (Optional - for email reminders)
RESEND_API_KEY=your-resend-api-key

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Cosmic CMS
COSMIC_BUCKET_SLUG=your-cosmic-bucket-slug
COSMIC_READ_KEY=your-cosmic-read-key
COSMIC_WRITE_KEY=your-cosmic-write-key
```

3. **Start the development server**
```bash
bun run dev
```

4. **Access the application**
- Open http://localhost:3000
- Login with admin credentials
- Start managing salon appointments!

## 🎯 Cosmic SDK Examples

```typescript
// Fetch salon services
const services = await cosmic.objects
  .find({ type: 'services' })
  .props(['title', 'slug', 'metadata'])
  .depth(1);

// Get business settings
const settings = await cosmic.objects
  .findOne({ type: 'settings', slug: 'business-settings' })
  .props(['title', 'metadata']);

// Create appointment record
await cosmic.objects.insertOne({
  type: 'appointments',
  title: `${clientName} - ${serviceName}`,
  metadata: {
    client_id: clientId,
    service: serviceName,
    appointment_date: appointmentDate,
    status: 'scheduled'
  }
});
```

## 🌐 Cosmic CMS Integration

This application integrates with Cosmic CMS to manage:

- **Services**: Salon services with pricing and duration
- **Staff**: Team member profiles and schedules  
- **Settings**: Business hours, contact information
- **Templates**: Email and SMS notification templates
- **Appointments**: Appointment history and scheduling data

The CMS integration allows easy content updates without code changes, making it perfect for salon owners to manage their service offerings and business information.

## 📱 Deployment Options

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Netlify
1. Connect repository to Netlify
2. Set build command: `bun run build`
3. Configure environment variables

### Self-hosted
1. Build the application: `bun run build`
2. Start production server: `bun start`
3. Configure reverse proxy (nginx/Apache)

**Important**: Ensure MongoDB connection and all API keys are properly configured in your hosting environment.

<!-- README_END -->