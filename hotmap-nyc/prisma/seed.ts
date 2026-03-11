// prisma/seed.ts
import { PrismaClient, Category, Borough, TrustBadge } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const VIBE_TAGS = [
  'quiet', 'loud', 'empty', 'moderate', 'packed',
  'good_for_studying', 'good_for_remote_work', 'social',
  'good_music', 'long_line', 'easy_seating', 'wifi_good', 'not_worth_it'
];

const PLACES = [
  // Manhattan Coffee
  { name: 'Think Coffee Mercer', address: '248 Mercer St, New York, NY 10012', neighborhood: 'Greenwich Village', borough: Borough.MANHATTAN, category: Category.COFFEE, tags: ['study-friendly', 'wifi', 'quiet'], lat: 40.7283, lng: -73.9981 },
  { name: 'Stumptown Coffee Roasters', address: '30 W 8th St, New York, NY 10011', neighborhood: 'Greenwich Village', borough: Borough.MANHATTAN, category: Category.COFFEE, tags: ['specialty-coffee', 'quick'], lat: 40.7314, lng: -73.9984 },
  { name: 'Joe Coffee Partners', address: '141 Waverly Pl, New York, NY 10014', neighborhood: 'West Village', borough: Borough.MANHATTAN, category: Category.COFFEE, tags: ['cozy', 'neighborhood-gem'], lat: 40.7341, lng: -74.0003 },
  { name: 'Cafe Grumpy Chelsea', address: '224 W 20th St, New York, NY 10011', neighborhood: 'Chelsea', borough: Borough.MANHATTAN, category: Category.COFFEE, tags: ['specialty', 'study-ok'], lat: 40.7432, lng: -74.0004 },
  { name: 'Black Fox Coffee', address: '70 Pine St, New York, NY 10005', neighborhood: 'Financial District', borough: Borough.MANHATTAN, category: Category.COFFEE, tags: ['workspace', 'wifi', 'fast'], lat: 40.7065, lng: -74.0083 },
  { name: 'Devocion', address: '69 Grand St, New York, NY 10013', neighborhood: 'SoHo', borough: Borough.MANHATTAN, category: Category.COFFEE, tags: ['specialty', 'beautiful-space', 'instagram'], lat: 40.7227, lng: -74.0004 },
  { name: 'Everyman Espresso', address: '136 E 13th St, New York, NY 10003', neighborhood: 'East Village', borough: Borough.MANHATTAN, category: Category.COFFEE, tags: ['study-friendly', 'neighborhood'], lat: 40.7310, lng: -73.9875 },
  
  // Brooklyn Coffee
  { name: 'Toby\'s Estate Williamsburg', address: '125 N 6th St, Brooklyn, NY 11249', neighborhood: 'Williamsburg', borough: Borough.BROOKLYN, category: Category.COFFEE, tags: ['roastery', 'study-ok', 'spacious'], lat: 40.7176, lng: -73.9648 },
  { name: 'Sey Coffee', address: '18 Grattan St, Brooklyn, NY 11206', neighborhood: 'Bushwick', borough: Borough.BROOKLYN, category: Category.COFFEE, tags: ['specialty', 'local-roaster'], lat: 40.7062, lng: -73.9358 },
  { name: 'Partners Coffee', address: '125 N 6th St, Brooklyn, NY 11249', neighborhood: 'Williamsburg', borough: Borough.BROOKLYN, category: Category.COFFEE, tags: ['quick', 'good-espresso'], lat: 40.7174, lng: -73.9654 },
  
  // Libraries
  { name: 'New York Public Library - Main Branch', address: '476 5th Ave, New York, NY 10018', neighborhood: 'Midtown', borough: Borough.MANHATTAN, category: Category.LIBRARY, tags: ['iconic', 'quiet', 'study', 'wifi'], lat: 40.7532, lng: -73.9822 },
  { name: 'Jefferson Market Library', address: '425 6th Ave, New York, NY 10011', neighborhood: 'West Village', borough: Borough.MANHATTAN, category: Category.LIBRARY, tags: ['beautiful', 'quiet', 'study'], lat: 40.7334, lng: -74.0000 },
  { name: 'Brooklyn Central Library', address: '10 Grand Army Plaza, Brooklyn, NY 11238', neighborhood: 'Prospect Heights', borough: Borough.BROOKLYN, category: Category.LIBRARY, tags: ['large', 'study', 'quiet', 'wifi'], lat: 40.6726, lng: -73.9685 },
  { name: 'Mulberry Street Library', address: '10 Jersey St, New York, NY 10012', neighborhood: 'SoHo', borough: Borough.MANHATTAN, category: Category.LIBRARY, tags: ['small', 'quiet', 'hidden-gem'], lat: 40.7254, lng: -74.0003 },
  { name: 'St Agnes Branch Library', address: '444 Amsterdam Ave, New York, NY 10024', neighborhood: 'Upper West Side', borough: Borough.MANHATTAN, category: Category.LIBRARY, tags: ['study', 'quiet', 'neighborhood'], lat: 40.7827, lng: -73.9813 },
  
  // Study spots (non-library)
  { name: 'NYU Bobst Library (public areas)', address: '70 Washington Square S, New York, NY 10012', neighborhood: 'Greenwich Village', borough: Borough.MANHATTAN, category: Category.STUDY, tags: ['university', 'huge', 'wifi', 'quiet'], lat: 40.7295, lng: -73.9972 },
  { name: 'The Atrium at 55 Water', address: '55 Water St, New York, NY 10041', neighborhood: 'Financial District', borough: Borough.MANHATTAN, category: Category.STUDY, tags: ['hidden-gem', 'quiet', 'spacious', 'free'], lat: 40.7036, lng: -74.0095 },
  { name: 'iPic Theaters Lobby', address: '11 Fulton St, New York, NY 10038', neighborhood: 'FiDi', borough: Borough.MANHATTAN, category: Category.STUDY, tags: ['comfy', 'wifi', 'food-nearby'], lat: 40.7084, lng: -74.0033 },
  
  // Gyms
  { name: 'Equinox Bryant Park', address: '150 W 50th St, New York, NY 10020', neighborhood: 'Midtown', borough: Borough.MANHATTAN, category: Category.GYM, tags: ['premium', 'large', 'classes'], lat: 40.7614, lng: -73.9833 },
  { name: 'TMPL Gym Hell\'s Kitchen', address: '433 W 34th St, New York, NY 10001', neighborhood: 'Hell\'s Kitchen', borough: Borough.MANHATTAN, category: Category.GYM, tags: ['lgbtq-friendly', 'modern', 'classes'], lat: 40.7521, lng: -74.0006 },
  { name: 'BKLYN Clay', address: '190 Dupont St, Brooklyn, NY 11222', neighborhood: 'Greenpoint', borough: Borough.BROOKLYN, category: Category.GYM, tags: ['studio', 'pottery', 'unique'], lat: 40.7248, lng: -73.9519 },
  { name: 'CrossFit Williamsburg', address: '99 N 11th St, Brooklyn, NY 11249', neighborhood: 'Williamsburg', borough: Borough.BROOKLYN, category: Category.GYM, tags: ['crossfit', 'community', 'intense'], lat: 40.7198, lng: -73.9568 },
  
  // Bars / Nightlife
  { name: 'The Dead Rabbit', address: '30 Water St, New York, NY 10004', neighborhood: 'Financial District', borough: Borough.MANHATTAN, category: Category.BAR, tags: ['cocktails', 'award-winning', 'historic'], lat: 40.7030, lng: -74.0118 },
  { name: 'Please Don\'t Tell (PDT)', address: '113 St Marks Pl, New York, NY 10009', neighborhood: 'East Village', borough: Borough.MANHATTAN, category: Category.BAR, tags: ['speakeasy', 'craft-cocktails', 'intimate'], lat: 40.7268, lng: -73.9836 },
  { name: 'Maison Premiere', address: '298 Bedford Ave, Brooklyn, NY 11249', neighborhood: 'Williamsburg', borough: Borough.BROOKLYN, category: Category.BAR, tags: ['absinthe', 'oysters', 'garden', 'romantic'], lat: 40.7144, lng: -73.9618 },
  { name: 'Amor y Amargo', address: '443 E 6th St, New York, NY 10009', neighborhood: 'East Village', borough: Borough.MANHATTAN, category: Category.BAR, tags: ['bitters', 'tiny', 'cozy', 'unique'], lat: 40.7256, lng: -73.9817 },
  { name: 'Output Brooklyn', address: '74 Wythe Ave, Brooklyn, NY 11249', neighborhood: 'Williamsburg', borough: Borough.BROOKLYN, category: Category.BAR, tags: ['nightclub', 'techno', 'rooftop'], lat: 40.7228, lng: -73.9605 },
  { name: 'Employees Only', address: '510 Hudson St, New York, NY 10014', neighborhood: 'West Village', borough: Borough.MANHATTAN, category: Category.BAR, tags: ['speakeasy-style', 'cocktails', 'late-night'], lat: 40.7331, lng: -74.0070 },
  
  // Food
  { name: 'Xi\'an Famous Foods', address: '81 St Marks Pl, New York, NY 10003', neighborhood: 'East Village', borough: Borough.MANHATTAN, category: Category.FOOD, tags: ['noodles', 'cheap', 'quick', 'spicy'], lat: 40.7272, lng: -73.9850 },
  { name: 'Smorgasburg Williamsburg', address: '90 Kent Ave, Brooklyn, NY 11249', neighborhood: 'Williamsburg', borough: Borough.BROOKLYN, category: Category.FOOD, tags: ['outdoor-market', 'variety', 'weekend'], lat: 40.7190, lng: -73.9636 },
  { name: 'Superiority Burger', address: '119 Ave A, New York, NY 10009', neighborhood: 'East Village', borough: Borough.MANHATTAN, category: Category.FOOD, tags: ['vegetarian', 'cheap', 'tasty'], lat: 40.7243, lng: -73.9810 },
  { name: 'Prince Street Pizza', address: '27 Prince St, New York, NY 10012', neighborhood: 'SoHo', borough: Borough.MANHATTAN, category: Category.FOOD, tags: ['pizza', 'iconic', 'line-expected'], lat: 40.7240, lng: -74.0001 },
  { name: 'Di Fara Pizza', address: '1424 Avenue J, Brooklyn, NY 11230', neighborhood: 'Midwood', borough: Borough.BROOKLYN, category: Category.FOOD, tags: ['legendary', 'pizza', 'worth-the-wait'], lat: 40.6252, lng: -73.9617 },
  { name: 'Hometown Bar-B-Que', address: '454 Van Brunt St, Brooklyn, NY 11231', neighborhood: 'Red Hook', borough: Borough.BROOKLYN, category: Category.FOOD, tags: ['bbq', 'best-in-nyc', 'casual'], lat: 40.6774, lng: -74.0094 },
  
  // Parks / Chill
  { name: 'Bryant Park', address: 'Bryant Park, New York, NY 10018', neighborhood: 'Midtown', borough: Borough.MANHATTAN, category: Category.PARK, tags: ['outdoor', 'events', 'wifi', 'seating'], lat: 40.7536, lng: -73.9832 },
  { name: 'The High Line', address: 'High Line, New York, NY 10011', neighborhood: 'Chelsea', borough: Borough.MANHATTAN, category: Category.PARK, tags: ['elevated', 'scenic', 'walking', 'art'], lat: 40.7480, lng: -74.0048 },
  { name: 'Domino Park', address: '15 River St, Brooklyn, NY 11249', neighborhood: 'Williamsburg', borough: Borough.BROOKLYN, category: Category.PARK, tags: ['waterfront', 'chill', 'views', 'young-crowd'], lat: 40.7152, lng: -73.9636 },
  { name: 'Prospect Park', address: 'Prospect Park, Brooklyn, NY 11215', neighborhood: 'Park Slope', borough: Borough.BROOKLYN, category: Category.PARK, tags: ['large', 'nature', 'picnic', 'events'], lat: 40.6602, lng: -73.9690 },
  { name: 'Gantry Plaza State Park', address: '4-09 47th Rd, Long Island City, NY 11101', neighborhood: 'Long Island City', borough: Borough.QUEENS, category: Category.PARK, tags: ['waterfront', 'views', 'manhattan-skyline', 'chill'], lat: 40.7457, lng: -73.9574 },
  { name: 'Roosevelt Island', address: 'Roosevelt Island, New York, NY 10044', neighborhood: 'Roosevelt Island', borough: Borough.MANHATTAN, category: Category.PARK, tags: ['peaceful', 'unique', 'tram', 'hidden-gem'], lat: 40.7616, lng: -73.9491 },
];

const SAMPLE_NOTES = [
  'Pretty packed but still a few seats upstairs',
  'Good study vibe right now',
  'Line is insane, not worth it',
  'Super quiet, great for focusing',
  'Lively crowd, good energy',
  'WiFi is solid today',
  'A bit noisy but manageable',
  'Empty — best time to come',
  'Staff is really friendly tonight',
  'Music is too loud for working',
  'Tons of open tables right now',
  'Getting crowded quickly',
];

async function main() {
  console.log('🌱 Seeding Hot Map NYC...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alex@hotmapnyc.com',
        username: 'alex_nyc',
        passwordHash: hashedPassword,
        profile: { create: { borough: Borough.BROOKLYN, neighborhood: 'Williamsburg', interests: ['coffee', 'remote_work', 'nightlife'] } },
        trustScore: { create: { score: 87, badge: TrustBadge.TOP_SPOTTER, totalPings: 145, upvotesReceived: 67 } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'maya@hotmapnyc.com',
        username: 'maya_studies',
        passwordHash: hashedPassword,
        profile: { create: { borough: Borough.MANHATTAN, neighborhood: 'Greenwich Village', interests: ['studying', 'coffee', 'libraries'] } },
        trustScore: { create: { score: 62, badge: TrustBadge.TRUSTED_LOCAL, totalPings: 89, upvotesReceived: 41 } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'jordan@hotmapnyc.com',
        username: 'jordan_ftw',
        passwordHash: hashedPassword,
        profile: { create: { borough: Borough.MANHATTAN, neighborhood: 'East Village', interests: ['bars', 'food', 'gyms'] } },
        trustScore: { create: { score: 34, badge: TrustBadge.NEW_CONTRIBUTOR, totalPings: 23, upvotesReceived: 8 } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'demo@hotmapnyc.com',
        username: 'demo_user',
        passwordHash: hashedPassword,
        profile: { create: { borough: Borough.BROOKLYN, neighborhood: 'Park Slope', interests: ['coffee', 'studying', 'parks'] } },
        trustScore: { create: { score: 10, badge: TrustBadge.NEW_CONTRIBUTOR, totalPings: 5, upvotesReceived: 2 } },
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create places
  const createdPlaces = await Promise.all(
    PLACES.map(place =>
      prisma.place.create({
        data: {
          ...place,
          vibeScore: Math.random() * 40 + 60,
          trendVelocity: Math.random() * 10,
          avgCrowdLevel: Math.random() * 4 + 1,
          avgNoiseLevel: Math.random() * 4 + 1,
          avgStudyScore: place.category === Category.COFFEE || place.category === Category.LIBRARY || place.category === Category.STUDY ? Math.random() * 3 + 2 : Math.random() * 2 + 1,
          avgWifiScore: ['wifi'].some(t => place.tags.includes(t)) ? Math.random() * 2 + 3 : Math.random() * 3 + 1,
          avgSocialScore: [Category.BAR, Category.FOOD, Category.PARK].includes(place.category) ? Math.random() * 2 + 3 : Math.random() * 3 + 1,
        },
      })
    )
  );

  console.log(`✅ Created ${createdPlaces.length} places`);

  // Create sample pings
  const now = new Date();
  const pingsData = [];
  
  for (const place of createdPlaces) {
    const pingCount = Math.floor(Math.random() * 8) + 2;
    for (let i = 0; i < pingCount; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const minsAgo = Math.floor(Math.random() * 120);
      const createdAt = new Date(now.getTime() - minsAgo * 60 * 1000);
      
      // Pick 2-4 random vibe tags
      const tagCount = Math.floor(Math.random() * 3) + 2;
      const shuffled = [...VIBE_TAGS].sort(() => 0.5 - Math.random());
      const vibeTags = shuffled.slice(0, tagCount);
      
      const crowdTag = vibeTags.find(t => ['empty', 'moderate', 'packed'].includes(t));
      const crowdLevel = crowdTag === 'empty' ? 1 : crowdTag === 'packed' ? 5 : 3;
      
      pingsData.push({
        placeId: place.id,
        userId: user.id,
        vibeTags,
        crowdLevel,
        noiseLevel: Math.floor(Math.random() * 4) + 1,
        note: Math.random() > 0.5 ? SAMPLE_NOTES[Math.floor(Math.random() * SAMPLE_NOTES.length)] : null,
        trustWeight: 1.0,
        upvotes: Math.floor(Math.random() * 12),
        createdAt,
        expiresAt: new Date(createdAt.getTime() + 3 * 60 * 60 * 1000),
      });
    }
  }

  await prisma.ping.createMany({ data: pingsData });
  console.log(`✅ Created ${pingsData.length} sample pings`);

  // Create saved places for demo user
  const demoUser = users[3];
  await prisma.savedPlace.createMany({
    data: [
      { userId: demoUser.id, placeId: createdPlaces[0].id },
      { userId: demoUser.id, placeId: createdPlaces[10].id },
      { userId: demoUser.id, placeId: createdPlaces[34].id },
    ],
  });

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      { userId: demoUser.id, type: 'PLACE_TRENDING', placeId: createdPlaces[0].id, message: 'Think Coffee Mercer is trending right now 🔥', isRead: false },
      { userId: demoUser.id, type: 'PLACE_NEW_PINGS', placeId: createdPlaces[10].id, message: 'New pings at NYPL Main Branch - currently quiet and great for studying', isRead: false },
      { userId: demoUser.id, type: 'NEIGHBORHOOD_ACTIVITY', message: 'High activity in Park Slope tonight', isRead: true },
    ],
  });

  console.log('✅ Created saved places and notifications');
  console.log('\n🗽 Hot Map NYC seeded successfully!');
  console.log('\n📋 Demo credentials:');
  console.log('   Email: demo@hotmapnyc.com');
  console.log('   Password: password123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
