import { prisma } from "../src/lib/prisma.js";

async function main() {
  console.log("🌱 Seeding database...");

  // Create test users if they don't exist
  const testCandidate = await prisma.user.upsert({
    where: { email: "candidate@test.com" },
    update: {},
    create: {
      clerkId: "test-candidate-1",
      email: "candidate@test.com",
      name: "Test Candidate",
      role: "CANDIDATE",
    },
  });

  const testRecruiter = await prisma.user.upsert({
    where: { email: "recruiter@test.com" },
    update: {},
    create: {
      clerkId: "test-recruiter-1",
      email: "recruiter@test.com",
      name: "Test Recruiter",
      role: "RECRUITER",
    },
  });

  console.log("✅ Users created:", {
    candidate: testCandidate.id,
    recruiter: testRecruiter.id,
  });

  // Create sample resume
  const resume = await prisma.resume.create({
    data: {
      userId: testCandidate.id,
      filename: "sample-resume.txt",
      extractedText:
        "Senior Software Engineer with 5 years of experience in Node.js, React, and PostgreSQL.",
      skills: ["Node.js", "React", "PostgreSQL", "TypeScript", "AWS"],
    },
  });

  console.log("✅ Resume created:", resume.id);

  // Create sample job description
  const jd = await prisma.jobDescription.create({
    data: {
      userId: testRecruiter.id,
      title: "Senior Full Stack Engineer",
      company: "TechCorp",
      content:
        "We are looking for a Senior Full Stack Engineer with strong experience in Node.js and React.",
      skillsRequired: ["Node.js", "React", "PostgreSQL", "TypeScript", "AWS"],
    },
  });

  console.log("✅ Job Description created:", jd.id);

  console.log("✨ Database seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
