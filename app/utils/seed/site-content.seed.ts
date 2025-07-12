import { initializeSiteContent } from "../firebase/site-content.firebase";

/**
 * Seeds the database with default site content
 */
export async function seedSiteContent() {
  try {
    console.log("🌱 Seeding site content...");

    const siteContent = await initializeSiteContent();

    console.log("✅ Site content seeded successfully:", {
      id: siteContent.id,
      heroHeading: siteContent.heroHeading,
      heroDescription: siteContent.heroDescription,
      heroImageUrl: siteContent.heroImage.url,
    });

    return siteContent;
  } catch (error) {
    console.error("❌ Error seeding site content:", error);
    throw error;
  }
}

/**
 * Main function to run site content seeding
 */
export async function runSiteContentSeeding() {
  try {
    await seedSiteContent();
    console.log("🎉 Site content seeding completed!");
  } catch (error) {
    console.error("💥 Site content seeding failed:", error);
    process.exit(1);
  }
}

// Allow running this script directly
if (require.main === module) {
  runSiteContentSeeding();
}
