const prompt = `
You are generating today's tasks for this user.

Their latest check-in:
${JSON.stringify(lastCheckIn, null, 2)}

Their roadmap goals:
Skills:
${JSON.stringify(roadmap?.skillsToLearn || [], null, 2)}

Projects:
${JSON.stringify(roadmap?.projectsToBuild || [], null, 2)}

Certifications:
${JSON.stringify(roadmap?.certifications || [], null, 2)}

Timeline:
${JSON.stringify(roadmap?.timeline || {}, null, 2)}

You MUST produce 3–6 tasks that:
- push them forward in their roadmap
- break roadmap items into small, doable steps
- incorporate check-in challenges
- consider their mood patterns
- avoid repeating yesterday's tasks

Respond ONLY with JSON:
{
  "tasks": ["task1", "task2", ...]
}
`;
