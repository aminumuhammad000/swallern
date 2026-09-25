# Swa — Roadmap & Classroom Product Specification

**Version:** 1.0  
**Status:** Product & UX Definition (Gemini Integration: NOT STARTED)  
**Author:** Product & Architecture  

---

## 1. Executive Summary & Core Principle

> **"The roadmap is the classroom. The lessons are the teaching. Swa is the companion that helps the learner move through it."**

Swa is Swallern's intelligent learning companion. Swa is **not** a generic conversational chatbot, a standalone AI search engine, or a replacement for curriculum content. Swa exists exclusively inside the Roadmap and Classroom to reduce cognitive friction, clarify difficult concepts in 5–7 words, provide hints without spoiling answers, and guide the learner's progression.

---

## 2. Where Swa Appears (Touchpoints)

| Environment | Route | Existing Components | Swa Touchpoint Pattern |
|---|---|---|---|
| **Roadmap Surface** | `/topics/[slug]` | `CourseJourney.tsx`, `JourneyWorldMap.tsx` | **Stationary 3D / 2.5D Perch**: Swa rests alongside the user's active milestone node. On tap, opens a compact contextual companion bubble (`SwaCompanionDialog.tsx`). Swa travels to earlier nodes only when learner explicitly chooses to inspect/review previous milestones. |
| **Classroom Classroom** | `/topics/[slug]/learn` | `LearningClassroom.tsx`, `CourseOutlineDrawer.tsx` | **Contextual Companion Island**: A discreet, floating 36px companion chip / trigger in the bottom corner or directly embedded within lesson takeaways. Tapping summons a focused 5–7 word explanation, hint, or simplification without occluding lesson text. |
| **Knowledge Check / Quiz** | `/topics/[slug]/learn` (quiz steps) | `LearningClassroom.tsx` (quiz step view) | **Hint & Confidence Coach**: Appears adjacent to the question card offering a one-tap "Need a hint?" chip. Swa nudges thinking without revealing options. |

---

## 3. Classroom & Roadmap Context Available Today

The Swallern architecture already provides comprehensive, structured context through `TopicContract` and `TopicProgressState`:

```typescript
// 1. Content Contract Context (lib/content/contract.ts)
topic.id                  // UUID
topic.slug                // String URL slug
topic.title               // e.g., "Photosynthesis"
topic.summary             // High-level overview
topic.quick_answer        // Concise definition / thesis
topic.explanation         // Deep foundational mechanisms
topic.key_concepts        // Array<{ id, title, description }>
topic.lesson.sections     // Array<{ title, content, key_takeaway, order_index }>
topic.quiz.questions      // Array<{ question, explanation, options, correct_index }>
topic.related_topics      // Array<{ id, title, slug, summary }>
topic.sources             // Verified citations & references

// 2. Learner Progress Context (lib/learning/progress.ts)
progress.currentStep          // Current active classroom step index
progress.totalSteps           // Total steps in sequence
progress.completedStepIndexes // Fully conquered step indices
progress.isCompleted          // Boolean completion flag
progress.updatedAt            // Timestamp of last action
```

---

## 4. Additional Context Swa Will Need (Future Integration)

When AI capabilities are connected, the context payload sent to the companion engine should include:

1. **Current View State**: Whether learner is on `Roadmap Map View`, `Classroom Reading`, `Quiz Answering`, or `Milestone Sheet`.
2. **Current Step Payload**: The exact title, content, and takeaway of the section currently in the viewport.
3. **Current Question Context**: If in a quiz, the question stem and the concept it evaluates (with explicit instructions never to output the correct option index).
4. **Recent Friction Signals**: Repeated incorrect quiz selections, prolonged idle time on a single section (>3 minutes), or repeated "I don't understand" prompts.
5. **Session Breadcrumb Trail**: The last 2–3 messages exchanged with Swa in the current session.

---

## 5. Actions Swa Should Be Able to Trigger

All actions map strictly to **existing Swallern frontend routes and state setters**:

* `continueRoadmap()`: Scrolls or advances learner to `activeMilestoneIndex`.
* `openLessonStep(stepIndex)`: Navigates to `/topics/[slug]/learn?step=${stepIndex}`.
* `reviewPreviousStep(stepIndex)`: Navigates to earlier unlocked step with review flag.
* `showHint()`: Reveals an inquiry-prompting hint in the quiz/reading view.
* `simplifyConcept()`: Re-renders or speaks the section takeaway in simplified terms.
* `giveExample()`: Provides a 5–7 word real-world illustration.
* `exploreTopic(slug)`: Routes to `/topics/${slug}` from `topic.related_topics`.
* `triggerCelebration()`: Triggers existing celebration effects (`soundManager.play('course_complete')`).

---

## 6. Actions Swa Must NOT Control

To maintain educational integrity and prevent hallucinations:
* **Cannot modify progress records arbitrarily**: Swa cannot bypass quizzes or fabricate step completions. Progress is earned strictly through existing step validation.
* **Cannot invent nonexistent topics or lessons**: Swa must only suggest topics existing in `topic.related_topics` or the published topic directory.
* **Cannot reveal quiz answers directly**: Swa must provide scaffolding/hints, never stating "The answer is B".
* **Cannot alter topic facts or definitions**: Explanations must strictly reflect the verified facts in `TopicContract`.

---

## 7. Swa Behavioral Matrix by Stage

| Stage | Learner State | Swa Stance / Emotion | Default Behavior (5–7 Words) |
|---|---|---|---|
| **Roadmap: Return** | Reopening roadmap after absence | Resting at last active milestone, Idle | *"Welcome back! Ready for Step {N}?"* |
| **Roadmap: Inspecting Old Node** | Clicked previous completed step | Walks to node, Curious / Proud | *"You conquered: {Milestone Title}."* |
| **Classroom: Intro** | Starting step 0 | Welcoming, Wave | *"Explore how {Topic Title} works."* |
| **Classroom: Section** | Studying lesson material | Attentive, Idle | Swa remains quiet until asked; explains in ≤7 words on demand. |
| **Classroom: Confusion** | Learner types "What?" / "Explain" | Focused, Pointing | *"Plants use sunlight to make food."* |
| **Classroom: Quiz** | Learner facing knowledge check | Encouraging | *"Think about where the energy goes."* (Hint) |
| **Classroom: Complete** | Finished final question | Celebrating | *"Roadmap complete. Keep exploring!"* |

---

## 8. Recommended UI Pattern

1. **Ultra-Compact Footprint**: 
   * Swa never occupies more than 300px width on desktop or 88vw on mobile.
   * Never opens a full-screen ChatGPT-style modal.
2. **Floating Contextual Bubble (`SwaCompanionDialog`)**:
   * Speech tail points directly at Swa's 3D/2.5D character.
   * Scrollbar is ultra-thin (3px), translucent (`rgba(139, 92, 246, 0.35)`), with transparent track.
   * Bottom action pill aligns text input with 28px voice and send action buttons on a unified horizontal axis.
3. **Progressive Disclosure**:
   * Default: 1 exchange (Swa's concise 5–7 word statement).
   * Learner can tap "Explain more" or "History" to expand without interrupting lesson flow.

---

## 9. Default Response Protocol (The 5–7 Word Rule)

* **Target Length**: 5 to 7 words.
* **Hard Upper Bound (Default)**: 7 words.
* **Tone**: Clear, educational, warm, factual.
* **Zero Conversational Fluff**: No "Sure thing!", "Great question!", or "I would love to help you with that!".
* **Exception**: When the learner explicitly types *"Explain in detail"* or *"Give a full explanation"*, Swa expands to 2–3 concise sentences.

---

## 10. Future Gemini Integration Requirements (Specification Only)

When Gemini integration commences:
1. **System Prompt Constraint**: Hard-code the 5–7 word default constraint, zero-fluff rule, and Swallern companion persona.
2. **Structured Classroom Context Injection**: Inject `topic.title`, `currentSection.content`, `currentSection.key_takeaway`, `topic.key_concepts`, and `related_topics`.
3. **Strict Grounding**: Instruct the model to ground explanations exclusively on the provided lesson text.
4. **Anonymous-First Endpoint**: Ensure the endpoint supports anonymous session tokens without mandatory sign-in.
