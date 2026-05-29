import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST() {
  const db = getDb();
  try {
    // Create admin user
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@officialtoolstore.com"))
      .limit(1);

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("admin123", 12);
      await db.insert(users).values({
        name: "Admin",
        email: "admin@officialtoolstore.com",
        passwordHash,
        role: "superuser",
      });
    }

    // Seed products
    const [existingProduct] = await db.select().from(products).limit(1);

    if (!existingProduct) {
      const seedProducts = [
        {
          nameEn: "ChatGPT Plus",
          nameBn: "চ্যাটজিপিটি প্লাস (অফিসিয়াল)",
          shortDescEn: "ChatGPT is your AI chatbot for everyday use.",
          shortDescBn: "সবচেয়ে উন্নত এআই মডেল জিপিটি-৪ ব্যবহারের সুবিধা।",
          fullDescEn: "ChatGPT is your AI chatbot for everyday use. Chat with the most advanced AI.",
          fullDescBn: "OpenAI-এর অফিসিয়াল প্রিমিয়াম চ্যাটজিপিটি প্লাস সাবস্ক্রিপশন।",
          image: "https://i.ibb.co/zTTstXjy/Gemini-Generated-Image-3g2o2r3g2o2r3g2o.jpg",
          icon: "🤖",
          iconBg: "#e8f5e9",
          stock: 100,
          sold: 135,
          category: "AI Tools",
          tags: ["BEST SELLER", "RECOMMENDED"],
          packages: [{ duration: "1 Month", usdt: 3, bdt: 390 }],
          options: { guarantee: "100% Replacement Warranty", share: "Private Account", duration: "30 Days", accountType: "Premium Activated" },
          isTop: true,
        },
        {
          nameEn: "Gemini Flow Ultra (Owned)",
          nameBn: "জেমিনি ফ্লো আল্ট্রা (ওন্ড)",
          shortDescEn: "Gemini Flow Ultra Video, Image & Pro Productivity — All in One Package!",
          shortDescBn: "জেমিনি আল্ট্রা + ভিও ৩ আল্ট্রা + বেনানা আল্ট্রা + ৩০ টিবি ক্লাউড স্টোরেজ।",
          fullDescEn: "All-in-One Premium Bundle: Gemini Ultra + Veo 3 Ultra + Banana Ultra + 30 TB Storage",
          fullDescBn: "Gemini Flow Ultra-র সম্পূর্ণ নিজস্ব প্রিমিয়াম প্যাকেজ।",
          image: "https://i.ibb.co/FkbdgG8H/Gemini-Generated-Image-scqh3oscqh3oscqh.jpg",
          icon: "✨",
          iconBg: "#e8f0fe",
          stock: 100,
          sold: 120,
          category: "AI Tools",
          tags: ["BEST SELLER", "RECOMMENDED"],
          packages: [{ duration: "1 Month", usdt: 17, bdt: 1999 }],
          options: { guarantee: "100% Replacement Warranty", share: "Private Account", duration: "30 Days", accountType: "Premium Activated" },
          isTop: true,
        },
        {
          nameEn: "Gemini Flow Ultra (Shared)",
          nameBn: "জেমিনি ফ্লো আল্ট্রা (শেয়ার্ড)",
          shortDescEn: "Gemini Flow Ultra — Shared Package!",
          shortDescBn: "জেমিনি আল্ট্রা + ভিও ৩ + বেনানা + ৩০ টিবি শেয়ার্ড প্যাকেজ।",
          fullDescEn: "Shared Premium Bundle: Gemini Ultra + Veo 3 + Banana + 30 TB Storage",
          fullDescBn: "Gemini Flow Ultra-র শেয়ার্ড প্রিমিয়াম প্যাকেজ।",
          image: "https://i.ibb.co/FLhLGDFq/Gemini-Generated-Image-7qtfb27qtfb27qtf.jpg",
          icon: "✨",
          iconBg: "#e8f0fe",
          stock: 100,
          sold: 165,
          category: "AI Tools",
          tags: ["HOT", "POPULAR"],
          packages: [{ duration: "1 Month", usdt: 3, bdt: 349 }],
          options: { guarantee: "100% Replacement Warranty", share: "Shared Account", duration: "30 Days", accountType: "Premium Activated" },
          isTop: false,
        },
        {
          nameEn: "Netflix Premium 4K UHD",
          nameBn: "নেটফ্লিক্স প্রিমিয়াম ৪কে ইউএইচডি",
          shortDescEn: "Watch Netflix movies & TV shows online.",
          shortDescBn: "আনলিমিটেড মুভি, টিভি শো এবং ৪কে আল্ট্রা এইচডি ভিডিও।",
          fullDescEn: "Watch Netflix movies & TV shows online or stream right to your smart TV.",
          fullDescBn: "নেটফ্লিক্স প্রিমিয়াম ৪কে আল্ট্রা এইচডি অ্যাকাউন্ট।",
          image: "https://i.ibb.co/tpM5g5LV/Gemini-Generated-Image-r9df69r9df69r9df.jpg",
          icon: "🍿",
          iconBg: "#ffebee",
          stock: 100,
          sold: 155,
          category: "Streaming",
          tags: ["ULTRA HD", "INSTANT"],
          packages: [
            { duration: "1 Month", usdt: 3, bdt: 350 },
            { duration: "3 Months", usdt: 5, bdt: 600 },
            { duration: "6 Months", usdt: 15, bdt: 1800 },
            { duration: "1 Year", usdt: 21, bdt: 2500 },
          ],
          options: { guarantee: "100% Replacement Warranty", share: "Private Account", duration: "Multiple Durations", accountType: "Premium Activated" },
          isTop: true,
        },
        {
          nameEn: "Amazon Prime Video",
          nameBn: "অ্যামাজন প্রাইম ভিডিও প্রিমিয়াম",
          shortDescEn: "Stream popular movies, TV shows, sports, and live TV.",
          shortDescBn: "অ্যামাজন অরিজিনালস, মুভি, ড্রামা স্ট্রিমিং।",
          fullDescEn: "Stream popular movies, TV shows, sports, and live TV included with Prime.",
          fullDescBn: "অ্যামাজন প্রাইম ভিডিওর অফিসিয়াল প্রিমিয়াম সাবস্ক্রিপশন।",
          image: "https://i.ibb.co/4RRLMgKT/Gemini-Generated-Image-ezun9uezun9uezun.jpg",
          icon: "🎬",
          iconBg: "#e3f2fd",
          stock: 100,
          sold: 154,
          category: "Streaming",
          tags: ["ULTRA HD", "INSTANT"],
          packages: [
            { duration: "1 Month", usdt: 4, bdt: 450 },
            { duration: "3 Months", usdt: 8, bdt: 900 },
            { duration: "6 Months", usdt: 17, bdt: 2000 },
            { duration: "1 Year", usdt: 29, bdt: 3500 },
          ],
          options: { guarantee: "100% Replacement Warranty", share: "Private Account", duration: "Multiple Durations", accountType: "Premium Activated" },
          isTop: false,
        },
        {
          nameEn: "Grok (Owned)",
          nameBn: "গ্ৰক এআই প্রিমিয়াম (ওন্ড)",
          shortDescEn: "Grok AI assistant by xAI. Chat, create images, write code.",
          shortDescBn: "এলন মাস্কের xAI-এর প্রিমিয়াম এআই অ্যাসিস্ট্যান্ট।",
          fullDescEn: "Grok is an AI assistant built by xAI. Chat, create images, write code.",
          fullDescBn: "এলন মাস্কের xAI দ্বারা তৈরি Grok AI প্রিমিয়াম অ্যাকাউন্ট।",
          image: "https://i.ibb.co.com/HLNqQ95M/Grok-X-deepfakes-Elon-Musk-1024x576.jpg",
          icon: "🚀",
          iconBg: "#ede7f6",
          stock: 100,
          sold: 120,
          category: "AI Tools",
          tags: ["BEST SELLER", "RECOMMENDED"],
          packages: [{ duration: "1 Month", usdt: 5, bdt: 599 }],
          options: { guarantee: "100% Replacement Warranty", share: "Private Account", duration: "30 Days", accountType: "Premium Activated" },
          isTop: false,
        },
        {
          nameEn: "Grok (Shared)",
          nameBn: "গ্ৰক এআই প্রিমিয়াম (শেয়ার্ড)",
          shortDescEn: "Grok AI assistant — Shared account.",
          shortDescBn: "xAI-এর Grok AI শেয়ার্ড মেম্বারশিপ।",
          fullDescEn: "Grok AI — Shared premium membership at an affordable price.",
          fullDescBn: "xAI-এর Grok AI প্রিমিয়াম অ্যাকাউন্টের শেয়ার্ড মেম্বারশিপ।",
          image: "https://i.ibb.co.com/HLNqQ95M/Grok-X-deepfakes-Elon-Musk-1024x576.jpg",
          icon: "🚀",
          iconBg: "#ede7f6",
          stock: 100,
          sold: 151,
          category: "AI Tools",
          tags: ["HOT", "POPULAR"],
          packages: [{ duration: "1 Month", usdt: 2, bdt: 249 }],
          options: { guarantee: "100% Replacement Warranty", share: "Shared Account", duration: "30 Days", accountType: "Premium Activated" },
          isTop: false,
        },
      ];

      await db.insert(products).values(seedProducts);
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
