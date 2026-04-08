const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Listify database...\n");

  const hash = await bcrypt.hash("password", 10);

  // ─── Users ───────────────────────────────────────
  const talentUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: "talent@test.com",
        name: "Carlos Martinez",
        passwordHash: hash,
        role: "talent",
        onboarded: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "talent2@test.com",
        name: "Jasmine Lee",
        passwordHash: hash,
        role: "talent",
        onboarded: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "talent3@test.com",
        name: "Mike Torres",
        passwordHash: hash,
        role: "talent",
        onboarded: true,
      },
    }),
  ]);

  const scoutUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: "employer@test.com",
        name: "Sarah Chen",
        passwordHash: hash,
        role: "employer",
        onboarded: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "employer2@test.com",
        name: "David Park",
        passwordHash: hash,
        role: "employer",
        onboarded: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "employer3@test.com",
        name: "Reiko Tanaka",
        passwordHash: hash,
        role: "employer",
        onboarded: true,
      },
    }),
  ]);

  console.log(`✅ Created ${talentUsers.length + scoutUsers.length} users`);

  // ─── Talent Profiles ─────────────────────────────
  await Promise.all([
    prisma.talentProfile.create({
      data: {
        userId: talentUsers[0].id,
        industry: "hair",
        licenses: ["barber"],
        headline: "Experienced barber — fades & tapers",
        bio: "8 years behind the chair. Specialize in skin fades, beard sculpting, and classic cuts.",
        yearsExperience: 8,
        instagram: "carlos_cuts_sd",
      },
    }),
    prisma.talentProfile.create({
      data: {
        userId: talentUsers[1].id,
        industry: "hair",
        licenses: ["cosmetologist", "barber"],
        headline: "Licensed cosmetologist + barber",
        bio: "Dual-licensed with 5 years of experience. Color specialist and precision cuts.",
        yearsExperience: 5,
        instagram: "jasmine.styles",
      },
    }),
    prisma.talentProfile.create({
      data: {
        userId: talentUsers[2].id,
        industry: "tattoo",
        licenses: ["tattoo_artist", "piercer"],
        headline: "Tattoo artist & piercer — 10 years",
        bio: "Blackwork, fine line, and all piercings. Portfolio on Instagram.",
        yearsExperience: 10,
        instagram: "miketorres_ink",
      },
    }),
  ]);

  console.log("✅ Created talent profiles");

  // ─── Locations ────────────────────────────────────
  const locations = await Promise.all([
    prisma.location.create({
      data: { lat: 33.0376, lng: -117.2920, addressLine1: "102 Encinitas Blvd", city: "Encinitas", state: "CA" },
    }),
    prisma.location.create({
      data: { lat: 33.1581, lng: -117.3506, addressLine1: "300 Carlsbad Village Dr", city: "Carlsbad", state: "CA" },
    }),
    prisma.location.create({
      data: { lat: 33.1959, lng: -117.3795, addressLine1: "401 Mission Ave", city: "Oceanside", state: "CA" },
    }),
    prisma.location.create({
      data: { lat: 32.7157, lng: -117.1611, addressLine1: "750 Fifth Ave", city: "San Diego", state: "CA" },
    }),
    prisma.location.create({
      data: { lat: 33.1192, lng: -117.0864, addressLine1: "200 E Grand Ave", city: "Escondido", state: "CA" },
    }),
    prisma.location.create({
      data: { lat: 33.2000, lng: -117.2426, addressLine1: "600 S Santa Fe Ave", city: "Vista", state: "CA" },
    }),
  ]);

  console.log(`✅ Created ${locations.length} locations`);

  // ─── Employer Profiles ────────────────────────────
  const profiles = await Promise.all([
    prisma.employerProfile.create({
      data: {
        userId: scoutUsers[0].id,
        shopName: "American Deluxe Barbershop",
        shopType: "barbershop",
        industry: "hair",
        about: "Premium barbershop in North County. Walk-ins welcome.",
        phone: "7605551234",
        teamSize: 6,
        locationId: locations[0].id,
      },
    }),
    prisma.employerProfile.create({
      data: {
        userId: scoutUsers[1].id,
        shopName: "Pacific Hair Studio",
        shopType: "salon",
        industry: "hair",
        about: "Full-service salon in Carlsbad Village. Color specialists.",
        phone: "7605555678",
        teamSize: 8,
        locationId: locations[1].id,
      },
    }),
    prisma.employerProfile.create({
      data: {
        userId: scoutUsers[2].id,
        shopName: "Iron Tide Tattoo",
        shopType: "tattoo_shop",
        industry: "tattoo",
        about: "Custom tattoo studio and piercings in downtown SD.",
        phone: "6195559999",
        teamSize: 4,
        locationId: locations[3].id,
      },
    }),
  ]);

  console.log(`✅ Created ${profiles.length} employer profiles`);

  // ─── Jobs (Listings) ──────────────────────────────
  const now = new Date();
  const d = (days) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    return date;
  };

  const jobs = await Promise.all([
    // Hair listings — barbershop wants barbers only
    prisma.job.create({
      data: {
        employerProfileId: profiles[0].id,
        businessName: "American Deluxe Barbershop",
        title: "Barber — Encinitas Location",
        industry: "hair",
        specialties: ["barber"],
        compModel: "commission",
        payMin: 65,
        payMax: 65,
        payUnit: "%",
        experienceText: "2+ years",
        description: "Looking for a licensed barber. Busy shop with walk-ins daily.",
        locationId: locations[0].id,
        expiresAt: d(14),
      },
    }),
    // Hair listing — barbershop open to barbers OR cosmetologists
    prisma.job.create({
      data: {
        employerProfileId: profiles[0].id,
        businessName: "American Deluxe Barbershop",
        title: "Senior Barber — Chair Available",
        industry: "hair",
        specialties: ["barber", "cosmetologist"],
        compModel: "booth_rent",
        payMin: 200,
        payMax: 200,
        payUnit: "$/wk",
        experienceText: "3+ years",
        description: "Chair rental. Barber or cosmo license accepted. Build your own clientele.",
        locationId: locations[0].id,
        expiresAt: d(2),  // expiring soon
      },
    }),
    // Salon wants cosmetologists only
    prisma.job.create({
      data: {
        employerProfileId: profiles[1].id,
        businessName: "Pacific Hair Studio",
        title: "Cosmetologist — Color Specialist",
        industry: "hair",
        specialties: ["cosmetologist"],
        compModel: "hourly",
        payMin: 22,
        payMax: 28,
        payUnit: "$/hr",
        experienceText: "2+ years",
        description: "Seeking a licensed cosmetologist with color experience.",
        locationId: locations[1].id,
        expiresAt: d(14),
      },
    }),
    // Salon open to both
    prisma.job.create({
      data: {
        employerProfileId: profiles[1].id,
        businessName: "Pacific Hair Studio",
        title: "Stylist — Cuts & Color",
        industry: "hair",
        specialties: ["barber", "cosmetologist"],
        compModel: "hybrid",
        payMin: 15,
        payMax: 60,
        payUnit: "hybrid",
        description: "Looking for a versatile stylist. Any license welcome.",
        locationId: locations[1].id,
        expiresAt: d(2),
      },
    }),
    // Tattoo shop wants tattoo artist
    prisma.job.create({
      data: {
        employerProfileId: profiles[2].id,
        businessName: "Iron Tide Tattoo",
        title: "Tattoo Artist — Custom Work",
        industry: "tattoo",
        specialties: ["tattoo_artist"],
        compModel: "commission",
        payMin: 60,
        payMax: 60,
        payUnit: "%",
        experienceText: "3+ years",
        description: "Looking for an artist with a strong portfolio. Custom work only.",
        locationId: locations[3].id,
        expiresAt: d(-2), // Expired
      },
    }),
    // Tattoo shop wants piercer
    prisma.job.create({
      data: {
        employerProfileId: profiles[2].id,
        businessName: "Iron Tide Tattoo",
        title: "Piercer — Full Time",
        industry: "tattoo",
        specialties: ["piercer"],
        compModel: "hourly",
        payMin: 20,
        payMax: 25,
        payUnit: "$/hr",
        schedule: "full_time",
        description: "Need an experienced piercer for our downtown location.",
        locationId: locations[3].id,
        expiresAt: d(10),
      },
    }),
    // Tattoo shop wants both
    prisma.job.create({
      data: {
        employerProfileId: profiles[2].id,
        businessName: "Iron Tide Tattoo",
        title: "Artist or Piercer — Booth Rent",
        industry: "tattoo",
        specialties: ["tattoo_artist", "piercer"],
        compModel: "booth_rent",
        payMin: 300,
        payMax: 300,
        payUnit: "$/wk",
        description: "Private room available. Tattoo artist or piercer welcome.",
        locationId: locations[3].id,
        expiresAt: d(14),
      },
    }),
    // Barbershop in Escondido
    prisma.job.create({
      data: {
        employerProfileId: profiles[0].id,
        businessName: "American Deluxe Barbershop",
        title: "Barber — Escondido Location",
        industry: "hair",
        specialties: ["barber"],
        compModel: "commission",
        payMin: 60,
        payMax: 70,
        payUnit: "%",
        experienceText: "1+ years",
        description: "New location opening. Looking for barbers to join the team.",
        locationId: locations[4].id,
        expiresAt: d(-3),  // expired
      },
    }),
  ]);

  console.log(`✅ Created ${jobs.length} listings`);

  // ─── Inquiries ────────────────────────────────────
  await Promise.all([
    prisma.inquiry.create({
      data: {
        senderId: talentUsers[0].id,
        jobId: jobs[0].id,
        name: "Carlos Martinez",
        phone: "7605551111",
        note: "8 years experience, looking for a new chair. Available immediately.",
        instagram: "carlos_cuts_sd",
      },
    }),
    prisma.inquiry.create({
      data: {
        senderId: talentUsers[1].id,
        jobId: jobs[2].id,
        name: "Jasmine Lee",
        phone: "7605552222",
        note: "Licensed cosmetologist with 5 years color experience.",
        instagram: "jasmine.styles",
      },
    }),
    prisma.inquiry.create({
      data: {
        senderId: talentUsers[2].id,
        jobId: jobs[5].id,
        name: "Mike Torres",
        phone: "6195553333",
        note: "10 years piercing experience. APP certified.",
        instagram: "miketorres_ink",
      },
    }),
  ]);

  // Update inquiry counts
  await prisma.job.update({ where: { id: jobs[0].id }, data: { inquiriesCount: 1 } });
  await prisma.job.update({ where: { id: jobs[2].id }, data: { inquiriesCount: 1 } });
  await prisma.job.update({ where: { id: jobs[5].id }, data: { inquiriesCount: 1 } });

  console.log("✅ Created 3 inquiries");

  // ─── Notifications ────────────────────────────────
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: scoutUsers[0].id,
        type: "inquiry",
        title: "New Inquiry",
        body: "Carlos Martinez sent an inquiry for Barber — Encinitas Location",
        linkUrl: `/jobs/${jobs[0].id}`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: scoutUsers[1].id,
        type: "inquiry",
        title: "New Inquiry",
        body: "Jasmine Lee sent an inquiry for Cosmetologist — Color Specialist",
        linkUrl: `/jobs/${jobs[2].id}`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: scoutUsers[2].id,
        type: "inquiry",
        title: "New Inquiry",
        body: "Mike Torres sent an inquiry for Piercer — Full Time",
        linkUrl: `/jobs/${jobs[5].id}`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: talentUsers[0].id,
        type: "system",
        title: "Welcome to Listify",
        body: "Start browsing listings in San Diego County.",
        isRead: true,
      },
    }),
  ]);

  console.log("✅ Created 4 notifications");
  console.log("\n🎉 Seed complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
