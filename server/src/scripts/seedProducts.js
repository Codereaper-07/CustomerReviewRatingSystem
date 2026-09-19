/**
 * Development seed script for the products collection.
 *
 * Usage: npm run seed:products
 *
 * - Uses the Product model directly (no HTTP calls).
 * - Idempotent: skips any product whose slug already exists, so running
 *   this repeatedly never creates duplicates.
 * - Never sets ratingStats — the model's own defaults apply on insert.
 * - Only touches the products collection.
 * - Reuses the existing DB connection config (config/db.js), which itself
 *   reads MONGODB_URI from config/env.js — no connection logic is
 *   duplicated here.
 */
import { connectDB, disconnectDB } from '../config/db.js';
import Product from '../modules/products/product.model.js';

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 30 realistic products across several categories — enough to exercise
// cursor pagination well past the default page size (10) and the
// maximum page size (50 is still one page, but 30 gives 3+ pages at the
// default limit, which is what actually matters for testing "next page").
const PRODUCTS = [
  // Electronics
  { name: 'Aurora Wireless Headphones', category: 'Electronics', price: 89.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', description: 'Over-ear wireless headphones with active noise cancellation and 30-hour battery life.' },
  { name: 'Nimbus 27" 4K Monitor', category: 'Electronics', price: 349.0, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', description: 'A 27-inch 4K IPS monitor with USB-C connectivity and a 99% sRGB color gamut.' },
  { name: 'Pulse Mechanical Keyboard', category: 'Electronics', price: 129.5, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', description: 'Hot-swappable mechanical keyboard with per-key RGB lighting and a durable aluminum frame.' },
  { name: 'Vortex Portable SSD 1TB', category: 'Electronics', price: 99.99, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80', description: 'A rugged 1TB portable SSD with USB-C 3.2 speeds up to 1050MB/s.' },
  { name: 'Halo Smart Speaker', category: 'Electronics', price: 59.0, image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80', description: 'A compact smart speaker with rich bass and built-in voice assistant support.' },
  { name: 'Zenith Action Camera', category: 'Electronics', price: 219.0, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80', description: 'Waterproof 4K action camera with image stabilization and a wide-angle lens.' },

  // Home & Kitchen
  { name: 'Ember Ceramic Cookware Set', category: 'Home & Kitchen', price: 149.0, image: 'https://images.unsplash.com/photo-1584990347449-399d81d22329?auto=format&fit=crop&w=800&q=80', description: 'A 10-piece non-stick ceramic cookware set safe for oven use up to 450°F.' },
  { name: 'Drift Electric Kettle', category: 'Home & Kitchen', price: 39.99, image: 'https://images.unsplash.com/photo-1594213114663-dd96813bfb0a?auto=format&fit=crop&w=800&q=80', description: 'A 1.7L stainless steel electric kettle with rapid boil and auto shut-off.' },
  { name: 'Solace Memory Foam Pillow', category: 'Home & Kitchen', price: 34.5, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80', description: 'A contoured memory foam pillow designed to support neck alignment while sleeping.' },
  { name: 'Grove Bamboo Cutting Board Set', category: 'Home & Kitchen', price: 27.0, image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80', description: 'A set of three organic bamboo cutting boards in graduated sizes.' },
  { name: 'Cascade French Press', category: 'Home & Kitchen', price: 24.99, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80', description: 'A 1-liter borosilicate glass French press with a stainless steel filter.' },
  { name: 'Lumen LED Desk Lamp', category: 'Home & Kitchen', price: 42.0, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', description: 'A dimmable LED desk lamp with adjustable color temperature and USB charging port.' },

  // Sports & Outdoors
  { name: 'Summit Insulated Water Bottle', category: 'Sports & Outdoors', price: 22.0, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80', description: 'A 32oz double-wall insulated bottle that keeps drinks cold for 24 hours.' },
  { name: 'Trailhead Hiking Backpack', category: 'Sports & Outdoors', price: 79.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', description: 'A 35L hiking backpack with a rain cover and a padded hip belt for long treks.' },
  { name: 'Momentum Yoga Mat', category: 'Sports & Outdoors', price: 32.0, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80', description: 'A 6mm extra-thick yoga mat with a non-slip textured surface.' },
  { name: 'Ridgeline Trekking Poles', category: 'Sports & Outdoors', price: 45.0, image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80', description: 'A pair of adjustable aluminum trekking poles with shock-absorbing tips.' },
  { name: 'Current Swim Goggles', category: 'Sports & Outdoors', price: 18.5, image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80', description: 'Anti-fog swim goggles with UV protection and an adjustable silicone strap.' },

  // Books
  { name: 'The Quiet Algorithm', category: 'Books', price: 16.99, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', description: 'A novel following a reclusive programmer who discovers a pattern hidden in city traffic data.' },
  { name: 'Gardens of Low Earth Orbit', category: 'Books', price: 19.5, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', description: 'A near-future science fiction story about the first botanist to tend a garden in space.' },
  { name: 'Learning Distributed Systems', category: 'Books', price: 44.0, image: 'https://images.unsplash.com/photo-1532012164546-f432f2e37271?auto=format&fit=crop&w=800&q=80', description: 'A practical guide to designing resilient distributed systems, with real-world case studies.' },
  { name: 'The Cartographer\'s Daughter', category: 'Books', price: 14.99, image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80', description: 'A historical drama about a mapmaker\'s daughter navigating a changing empire.' },
  { name: 'Mindful Mornings', category: 'Books', price: 12.5, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', description: 'A short collection of guided reflections designed to structure a calmer start to the day.' },

  // Toys & Games
  { name: 'Puzzle Cube Set of 3', category: 'Toys & Games', price: 21.0, image: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?auto=format&fit=crop&w=800&q=80', description: 'A set of three speed cubes in different sizes, designed for smooth, fast turning.' },
  { name: 'Constellation Board Game', category: 'Toys & Games', price: 38.0, image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80', description: 'A 2-5 player strategy board game about charting star routes across the night sky.' },
  { name: 'Buildwise Blocks 500pc', category: 'Toys & Games', price: 29.99, image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80', description: 'A 500-piece building block set compatible with most major block brands.' },
  { name: 'Tabletop Domino Rally Kit', category: 'Toys & Games', price: 16.0, image: 'https://images.unsplash.com/photo-1563941402622-4e7a488bcc57?auto=format&fit=crop&w=800&q=80', description: 'A 200-piece domino set with ramps and connectors for building elaborate chain reactions.' },

  // Beauty & Personal Care
  { name: 'Calm Lavender Diffuser', category: 'Beauty & Personal Care', price: 26.5, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80', description: 'An ultrasonic essential oil diffuser with a soft ambient light and auto shut-off.' },
  { name: 'Renew Vitamin C Serum', category: 'Beauty & Personal Care', price: 23.0, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', description: 'A lightweight vitamin C serum formulated to brighten and even skin tone over time.' },
  { name: 'Bristle Bamboo Toothbrush Set', category: 'Beauty & Personal Care', price: 11.99, image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80', description: 'A set of four biodegradable bamboo toothbrushes with soft charcoal-infused bristles.' },
  { name: 'Featherweight Microfiber Towel Set', category: 'Beauty & Personal Care', price: 19.99, image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=800&q=80', description: 'A set of two quick-dry microfiber towels ideal for travel and the gym.' },
];

async function seedProducts() {
  await connectDB();

  let created = 0;
  let skipped = 0;

  for (const item of PRODUCTS) {
    const slug = slugify(item.name);
    const alreadyExists = await Product.exists({ slug });

    if (alreadyExists) {
      skipped++;
      continue;
    }

    try {
      // ratingStats is intentionally never set — the model default applies.
      await Product.create({
        name: item.name,
        slug,
        description: item.description,
        category: item.category,
        price: item.price,
        image: item.image,
      });
      created++;
    } catch (err) {
      // Concurrent/repeated runs: unique slug index is the final idempotency guard.
      if (err?.code === 11000 || err?.cause?.code === 11000) {
        skipped++;
        continue;
      }
      throw err;
    }
  }

  console.log(
    `[seed:products] Done. Created ${created}, skipped ${skipped} (already present). ${PRODUCTS.length} total in seed list.`
  );
}

seedProducts()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[seed:products] Failed:', err);
    try {
      await disconnectDB();
    } catch {
      // ignore secondary errors while tearing down the connection
    }
    process.exit(1);
  });
