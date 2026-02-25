const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Listify database...\n");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.shopFollow.deleteMany();
  await prisma.starredInquiry.deleteMany();
  await prisma.blockedUser.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.jobPhoto.deleteMany();
  await prisma.job.deleteMany();
  await prisma.portfolioPhoto.deleteMany();
  await prisma.talentProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("password", 10);

  // ─── Create Users ─────────────────────────────────

  const talent1 = await prisma.user.create({
    data: {
      email: "talent@test.com",
      name: "Alex Rivera",
      phone: "6195551001",
      passwordHash: hash,
      role: "talent",
      onboarded: true,
    },
  });

  const talent2 = await prisma.user.create({
    data: {
      email: "maria@test.com",
      name: "Maria Santos",
      phone: "6195551002",
      passwordHash: hash,
      role: "talent",
      onboarded: true,
    },
  });

  const talent3 = await prisma.user.create({
    data: {
      email: "jaylen@test.com",
      name: "Jaylen Brooks",
      phone: "6195551003",
      passwordHash: hash,
      role: "talent",
      onboarded: true,
    },
  });

  const employer1 = await prisma.user.create({
    data: {
      email: "employer@test.com",
      name: "Carlos Mendez",
      phone: "6195552001",
      passwordHash: hash,
      role: "employer",
      onboarded: true,
    },
  });

  const employer2 = await prisma.user.create({
    data: {
      email: "sarah@test.com",
      name: "Sarah Kim",
      phone: "6195552002",
      passwordHash: hash,
      role: "employer",
      onboarded: true,
    },
  });

  const employer3 = await prisma.user.create({
    data: {
      email: "mike@test.com",
      name: "Mike Johnson",
      phone: "6195552003",
      passwordHash: hash,
      role: "employer",
      onboarded: true,
    },
  });

  console.log("✅ Created 6 users (3 talent, 3 scouts)");

  // ─── Talent Profiles ──────────────────────────────

  await prisma.talentProfile.create({
    data: {
      userId: talent1.id,
      headline: "Senior Barber & Stylist",
      bio: "Dedicated stylist with over 5 years of experience in high-end barbershops across California. Specialist in modern fades and precision beard sculpting.",
      yearsExperience: 5,
      verified: true,
      instagram: "alex_cuts_sd",
      website: "alexrivera.style",
      specialties: ["Barbering", "Beard Sculpting", "Fades", "Hair Coloring"],
    },
  });

  await prisma.talentProfile.create({
    data: {
      userId: talent2.id,
      headline: "Licensed Cosmetologist",
      bio: "Passionate about color theory and modern styling techniques. 3 years experience in busy salons.",
      yearsExperience: 3,
      verified: false,
      instagram: "maria_styles",
      specialties: ["Cosmetology", "Color", "Blowouts", "Extensions"],
    },
  });

  await prisma.talentProfile.create({
    data: {
      userId: talent3.id,
      headline: "Tattoo Artist — Traditional & Neo-Traditional",
      bio: "Apprentice-trained tattoo artist specializing in bold traditional work and neo-traditional color pieces.",
      yearsExperience: 4,
      verified: true,
      instagram: "jaylen_ink",
      specialties: ["Tattoo Art", "Traditional", "Neo-Traditional"],
    },
  });

  console.log("✅ Created 3 talent profiles");

  // ─── Locations ─────────────────────────────────────

  const locEncinitas = await prisma.location.create({
    data: {
      lat: 33.0370,
      lng: -117.2920,
      addressLine1: "500 S Coast Hwy",
      city: "Encinitas",
      state: "CA",
      postalCode: "92024",
      county: "San Diego",
    },
  });

  const locCarlsbad = await prisma.location.create({
    data: {
      lat: 33.1581,
      lng: -117.3506,
      addressLine1: "2588 El Camino Real",
      city: "Carlsbad",
      state: "CA",
      postalCode: "92008",
      county: "San Diego",
    },
  });

  const locOceanside = await prisma.location.create({
    data: {
      lat: 33.1959,
      lng: -117.3795,
      addressLine1: "1920 Mission Ave",
      city: "Oceanside",
      state: "CA",
      postalCode: "92058",
      county: "San Diego",
    },
  });

  const locSD = await prisma.location.create({
    data: {
      lat: 32.7157,
      lng: -117.1611,
      addressLine1: "345 University Ave",
      city: "San Diego",
      state: "CA",
      postalCode: "92103",
      county: "San Diego",
    },
  });

  const locEscondido = await prisma.location.create({
    data: {
      lat: 33.1192,
      lng: -117.0864,
      addressLine1: "200 E Grand Ave",
      city: "Escondido",
      state: "CA",
      postalCode: "92025",
      county: "San Diego",
    },
  });

  const locVista = await prisma.location.create({
    data: {
      lat: 33.2000,
      lng: -117.2428,
      addressLine1: "125 Main St",
      city: "Vista",
      state: "CA",
      postalCode: "92084",
      county: "San Diego",
    },
  });

  console.log("✅ Created 6 San Diego County locations");

  // ─── Employer Profiles ─────────────────────────────

  const shop1 = await prisma.employerProfile.create({
    data: {
      userId: employer1.id,
      shopName: "American Deluxe Barbershop",
      about: "Founded in 2015, American Deluxe Barbershop has become a cornerstone of the Encinitas grooming scene.",
      phone: "7605551001",
      website: "www.americandeluxe.com",
      instagram: "americandeluxe_shop",
      teamSize: 8,
      verified: true,
      services: ["Barbering", "Hot Shaves", "Hair Coloring"],
      locationId: locEncinitas.id,
    },
  });

  const shop2 = await prisma.employerProfile.create({
    data: {
      userId: employer2.id,
      shopName: "Pacific Coast Beauty Studio",
      about: "Full-service beauty studio specializing in hair, nails, and lash extensions.",
      phone: "7605551002",
      website: "www.pcbeauty.com",
      instagram: "pcbeauty_sd",
      teamSize: 12,
      verified: true,
      services: ["Cosmetology", "Nail Art", "Lash Extensions", "Esthetics"],
      locationId: locCarlsbad.id,
    },
  });

  const shop3 = await prisma.employerProfile.create({
    data: {
      userId: employer3.id,
      shopName: "Iron & Ink Tattoo Studio",
      about: "San Diego's premier tattoo studio for custom work. Walk-ins welcome.",
      phone: "6195551003",
      website: "www.ironandinksd.com",
      instagram: "ironandink_sd",
      teamSize: 5,
      verified: false,
      services: ["Tattooing", "Piercing"],
      locationId: locSD.id,
    },
  });

  console.log("✅ Created 3 shop profiles");

  // ─── Jobs (Listings) ──────────────────────────────

  // Expiration dates for testing
  const in14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const in2Days = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const expired = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
  const in10Days = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        employerProfileId: shop1.id,
        businessName: "American Deluxe Barbershop",
        title: "Senior Barber — Chair Available",
        role: "barber",
        compModel: "commission",
        payMin: 60,
        payMax: 70,
        payUnit: "%",
        payVisible: true,
        schedule: "full_time",
        employmentType: "c1099",
        experienceText: "3+ years",
        description: "Looking for an experienced barber to join our growing team. Must be skilled in classic cuts and modern fades.",
        locationId: locEncinitas.id,
        viewsCount: 47,
        inquiriesCount: 3,
        expiresAt: in14Days,
      },
    }),
    prisma.job.create({
      data: {
        employerProfileId: shop1.id,
        businessName: "American Deluxe Barbershop",
        title: "Apprentice Barber",
        role: "barber",
        compModel: "hourly",
        payMin: 16,
        payMax: 20,
        payUnit: "$/hr",
        payVisible: true,
        schedule: "part_time",
        employmentType: "w2",
        experienceText: "0-1 years",
        description: "Great opportunity for someone starting their barbering career. Training provided.",
        locationId: locEncinitas.id,
        viewsCount: 89,
        inquiriesCount: 1,
        expiresAt: in2Days,
      },
    }),
    prisma.job.create({
      data: {
        employerProfileId: shop2.id,
        businessName: "Pacific Coast Beauty Studio",
        title: "Hair Stylist — Booth Rental",
        role: "cosmetologist",
        compModel: "booth_rent",
        payMin: 200,
        payMax: 200,
        payUnit: "$/wk",
        payVisible: true,
        schedule: "full_time",
        experienceText: "2+ years",
        description: "Booth available for an independent stylist. Bring your own clientele. All amenities included.",
        locationId: locCarlsbad.id,
        viewsCount: 134,
        inquiriesCount: 5,
        expiresAt: in10Days,
      },
    }),
    prisma.job.create({
      data: {
        employerProfileId: shop2.id,
        businessName: "Pacific Coast Beauty Studio",
        title: "Nail Technician",
        role: "nail_tech",
        compModel: "commission",
        payMin: 50,
        payMax: 60,
        payUnit: "%",
        payVisible: true,
        schedule: "full_time",
        employmentType: "w2",
        experienceText: "1+ years",
        description: "Join our team! We specialize in gel, acrylic, and nail art. Must be licensed.",
        locationId: locCarlsbad.id,
        viewsCount: 63,
        inquiriesCount: 2,
        expiresAt: in14Days,
      },
    }),
    prisma.job.create({
      data: {
        employerProfileId: shop2.id,
        businessName: "Pacific Coast Beauty Studio",
        title: "Lash Extension Artist",
        role: "lash_tech",
        compModel: "hybrid",
        payMin: 15,
        payMax: 60,
        payUnit: "hybrid",
        payVisible: true,
        schedule: "part_time",
        experienceText: "1+ years",
        description: "Guaranteed $15/hr base plus 60% commission on lash extensions. Must be certified in classic and volume lash application.",
        locationId: locCarlsbad.id,
        viewsCount: 41,
        inquiriesCount: 1,
        expiresAt: in14Days,
      },
    }),
    prisma.job.create({
      data: {
        employerProfileId: shop3.id,
        businessName: "Iron & Ink Tattoo Studio",
        title: "Tattoo Artist — Traditional/Neo-Trad",
        role: "tattoo_artist",
        compModel: "commission",
        payMin: 50,
        payMax: 60,
        payUnit: "%",
        payVisible: true,
        schedule: "full_time",
        experienceText: "3+ years",
        description: "Seeking a talented tattoo artist specializing in traditional or neo-traditional styles.",
        locationId: locSD.id,
        viewsCount: 210,
        inquiriesCount: 12,
        expiresAt: expired,
      },
    }),
    prisma.job.create({
      data: {
        employerProfileId: shop3.id,
        businessName: "Iron & Ink Tattoo Studio",
        title: "Body Piercer",
        role: "piercer",
        compModel: "hourly",
        payMin: 22,
        payMax: 28,
        payUnit: "$/hr",
        payVisible: true,
        schedule: "part_time",
        experienceText: "2+ years",
        description: "Part-time piercer needed for weekends. Must have experience with ear, nose, and body piercings.",
        locationId: locSD.id,
        viewsCount: 35,
        inquiriesCount: 4,
        expiresAt: in14Days,
      },
    }),
    prisma.job.create({
      data: {
        employerProfileId: shop1.id,
        businessName: "American Deluxe Barbershop",
        title: "Barber — Escondido Location",
        role: "barber",
        compModel: "commission",
        payMin: 55,
        payMax: 65,
        payUnit: "%",
        payVisible: true,
        schedule: "full_time",
        experienceText: "2+ years",
        description: "New location opening! Be part of our expansion into Escondido.",
        locationId: locEscondido.id,
        viewsCount: 28,
        inquiriesCount: 0,
        expiresAt: in10Days,
      },
    }),
  ]);

  console.log(`✅ Created ${jobs.length} listings across San Diego County`);

  // ─── Inquiries ─────────────────────────────────────

  await prisma.inquiry.create({
    data: {
      senderId: talent1.id,
      jobId: jobs[0].id,
      name: "Alex Rivera",
      phone: "6195551001",
      note: "I have 5 years of experience and would love to join your team. Currently cutting at a shop in Oceanside.",
      instagram: "alex_cuts_sd",
    },
  });

  await prisma.inquiry.create({
    data: {
      senderId: talent2.id,
      jobId: jobs[2].id,
      name: "Maria Santos",
      phone: "6195551002",
      note: "Interested in the booth rental. I have a strong clientele in the Carlsbad area.",
      instagram: "maria_styles",
    },
  });

  await prisma.inquiry.create({
    data: {
      senderId: talent3.id,
      jobId: jobs[5].id,
      name: "Jaylen Brooks",
      phone: "6195551003",
      note: "Love the work coming out of Iron & Ink. My portfolio is on Instagram — would love to chat.",
      instagram: "jaylen_ink",
    },
  });

  console.log("✅ Created 3 sample inquiries");

  // ─── Notifications ────────────────────────────────

  await prisma.notification.createMany({
    data: [
      {
        userId: employer1.id,
        type: "inquiry",
        title: "New Inquiry",
        body: 'Alex Rivera sent an inquiry about "Senior Barber — Chair Available"',
        linkUrl: "/inbox",
        isRead: false,
      },
      {
        userId: employer2.id,
        type: "inquiry",
        title: "New Inquiry",
        body: 'Maria Santos sent an inquiry about "Hair Stylist — Booth Rental"',
        linkUrl: "/inbox",
        isRead: false,
      },
      {
        userId: employer3.id,
        type: "inquiry",
        title: "New Inquiry",
        body: 'Jaylen Brooks sent an inquiry about "Tattoo Artist"',
        linkUrl: "/inbox",
        isRead: true,
      },
      {
        userId: talent1.id,
        type: "system",
        title: "Profile Tip",
        body: "Complete your portfolio to stand out to scouts in your area.",
        isRead: false,
      },
    ],
  });

  console.log("✅ Created sample notifications");

  console.log("\n🎉 Seed complete!\n");
  console.log("Dev credentials:");
  console.log("  Talent:  talent@test.com / password");
  console.log("  Scout:   employer@test.com / password");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
