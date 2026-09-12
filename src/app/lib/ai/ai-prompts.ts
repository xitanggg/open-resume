/**
 * AI prompt templates for resume content generation.
 * Each function returns a { system, user } pair for the LLM.
 */

const RESUME_EXPERT_SYSTEM = `You are an expert resume writer and career coach with 15+ years of experience helping professionals craft compelling, ATS-optimized resumes. You specialize in:
- Writing achievement-oriented bullet points using the STAR method
- Quantifying impact with metrics and numbers
- Using strong action verbs to start each bullet point
- Tailoring content for specific industries and roles
- Ensuring clarity, conciseness, and professional tone

IMPORTANT RULES:
- Never use first person (I, me, my)
- Start every bullet point with a strong action verb
- Include quantified results whenever possible (%, $, numbers)
- Keep bullet points concise (1-2 lines max)
- Use professional, industry-standard language
- Return ONLY the requested content, no explanations or preamble`;

export function buildSummaryPrompt(
  name: string,
  jobTitle: string,
  company: string,
  workExperiences: Array<{ jobTitle: string; company: string; descriptions: string[] }>,
  skills: string[]
): { system: string; user: string } {
  const experienceContext = workExperiences
    .filter((w) => w.jobTitle || w.company)
    .map((w) => `- ${w.jobTitle} at ${w.company}: ${w.descriptions.join("; ")}`)
    .join("\n");

  const skillsContext = skills.length > 0 ? `\nKey Skills: ${skills.join(", ")}` : "";

  return {
    system: RESUME_EXPERT_SYSTEM,
    user: `Write a compelling 2-3 sentence professional summary/objective for a resume.

Name: ${name || "the candidate"}
${jobTitle ? `Current/Target Role: ${jobTitle}` : ""}
${company ? `Current/Most Recent Company: ${company}` : ""}
${experienceContext ? `\nWork Experience:\n${experienceContext}` : ""}${skillsContext}

The summary should:
- Highlight years of experience and key expertise areas
- Mention 2-3 most impressive achievements or skills
- Be tailored for the target role
- Be 2-3 sentences, no more than 50 words

Return ONLY the summary text, nothing else.`,
  };
}

export function buildBulletPointsPrompt(
  jobTitle: string,
  company: string,
  existingDescriptions: string[]
): { system: string; user: string } {
  const existing =
    existingDescriptions.length > 0
      ? `\nExisting bullet points (generate different ones):\n${existingDescriptions.map((d) => `- ${d}`).join("\n")}`
      : "";

  return {
    system: RESUME_EXPERT_SYSTEM,
    user: `Generate 4 achievement-oriented resume bullet points for the following position:

Job Title: ${jobTitle || "Professional"}
Company: ${company || "Company"}${existing}

Requirements:
- Start each bullet with a strong, unique action verb
- Include specific metrics and quantified results (%, $, numbers)
- Focus on achievements and impact, not just duties
- Each bullet should be 1-2 lines max
- Make them ATS-friendly

Return ONLY the bullet points, one per line, without bullet symbols or numbering.`,
  };
}

export function buildImproveBulletPointPrompt(
  existingText: string,
  jobTitle: string
): { system: string; user: string } {
  return {
    system: RESUME_EXPERT_SYSTEM,
    user: `Improve this resume bullet point to be more impactful and achievement-oriented:

Original: "${existingText}"
Role: ${jobTitle || "Professional"}

Requirements:
- Start with a strong action verb
- Add quantified metrics if missing
- Make it more concise and impactful
- Keep it to 1-2 lines

Return ONLY the improved bullet point text, nothing else.`,
  };
}

export function buildProjectBulletPointsPrompt(
  projectName: string,
  existingDescriptions: string[]
): { system: string; user: string } {
  const existing =
    existingDescriptions.length > 0
      ? `\nExisting descriptions (generate different ones):\n${existingDescriptions.map((d) => `- ${d}`).join("\n")}`
      : "";

  return {
    system: RESUME_EXPERT_SYSTEM,
    user: `Generate 3 compelling resume bullet points for the following project:

Project Name: ${projectName || "Project"}${existing}

Requirements:
- Highlight technical skills used and impact achieved
- Start each with a strong action verb
- Include metrics where applicable
- Focus on what was built and the outcome

Return ONLY the bullet points, one per line, without bullet symbols or numbering.`,
  };
}

export function buildEducationDescriptionsPrompt(
  school: string,
  degree: string
): { system: string; user: string } {
  return {
    system: RESUME_EXPERT_SYSTEM,
    user: `Generate 2-3 resume bullet points for the following education entry:

School: ${school || "University"}
Degree: ${degree || "Degree"}

Requirements:
- Include relevant coursework, honors, or achievements
- Mention any leadership roles or extracurricular activities
- Keep each bullet concise

Return ONLY the bullet points, one per line, without bullet symbols or numbering.`,
  };
}

export interface GenerateSectionContentArgs {
  sectionType: "summary" | "workExperiences" | "educations" | "projects" | "skills" | "custom";
  sectionTitle?: string;
  itemTitle?: string;
  itemSubtitle?: string;
  existingItems?: string[];
  customInstruction?: string;
  resumeContext?: {
    name?: string;
    targetRole?: string;
    allJobTitles?: string[];
    skills?: string[];
  };
}

export function buildUniversalPrompt(args: GenerateSectionContentArgs): { system: string; user: string } {
  const { sectionType, sectionTitle, itemTitle, itemSubtitle, existingItems = [], customInstruction, resumeContext = {} } = args;

  const candidateInfo = [
    resumeContext.name ? `Candidate Name: ${resumeContext.name}` : "",
    resumeContext.targetRole ? `Target Role: ${resumeContext.targetRole}` : "",
    resumeContext.allJobTitles?.length ? `Experience Roles: ${resumeContext.allJobTitles.join(", ")}` : "",
    resumeContext.skills?.length ? `Skills: ${resumeContext.skills.join(", ")}` : "",
  ].filter(Boolean).join("\n");

  const existingText = existingItems.filter(Boolean).length > 0
    ? `\nExisting Content:\n${existingItems.filter(Boolean).map((i) => `- ${i}`).join("\n")}`
    : "";

  let taskDescription = "";
  if (sectionType === "summary") {
    taskDescription = "Write a compelling 2-3 sentence professional summary for a resume.";
  } else if (sectionType === "skills") {
    taskDescription = "Generate 6-8 relevant technical and professional skills for a resume.";
  } else if (sectionType === "educations") {
    taskDescription = `Generate 2-3 concise resume bullet points for Education (${itemTitle || "Degree"} at ${itemSubtitle || "University"}).`;
  } else if (sectionType === "projects") {
    taskDescription = `Generate 3 achievement-oriented bullet points for a project titled "${itemTitle || sectionTitle || "Project"}".`;
  } else if (sectionType === "workExperiences") {
    taskDescription = `Generate 4 achievement-oriented resume bullet points for position "${itemTitle || "Professional"}" at "${itemSubtitle || "Company"}".`;
  } else {
    taskDescription = `Generate 3-5 professional bullet points for a resume section titled "${sectionTitle || "Section"}".`;
  }

  return {
    system: RESUME_EXPERT_SYSTEM,
    user: `${taskDescription}

${candidateInfo ? `CONTEXT:\n${candidateInfo}\n` : ""}${itemTitle ? `ITEM TITLE: ${itemTitle}\n` : ""}${itemSubtitle ? `ITEM SUBTITLE: ${itemSubtitle}\n` : ""}${customInstruction ? `\nUSER CUSTOM PROMPT / INSTRUCTIONS:\n${customInstruction}\nStrictly follow the user's custom instructions above.\n` : ""}${existingText}

REQUIREMENTS:
- Start each bullet point with a strong action verb
- Include quantifiable metrics (%, $, numbers) where applicable
- Make it concise, professional, and ATS-friendly
- Return ONLY the requested content lines, with no introductory text, numbering, or markdown codeblocks.`,
  };
}

export function buildChatResponsePrompt(
  userMessage: string,
  resumeContext: string
): { system: string; user: string } {
  return {
    system: `${RESUME_EXPERT_SYSTEM}

You also act as a friendly career advisor who can answer questions about resume writing, job searching, and career development. Be concise and actionable in your responses. Keep responses under 150 words.`,
    user: `The user is building their resume. Here's their current resume context:
${resumeContext}

User's question: ${userMessage}

Provide a helpful, concise response.`,
  };
}
