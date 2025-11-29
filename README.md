# 🎊 ReviewSpin

**Turn Reviews into Rewards** - A beautiful, multi-tenant SaaS that gamifies Google reviews for local businesses.

Perfect for restaurants, cafés, fast-foods, car washes, beauty salons, and other local businesses. Customers scan a QR code, leave a review, and then play a fun Wheel of Prizes game to win rewards!

---

## ✨ Features

- 🎡 **Beautiful Prize Wheel** with smooth Framer Motion animations
- 📱 **Mobile-First Design** optimized for customer engagement
- 🏢 **Multi-Tenant** - One codebase serves unlimited businesses
- 🎨 **White-Label Ready** - Customizable colors, logos, and rewards per business
- 🔐 **Simple Admin Panel** - Token-based authentication
- 📊 **Analytics Dashboard** - Track participations, winners, and redemptions
- 🎯 **Probability-Based** - Configure win rates for each reward
- 🐳 **Docker Ready** - Easy deployment with docker-compose

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Database**: PostgreSQL
- **ORM**: Prisma 5
- **Deployment**: Docker + docker-compose

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (or use Docker)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd review-game-saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   DATABASE_URL="postgresql://reviewspin:reviewspin@localhost:5432/reviewspin"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Start PostgreSQL** (if using Docker)
   ```bash
   docker run --name reviewspin-postgres -e POSTGRES_USER=reviewspin -e POSTGRES_PASSWORD=reviewspin -e POSTGRES_DB=reviewspin -p 5432:5432 -d postgres:16-alpine
   ```

5. **Run database migrations**
   ```bash
   npm run db:push
   ```

6. **Seed the database** (creates 3 demo restaurants)
   ```bash
   npm run db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser** to `http://localhost:3000`

---

## 🏢 Gestion Multi-Restaurants (SaaS)

L'application est conçue pour gérer plusieurs restaurants.

### 1. Accès Super Admin
Pour créer et gérer vos restaurants, utilisez le **Super Admin Dashboard** :
- **URL** : `http://localhost:3000/super-admin?token=super-secret-master-token`
- **Fonctionnalités** :
  - Voir tous les restaurants
  - Créer un nouveau restaurant (Wizard étape par étape)
  - Voir les stats globales

### 2. Créer un Nouveau Restaurant
1. Allez sur le Super Admin Dashboard.
2. Cliquez sur **"Add New Restaurant"**.
3. Suivez les étapes (Nom, Catégorie, Couleurs, Lien Google).
4. Le système génère automatiquement :
   - Un lien unique (`/r/nom-du-resto`)
   - Un token admin unique
   - Des récompenses par défaut adaptées à la catégorie (ex: Café -> Boisson offerte)

### 3. Accès Admin Restaurant
Chaque restaurant a son propre dashboard :
- **URL** : `http://localhost:3000/admin?token=[TOKEN_DU_RESTO]`
- **Fonctionnalités** : CRM, QR Code, Stats, Gestion des gains.

---

## 📂 Project Structure

```
review-game-saas/
├── app/
│   ├── api/                    # API routes
│   │   ├── admin/              # Admin endpoints
│   │   ├── play/               # Game play endpoint
│   │   └── restaurant/         # Restaurant data endpoints
│   ├── r/[slug]/               # Customer-facing pages
│   │   ├── page.tsx            # Landing page
│   │   └── play/page.tsx       # Game page
│   ├── admin/                  # Admin dashboard
│   └── page.tsx                # Home page
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── prize-wheel.tsx         # Main wheel component
├── lib/
│   ├── prisma.ts               # Prisma client
│   └── utils.ts                # Utility functions
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script
├── docker-compose.yml          # Docker setup
├── Dockerfile                  # Production build
└── README.md
```

---

## 🎯 How It Works

### Customer Flow

1. **Scan QR Code** → Customer lands on branded page (`/r/[slug]`)
2. **Leave Review** → Redirect to Google Business page
3. **Enter Details** → Name, email (optional), Google name (optional)
4. **Play Game** → Spin the Wheel of Prizes
5. **Win or Thank** → Show prize or thank you message
6. **Redeem** → Show screen to staff to claim prize

### Admin Flow

1. **Access Admin** → Visit `/admin?token=YOUR_TOKEN`
2. **View Stats** → Total plays, winners, pending, redeemed
3. **Manage Rewards** → See active rewards and probabilities
4. **Track Participations** → View recent customers
5. **Update Status** → Mark prizes as VERIFIED or REDEEMED

---

## 🗄️ Database Schema

### Restaurant
- Basic info (name, slug, category)
- Branding (colors, logo, intro text)
- Google Maps URL for reviews
- Admin token for access
- Rewards (one-to-many)
- Participations (one-to-many)

### Reward
- Label and description
- Probability (0-1, should sum to ~1 per restaurant)
- isWin (true for prizes, false for "thank you" segments)
- Optional color and icon (emoji or lucide icon name)

### Participation
- Customer info (name, email, Google name)
- Linked reward
- Status (PENDING, VERIFIED, REDEEMED)
- Timestamps

---

## 🎨 Customization

### Adding a New Restaurant

Use Prisma Studio or create a script:

```bash
npm run db:studio
```

Or programmatically:

```typescript
await prisma.restaurant.create({
  data: {
    name: "Your Business",
    slug: "your-business",
    category: "CAFE",
    googleMapsUrl: "https://g.page/your-business",
    primaryColor: "#16a34a",
    secondaryColor: "#facc15",
    adminToken: "your-secure-random-token",
    rewards: {
      create: [
        {
          label: "Free Coffee",
          probability: 0.3,
          isWin: true,
          icon: "☕",
        },
        // ... more rewards
      ],
    },
  },
})
```

### Customizing Colors

Each restaurant has `primaryColor` and `secondaryColor` that automatically theme:
- Gradients
- Buttons
- Wheel pointer
- Header backgrounds

### Customizing Rewards

Edit reward probabilities, labels, icons, and colors:
- Probability should sum to ~1.0 per restaurant
- Icons support emojis (☕🍔🚗) or lucide-react names
- Colors are hex codes (#16a34a)

---

## 🐳 Docker Deployment

### Development with Docker

```bash
docker-compose up
```

This starts:
- PostgreSQL database
- Next.js app (with auto-migration)

### Production Deployment

1. **Build the image**
   ```bash
   docker build -t reviewspin:latest .
   ```

2. **Run with docker-compose**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. **Access at** http://localhost:3000

---

## 📊 Database Commands

```bash
# Push schema changes without migration
npm run db:push

# Create a migration
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

---

## 🔐 Security Considerations

- Admin access uses URL tokens - keep them secure
- In production, use HTTPS
- Use strong random tokens for `adminToken`
- Consider rate limiting on API routes
- Review verification is honor-system in V1 (no Google API check)

---

## 🎯 Roadmap / Future Ideas

- [ ] Actual Google Review API verification
- [ ] Email/SMS notifications for wins
- [ ] QR code generator in admin panel
- [ ] More game types (scratch cards, mystery boxes)
- [ ] Analytics charts and trends
- [ ] Webhook integrations
- [ ] Multi-language support
- [ ] Custom reward images
- [ ] Export data to CSV

---

## 🤝 Contributing

This is a SaaS template for freelance web developers. Feel free to:
- Fork and customize for your clients
- Add features
- Submit PRs for improvements

---

## 📄 License

MIT License - feel free to use for commercial projects!

---

## 💡 Use Cases

Perfect for:
- ☕ Coffee shops & cafés
- 🍔 Fast food restaurants
- 🍝 Fine dining restaurants
- 🚗 Car washes & detailing
- 💅 Beauty salons & spas
- 🍺 Bars & pubs
- 🏨 Hotels & B&Bs
- 🛍️ Retail stores
- 💈 Barbershops

---

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion)
- [Prisma](https://www.prisma.io)

---

## 📧 Support

For questions or issues, please open a GitHub issue.

---

**Happy Spinning! 🎉**
