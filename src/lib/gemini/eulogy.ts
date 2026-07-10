import { GoogleGenerativeAI } from "@google/generative-ai";
import { TombstoneWithStats } from "@/types/tombstone";
import { ageString } from "@/lib/github/analyze";

export async function generateEulogy(
  tombstone: TombstoneWithStats
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const age = ageString(tombstone.born_at, tombstone.died_at);
  const topLanguages = Object.keys(tombstone.languages).slice(0, 3).join(", ");
  const bornDate = new Date(tombstone.born_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const diedDate = new Date(tombstone.died_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prompt = `You are writing a dramatic, humorous eulogy in the form of a breakup letter from a developer to their abandoned project.

Project: ${tombstone.repo_name}
Languages used: ${topLanguages || "unknown"}
Born: ${bornDate} | Last commit: ${diedDate}
Lived for: ${age}
Cause of death: "${tombstone.cause_of_death}"
Last commit message (the final words): "${tombstone.last_words || "no message"}"
Total commits: ${tombstone.commits_count}
${tombstone.peak_streak_days > 1 ? `Peak obsession: ${tombstone.peak_streak_days}-day commit streak` : ""}
${tombstone.most_commits_one_day > 1 ? `Most obsessed day: ${tombstone.most_commits_one_day} commits in a single day` : ""}
${tombstone.latest_night_commit_time ? `Latest night session: ${tombstone.latest_night_commit_time}` : ""}
Stars at death: ${tombstone.stars_count}

Write exactly 3 paragraphs. Format as a letter FROM the developer TO the project.
Tone: dramatic, darkly funny, genuinely melancholic. Mix technical jargon with emotion.
Opening line must start with "Dear ${tombstone.repo_name},"
Reference at least 2 real data points from above.
Close with a sign-off like "Yours, but not anymore, — A Tired Developer"
Max 250 words total. No markdown formatting.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
