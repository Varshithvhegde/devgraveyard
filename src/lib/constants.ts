export const CAUSES_OF_DEATH = [
  "Scope Creep",
  "Got a Full-Time Job",
  "Fell for a Shinier Framework",
  "It Was Complicated",
  "Never Made it Past Localhost",
  "Ran Out of Weekend",
  "Tutorial Hell",
  "The API Started Charging",
  "It Works on My Machine",
  "Custom...",
] as const;

export const RESURRECTION_THRESHOLD = 50;

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  CSS: "#563d7c",
  HTML: "#e34c26",
  PHP: "#4F5D95",
  Ruby: "#701516",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  Dart: "#00B4AB",
  Shell: "#89e051",
  Vue: "#41b883",
  SCSS: "#c6538c",
  MDX: "#fcb32c",
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Freshly Buried" },
  { value: "most_mourned", label: "Most Mourned" },
  { value: "most_votes", label: "Most Votes to Resurrect" },
  { value: "oldest", label: "Longest Buried" },
];
