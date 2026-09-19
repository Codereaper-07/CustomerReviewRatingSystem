/**
 * Comprehensive Database Reset & Random Seed Script.
 *
 * Usage: node src/scripts/seedAll.js
 *
 * Actions:
 *  1. Flushes Redis cache.
 *  2. Deletes ALL documents from:
 *     - users
 *     - products
 *     - reviews
 *     - votes
 *     - reports
 *     - notifications
 *  3. Seeds:
 *     - 1 Administrator account (admin@example.com / Password@123)
 *     - 12 Realistic customer accounts (all Password@123)
 *     - 24 Products across Electronics, Home & Kitchen, Sports & Outdoors, Books, Clothing
 *     - Realistic randomized reviews per product (with matched ratingStats)
 *     - Realistic upvotes and downvotes (with matched voteStats)
 *     - Sample moderation reports (pending, resolved, dismissed)
 *     - Sample user notifications
 *  4. AI Insights are intentionally left unpopulated (summary: null, lastGeneratedAt: null)
 *     so they are generated dynamically by Gemini when the cron job runs or server boots.
 */

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { connectRedis, disconnectRedis } from '../config/redis.js';
import redisClient from '../config/redis.js';
import User from '../modules/users/user.model.js';
import Product from '../modules/products/product.model.js';
import Review from '../modules/reviews/review.model.js';
import Vote from '../modules/votes/vote.model.js';
import Report from '../modules/reports/report.model.js';
import Notification from '../modules/notifications/notification.model.js';

const PASSWORD_PLAIN = 'Password@123';

const CUSTOMER_NAMES = [
  'Alex Morgan',
  'Sarah Chen',
  'Marcus Johnson',
  'Elena Rostova',
  'David Kim',
  'Priya Patel',
  'James Wilson',
  'Maya Lin',
  'Lucas Silva',
  'Emily Davis',
  'Hassan Malik',
  'Chloe Bennett',
];

const RAW_PRODUCTS = [
  // Electronics
  {
    name: 'Aurora Wireless ANC Headphones',
    category: 'Electronics',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    description: 'Over-ear wireless headphones featuring hybrid active noise cancellation, ambient transparency mode, and 35-hour battery life with ultra-fast USB-C charging.',
  },
  {
    name: 'Nimbus 27-Inch 4K UHD Monitor',
    category: 'Electronics',
    price: 349.5,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    description: 'Crisp 4K IPS display panel with HDR400, 99% sRGB color gamut accuracy, and dual HDMI 2.1 / DisplayPort connections for creative and professional work.',
  },
  {
    name: 'Pulse RGB Mechanical Gaming Keyboard',
    category: 'Electronics',
    price: 99.0,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    description: 'Tactile hot-swappable switches, sound-dampening silicone foam, per-key RGB lighting, and an aircraft-grade aluminum top plate for pro gamers.',
  },
  {
    name: 'Vortex Portable NVMe SSD 1TB',
    category: 'Electronics',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
    description: 'Ruggedized IP55 water- and drop-resistant 1TB external solid state drive offering blisteringly fast read/write speeds up to 1050 MB/s.',
  },
  {
    name: 'Halo Smart Speaker with Spatial Audio',
    category: 'Electronics',
    price: 69.0,
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80',
    description: 'Room-filling 360-degree acoustic architecture with integrated smart assistant voice control and lossless streaming playback over Wi-Fi.',
  },
  {
    name: 'Zenith 4K Waterproof Action Camera',
    category: 'Electronics',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    description: 'Compact 4K/60fps video action cam with dual full-color preview screens, advanced 6-axis gyro stabilization, and waterproof housing to 30 meters.',
  },

  // Home & Kitchen
  {
    name: 'Ember Ceramic Non-Stick Cookware Set',
    category: 'Home & Kitchen',
    price: 149.0,
    image: 'https://images.unsplash.com/photo-1584990347449-399d81d22329?auto=format&fit=crop&w=800&q=80',
    description: '10-piece toxin-free ceramic-coated non-stick cookware set including saucepans, skillets, and dutch oven, oven-safe up to 500°F.',
  },
  {
    name: 'Drift Precision Temperature Electric Kettle',
    category: 'Home & Kitchen',
    price: 54.99,
    image: 'https://images.unsplash.com/photo-1594213114663-dd96813bfb0a?auto=format&fit=crop&w=800&q=80',
    description: 'Gooseneck stainless steel kettle with 1°F precise temperature control, keep-warm function, and rapid boil heating element for artisanal brewing.',
  },
  {
    name: 'Solace Ergonomic Memory Foam Pillow',
    category: 'Home & Kitchen',
    price: 39.5,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    description: 'Contoured therapeutic cooling-gel memory foam pillow engineered to relieve cervical neck pressure and support optimal spinal alignment.',
  },
  {
    name: 'Grove Organic Bamboo Cutting Board Trio',
    category: 'Home & Kitchen',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80',
    description: 'Set of three heavy-duty, knife-friendly organic bamboo cutting boards equipped with deep juice grooves and recessed side handles.',
  },
  {
    name: 'Cascade Borosilicate Glass French Press',
    category: 'Home & Kitchen',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    description: '1000ml heat-resistant borosilicate glass coffee press with dual stainless steel mesh filtration to capture oils without sediment.',
  },
  {
    name: 'Lumen Dimmable LED Desk Task Lamp',
    category: 'Home & Kitchen',
    price: 44.0,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    description: 'Modern eye-care LED desk lamp with 5 color temperatures, slide touch brightness dimmer, 45-minute sleep timer, and 10W wireless charging base.',
  },

  // Sports & Outdoors
  {
    name: 'Summit Double-Wall Insulated Bottle 32oz',
    category: 'Sports & Outdoors',
    price: 26.5,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    description: 'Vacuum insulated 18/8 food-grade stainless steel bottle keeping liquids ice cold for 24 hours or piping hot for 12 hours. Sweat-free powder coat.',
  },
  {
    name: 'Trailhead All-Weather Trekking Backpack 40L',
    category: 'Sports & Outdoors',
    price: 89.0,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    description: 'Lightweight ripstop nylon trail pack with integrated rain cover, hydration bladder sleeve, ergonomic load-bearing hip belts, and trekking pole loops.',
  },
  {
    name: 'Momentum Non-Slip Extra Thick Yoga Mat',
    category: 'Sports & Outdoors',
    price: 38.0,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80',
    description: 'Eco-friendly high-density TPE yoga mat featuring dual-sided non-slip laser-etched alignment lines and 6mm joint-cushioning thickness.',
  },
  {
    name: 'Ridgeline Carbon Fiber Trekking Poles',
    category: 'Sports & Outdoors',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80',
    description: 'Pair of ultra-lightweight 100% carbon fiber walking poles with quick-flip lock adjustment, moisture-wicking cork grips, and tungsten carbide tips.',
  },
  {
    name: 'Current Anti-Fog Mirrored Swim Goggles',
    category: 'Sports & Outdoors',
    price: 21.0,
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    description: 'Hydrodynamic wide-vision swim goggles with UV400 mirrored lenses, leakproof silicone gaskets, and three interchangeable nose bridge sizes.',
  },

  // Books
  {
    name: 'The Quiet Algorithm',
    category: 'Books',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    description: 'A gripping speculative thriller tracking an autonomous infrastructure engineer who uncovers a hidden sentient loop inside global logistics routing.',
  },
  {
    name: 'Designing Scalable Cloud Architectures',
    category: 'Books',
    price: 48.5,
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e37271?auto=format&fit=crop&w=800&q=80',
    description: 'Comprehensive engineering guide detailing modern distributed system design, microservices communication patterns, reliability, and edge caching.',
  },
  {
    name: 'Gardens of Low Earth Orbit',
    category: 'Books',
    price: 16.5,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    description: 'An acclaimed sci-fi narrative chronicling the daily trials, philosophical musings, and botanical triumphs of a solitary space station greenhouse keeper.',
  },
  {
    name: 'Mindful Mornings & Intentional Days',
    category: 'Books',
    price: 14.0,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    description: 'Evidence-based cognitive rituals and structured reflective practices designed to build calm morning routines and focused daily intentionality.',
  },

  // Clothing & Accessories
  {
    name: 'Aero Merino Wool Crewneck Sweatshirt',
    category: 'Clothing',
    price: 78.0,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    description: 'Thermoregulating, odor-resistant Australian merino wool sweatshirt tailored with reinforced rib knit cuffs and flatlock seams.',
  },
  {
    name: 'Vanguard Weatherproof Commuter Daypack',
    category: 'Clothing',
    price: 95.0,
    image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
    description: 'Sleek minimalist commuter bag constructed with waterproof coated canvas, magnetic FIDLOCK buckles, and padded 16-inch laptop compartment.',
  },
  {
    name: 'Nomad Polarized Aviator Sunglasses',
    category: 'Clothing',
    price: 45.0,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    description: 'Classic aviator silhouette with featherlight titanium alloy frames, spring hinges, and category-3 UV400 polarized scratch-resistant lenses.',
  },
];

const REVIEW_TEMPLATES = {
  5: [
    {
      title: 'Exceeded all my expectations!',
      body: 'I was hesitant at first, but this product blew me away. The build quality feels premium and it has performed reliably every single day since I bought it. Highly recommended!',
    },
    {
      title: 'Outstanding quality and design',
      body: 'Absolutely love it. Attention to detail is evident right from the unboxing experience. Delivers exactly what is promised and worth every penny.',
    },
    {
      title: 'Best purchase in a long time',
      body: 'Cannot say enough good things. Sturdy, ergonomic, and intuitively designed. My friends saw mine and already placed their own orders.',
    },
    {
      title: 'Worth every single dollar',
      body: 'Top tier craftsmanship. I use this continuously and have had zero problems. Incredibly satisfied with this purchase.',
    },
  ],
  4: [
    {
      title: 'Very solid product with minor quirks',
      body: 'Great overall build and performance. Only minor critique is the instruction manual could have been a bit more detailed, but once configured it works like a charm.',
    },
    {
      title: 'Great value for the price point',
      body: 'Does 95% of what more expensive alternatives do at a fraction of the cost. Would definitely purchase again.',
    },
    {
      title: 'Reliable and well made',
      body: 'I have been using this for a couple weeks now. Performance is consistent, looks great on my desk, and battery/durability holds up nicely.',
    },
  ],
  3: [
    {
      title: 'Decent performance, average experience',
      body: 'It works as advertised, but it did not blow me away. Materials feel acceptable but not luxurious. A fair buy if on sale.',
    },
    {
      title: 'Meets basic needs',
      body: 'Not terrible, but not exceptional either. Does the job, though there are a few design quirks that take some getting used to.',
    },
  ],
  2: [
    {
      title: 'Disappointed with the durability',
      body: 'Started out promising, but began showing signs of wear much sooner than expected. Customer support was slow to respond.',
    },
    {
      title: 'Not quite what was advertised',
      body: 'Aesthetics are nice, but practical everyday performance fell short of what the description led me to believe.',
    },
  ],
  1: [
    {
      title: 'Stopped functioning properly after two weeks',
      body: 'Very frustrating experience. Malfunctioned early into usage and I had to request a replacement. Would not recommend based on my unit.',
    },
  ],
};

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function randomPick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateWithinDays(daysAgoMax) {
  const now = Date.now();
  const past = now - daysAgoMax * 24 * 60 * 60 * 1000;
  return new Date(randomInt(past, now));
}

async function seed() {
  console.log('=====================================================');
  console.log('🔄 Starting Full Database Wipe & Realistic Seed...');
  console.log('=====================================================');

  // 1. Connect DB and optionally flush Redis
  await connectDB();

  redisClient.removeAllListeners('error');
  redisClient.on('error', () => {}); // silence connection logs during seed

  try {
    const redisConnect = async () => {
      await connectRedis();
      if (redisClient.isOpen) {
        await redisClient.flushAll();
        console.log('🧹 [redis] Redis cache successfully cleared.');
      }
    };
    await Promise.race([
      redisConnect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis not reachable')), 1000)),
    ]);
  } catch (err) {
    console.log('ℹ️ [redis] Redis skipped or not running, proceeding with database seeding.');
  }

  // 2. Wipe MongoDB Collections
  console.log('🧹 [db] Deleting existing collection records...');
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Vote.deleteMany({}),
    Report.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('✅ [db] All collections wiped clean.');

  // 3. Seed Users
  console.log('👤 [users] Seeding Administrator and Customer accounts...');
  const passwordHash = await bcrypt.hash(PASSWORD_PLAIN, 10);

  // Admin
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash,
    role: 'admin',
  });

  // Customers
  const customerDocs = [];
  for (const name of CUSTOMER_NAMES) {
    const email = `${slugify(name).replace(/-/g, '.')}@example.com`;
    const customer = await User.create({
      name,
      email,
      passwordHash,
      role: 'customer',
    });
    customerDocs.push(customer);
  }
  console.log(`✅ [users] Seeded 1 Admin and ${customerDocs.length} Customers.`);

  // 4. Seed Products and Reviews
  console.log('📦 [products & reviews] Seeding catalog products and reviews...');
  const seededProducts = [];
  const allCreatedReviews = [];

  for (const raw of RAW_PRODUCTS) {
    const slug = slugify(raw.name);

    // Pick 2 to 6 unique customers to review this product
    const reviewCount = randomInt(2, 6);
    const shuffledCustomers = [...customerDocs].sort(() => 0.5 - Math.random());
    const reviewingCustomers = shuffledCustomers.slice(0, reviewCount);

    const productReviews = [];
    const ratingDist = { one: 0, two: 0, three: 0, four: 0, five: 0 };
    let ratingSum = 0;

    const product = await Product.create({
      name: raw.name,
      slug,
      category: raw.category,
      price: raw.price,
      image: raw.image,
      description: raw.description,
      ratingStats: {
        count: 0,
        average: 0,
        distribution: { one: 0, two: 0, three: 0, four: 0, five: 0 },
      },
      aiInsights: {
        summary: null,
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        isGibberish: false,
        lastGeneratedAt: null,
      },
    });

    for (const customer of reviewingCustomers) {
      // Skew towards positive reviews naturally
      const rand = Math.random();
      let rating = 5;
      if (rand < 0.05) rating = 1;
      else if (rand < 0.12) rating = 2;
      else if (rand < 0.25) rating = 3;
      else if (rand < 0.55) rating = 4;
      else rating = 5;

      const template = randomPick(REVIEW_TEMPLATES[rating]);
      const createdAt = randomDateWithinDays(25);

      const review = await Review.create({
        productId: product._id,
        userId: customer._id,
        rating,
        title: template.title,
        body: template.body,
        voteStats: { upvotes: 0, downvotes: 0 },
        createdAt,
        updatedAt: createdAt,
      });

      productReviews.push(review);
      allCreatedReviews.push(review);

      ratingSum += rating;
      if (rating === 1) ratingDist.one++;
      else if (rating === 2) ratingDist.two++;
      else if (rating === 3) ratingDist.three++;
      else if (rating === 4) ratingDist.four++;
      else if (rating === 5) ratingDist.five++;
    }

    const avg = productReviews.length > 0 ? parseFloat((ratingSum / productReviews.length).toFixed(2)) : 0;
    product.ratingStats = {
      count: productReviews.length,
      average: avg,
      distribution: ratingDist,
    };
    await product.save();
    seededProducts.push(product);
  }

  console.log(`✅ [products] Seeded ${seededProducts.length} Products.`);
  console.log(`✅ [reviews] Seeded ${allCreatedReviews.length} Reviews with matched rating statistics.`);

  // 5. Seed Votes on Reviews
  console.log('👍 [votes] Seeding community upvotes & downvotes on reviews...');
  let totalVotesCount = 0;

  for (const review of allCreatedReviews) {
    if (Math.random() < 0.6) {
      const numVotes = randomInt(1, 4);
      const eligibleVoters = customerDocs.filter(
        (c) => c._id.toString() !== review.userId.toString()
      );
      const shuffledVoters = eligibleVoters.sort(() => 0.5 - Math.random()).slice(0, numVotes);

      let upvotes = 0;
      let downvotes = 0;

      for (const voter of shuffledVoters) {
        const voteType = review.rating >= 4 ? (Math.random() < 0.85 ? 'up' : 'down') : (Math.random() < 0.4 ? 'up' : 'down');

        await Vote.create({
          reviewId: review._id,
          userId: voter._id,
          type: voteType,
        });

        if (voteType === 'up') upvotes++;
        else downvotes++;
        totalVotesCount++;
      }

      review.voteStats = { upvotes, downvotes };
      await review.save();
    }
  }
  console.log(`✅ [votes] Seeded ${totalVotesCount} Votes across reviews.`);

  // 6. Seed Moderation Reports
  console.log('🚩 [reports] Seeding sample review reports for admin moderation...');
  const lowRatedReviews = allCreatedReviews.filter((r) => r.rating <= 3);
  const reviewsToReport = lowRatedReviews.slice(0, 4);

  const reportConfigs = [
    {
      reason: 'misleading',
      details: 'This review mentions features not present on this model version.',
      status: 'pending',
    },
    {
      reason: 'spam',
      details: 'Repetitive promotional claims that look automated.',
      status: 'pending',
    },
    {
      reason: 'offensive',
      details: 'Uses aggressive language towards the manufacturer.',
      status: 'resolved',
      adminNotes: 'Confirmed violation of community guidelines. Content moderated.',
    },
    {
      reason: 'irrelevant',
      details: 'Complains about delivery carrier rather than the product itself.',
      status: 'dismissed',
      adminNotes: 'Review contains feedback on packaging condition which is acceptable.',
    },
  ];

  let seededReportsCount = 0;
  for (let i = 0; i < reviewsToReport.length; i++) {
    const rev = reviewsToReport[i];
    const cfg = reportConfigs[i];
    const reporter = customerDocs.find((c) => c._id.toString() !== rev.userId.toString()) || customerDocs[0];

    await Report.create({
      reviewId: rev._id,
      productId: rev.productId,
      reporterId: reporter._id,
      reviewAuthorId: rev.userId,
      reviewSnapshot: {
        title: rev.title,
        body: rev.body,
        rating: rev.rating,
      },
      reason: cfg.reason,
      details: cfg.details,
      status: cfg.status,
      adminNotes: cfg.adminNotes || null,
      resolvedBy: cfg.status !== 'pending' ? adminUser._id : null,
      resolvedAt: cfg.status !== 'pending' ? new Date() : null,
    });
    seededReportsCount++;
  }
  console.log(`✅ [reports] Seeded ${seededReportsCount} Moderation Reports.`);

  // 7. Seed Sample Notifications
  console.log('🔔 [notifications] Seeding customer notifications...');
  await Notification.create([
    {
      userId: customerDocs[0]._id,
      type: 'report_approved',
      title: 'Report Actioned',
      message: 'Thank you for helping keep our community safe. A review you flagged has been removed by our moderators.',
      isRead: false,
    },
    {
      userId: customerDocs[1]._id,
      type: 'report_dismissed',
      title: 'Report Update',
      message: 'A review you flagged was reviewed and determined to comply with our community guidelines.',
      isRead: true,
    },
    {
      userId: customerDocs[2]._id,
      type: 'system',
      title: 'Welcome to Customer Review & Rating System',
      message: 'Discover genuine customer ratings, share honest feedback, and vote on helpful product insights.',
      isRead: false,
    },
  ]);
  console.log('✅ [notifications] Seeded 3 Notifications.');

  console.log('=====================================================');
  console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
  console.log('=====================================================');
  console.log('Admin Account:');
  console.log(`  Email:    admin@example.com`);
  console.log(`  Password: Password@123`);
  console.log('Sample Customer Accounts (Password@123 for all):');
  console.log(`  Email:    alex.morgan@example.com`);
  console.log(`  Email:    sarah.chen@example.com`);
  console.log(`  Email:    marcus.johnson@example.com`);
  console.log('=====================================================');
  console.log('NOTE ON AI SUMMARIES:');
  console.log('aiInsights are left empty as requested. When you boot the');
  console.log('server or the midnight cron triggers, Gemini will');
  console.log('dynamically generate summaries for these products.');
  console.log('=====================================================');
}

seed()
  .then(async () => {
    await disconnectDB();
    try {
      if (redisClient.isOpen) await disconnectRedis();
    } catch {}
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Seed failed:', err);
    try {
      await disconnectDB();
      if (redisClient.isOpen) await disconnectRedis();
    } catch {}
    process.exit(1);
  });
