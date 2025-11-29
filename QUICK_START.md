# 🚀 ReviewSpin - Complete Setup Guide

## Quick Start (5 Minutes)

### Step 1: Start Docker Desktop
1. Open **Docker Desktop** application on your Mac
2. Wait for it to show "Docker Desktop is running"

### Step 2: Start Database & App
Open your terminal and run these commands:

```bash
cd /Users/saif/Documents/review-game-saas

# Start PostgreSQL database
docker-compose up -d

# Wait 5 seconds for database to be ready
sleep 5

# Run database migrations
npm run db:push

# Seed with demo restaurants
npm run db:seed

# Start the development server
npm run dev
```

### Step 3: Test the App

Open these URLs in your browser:

1. **Super Admin Dashboard**:
   http://localhost:3000/super-admin?token=super-secret-master-token
   
2. **Create a New Restaurant**:
   Click "New Restaurant" button and follow the wizard
   
3. **View Demo Restaurant**:
   http://localhost:3000/r/demo
   
4. **Admin Panel with QR Code**:
   http://localhost:3000/admin?token=demo-admin-token

---

## What You Can Do Now

### ✅ **Manage All Restaurants**
- View all restaurants from Super Admin Dashboard
- See stats: total plays, wins, win rates
- Search and filter restaurants

### ✅ **Onboard New Clients (2 Minutes)**
1. Click "New Restaurant"
2. Fill in 4-step wizard:
   - Name, category, email
   - Brand colors (visual preview)
   - Google review URL
   - Review and create
3. Get instant QR code download
4. Share admin URL with client

### ✅ **Beautiful QR Codes**
- Each restaurant gets a branded QR code
- Includes restaurant name and colors
- Download as PNG
- Share on mobile devices
- Print-ready format

### ✅ **Customer Experience**
- Scan QR → Land on branded page
- Leave Google review
- Play prize wheel
- Win or get thank you
- Show screen to staff to claim prize

### ✅ **Track Everything**
- Real-time participations
- Winner tracking
- Redemption status
- Weekly stats

---

## Troubleshooting

### Database won't start?
```bash
# Check Docker is running
docker ps

# If empty, restart Docker Desktop app

# Then try again
docker-compose up -d
```

### Port already in use?
```bash
# Stop any existing containers
docker-compose down

# Start fresh
docker-compose up -d
```

### Need to reset everything?
```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d
npm run db:push
npm run db:seed
```

---

## Demo Restaurant Credentials

After seeding, you have 3 demo restaurants:

### 1. Café Délice
- **Customer**: http://localhost:3000/r/demo
- **Admin**: http://localhost:3000/admin?token=demo-admin-token
- **Category**: Café
- **Rewards**: Coffee, Pastry, 10% off

### 2. Burger Bros
- **Customer**: http://localhost:3000/r/burger-bros
- **Admin**: http://localhost:3000/admin?token=burger-bros-admin-token-secure-123
- **Category**: Fast Food
- **Rewards**: Free meal, Drink, Fries

### 3. ShineTime Car Wash
- **Customer**: http://localhost:3000/r/shinetime
- **Admin**: http://localhost:3000/admin?token=shinetime-admin-secure-xyz
- **Category**: Car Wash
- **Rewards**: Wash, Wax, Vacuum

---

## Next Steps

1. ✅ Test the super admin dashboard
2. ✅ Create a test restaurant with the wizard
3. ✅ Download the QR code
4. ✅ Play the game as a customer
5. ✅ Check the admin panel

**You're ready to demo this to clients!** 🎉

---

## Commands Reference

```bash
# Start everything
docker-compose up -d && npm run dev

# Stop database
docker-compose down

# View database
npm run db:studio

# Reset database
docker-compose down -v
docker-compose up -d
npm run db:push
npm run db:seed

# Rebuild app
npm run build
```

---

## Support Files

- `MVP_PHASE_1_COMPLETE.md` - Feature summary
- `.agent/workflows/mvp-implementation.md` - Full roadmap
- `README.md` - Complete documentation
- This file - Quick setup guide
