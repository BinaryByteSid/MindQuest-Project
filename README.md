# PsychTriage / MindQuest

PsychTriage is a mobile-first, prototype mental health triage experience with two main parts:

1. A supportive mental-health check-in flow for mood, stress, voice input, AI chat, results, dashboarding, and emergency access.
2. MindQuest, a gamified anxiety-assessment journey built as a 3-level game with a results screen and support handoff.

The project is designed for Indian youth and young adults and uses a calm, non-judgmental visual language with strong safety messaging, reward mechanics, and reusable UI components.

![Status](https://img.shields.io/badge/Status-Prototype-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)
![TypeScript](https://img.shields.io/badge/TypeScript-Supported-3178c6)

## What this project does

This app provides a guided path for someone who wants to check in on how they are feeling, understand possible stress or anxiety signals, and reach support quickly if needed.

It includes:

- A welcome onboarding screen that introduces the app and its safety promise.
- A mood and stress check-in experience.
- An optional voice input screen for recording a response.
- An AI chat screen for conversational assessment.
- A results screen that classifies risk and suggests next steps.
- A dashboard for trends, streaks, and achievements.
- An emergency screen with quick access to helplines and support guidance.
- A MindQuest game that turns anxiety assessment into a structured, interactive journey.
- A manual PHQ-9 + GAD-7 screening flow for traditional questionnaire-based assessment.
- A component library and design-system showcase for developers.

## Main user journeys

### 1. Standard triage flow

1. Onboarding at `/`
2. Mood check-in
3. Voice input
4. AI chat assessment
5. Risk result
6. Progress dashboard
7. Emergency support when needed

### 2. MindQuest game flow

1. Game start at `/mindquest`
2. Level 1: Calm Mode at `/mindquest/level1`
3. Level 2: Challenge Mode at `/mindquest/level2`
4. Level 3: Stress Mode at `/mindquest/level3`
5. MindQuest result at `/mindquest/result`

### 3. Manual screening flow

1. Manual assessment at `/manual-assessment`
2. Manual assessment result at `/manual-assessment/result`

### 4. Developer and design views

1. Component library at `/components`
2. Design system showcase at `/design-system`

## Screen-by-screen breakdown

### Onboarding

The home screen introduces PsychTriage with a polished, mobile-friendly entry point. It sets the tone, explains the app’s purpose, and routes users into the core flows.

### Mood check-in

This screen collects a quick mood response and stress level, giving the app a simple starting signal for the rest of the assessment flow.

### Voice input

Users can optionally record or provide a spoken response. The screen includes waveform-style feedback and is meant to feel conversational rather than clinical.

### AI chat

This screen simulates a supportive conversational assessment, with message bubbles, progress indication, and a guided sequence of prompts.

### Risk result

The result screen summarizes the current risk level using color-coded feedback and provides personalized suggestions and next actions.

### Progress dashboard

The dashboard shows weekly trends, improvement signals, XP, and achievements so users can see progress over time rather than only a one-time result.

### Emergency mode

The emergency screen prioritizes immediate support. It exposes direct helpline actions, safety guidance, and urgent help options.

### MindQuest game

MindQuest is the project’s gamified assessment path. It is built to reduce friction and keep the experience engaging while still collecting meaningful signals.

#### Game Start

Introduces the three-stage journey and explains the approximate time required.

#### Level 1: Calm Mode

Focuses on breathing and gentle interaction. Users tap floating objects while following breathing cues.

#### Level 2: Challenge Mode

Mixes quiz questions with a memory-matching game to add moderate cognitive load.

#### Level 3: Stress Mode

Adds time pressure, distractions, and heightened visual urgency to simulate a stressful decision environment.

#### MindQuest Result

Displays the final anxiety classification, reward totals, completion stats, and recommended next actions.

### Manual PHQ-9 + GAD-7 screening

This flow is a traditional questionnaire path for users who need a more standard screening format.

- PHQ-9 covers depression symptom frequency over the last 2 weeks.
- GAD-7 covers anxiety symptom frequency over the last 2 weeks.
- The result screen summarizes both scores, severity bands, and support recommendations.

### Component library

This route demonstrates reusable design-system components such as buttons, mood selectors, XP badges, streak counters, risk cards, achievement badges, and glass cards.

### Design system showcase

This route shows the project’s visual language: colors, typography, spacing, radii, shadows, and icon usage.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Onboarding |
| `/dashboard` | Progress dashboard |
| `/emergency` | Crisis support |
| `/design-system` | Design tokens and UI language |
| `/components` | Component library |
| `/mindquest` | MindQuest start screen |
| `/mindquest/level1` | MindQuest Calm Mode |
| `/mindquest/level2` | MindQuest Challenge Mode |
| `/mindquest/level3` | MindQuest Stress Mode |
| `/mindquest/result` | MindQuest results |
| `/manual-assessment` | PHQ-9 + GAD-7 questionnaire |
| `/manual-assessment/result` | Questionnaire results |

## Components and UI building blocks

The project includes a reusable design system built around supportive, high-contrast, touch-friendly components.

Key reusable pieces include:

- PrimaryButton
- MoodButton
- XPBadge
- StreakCounter
- RiskCard
- AchievementBadge
- GlassCard
- NavigationMenu

The component library also demonstrates the project’s base UI layer from Radix and related primitives.

## Design system

The visual direction is calm, modern, and game-like without feeling childish.

### Colors

- Teal for trust and calm
- Blue for reliability and structure
- Purple for special features and accent state
- Gold for XP and rewards
- Green, amber, and red for risk signaling

### Interaction style

- Soft motion and entrance animations
- Glassmorphism panels
- Rounded cards and large tap targets
- Mobile-first layouts
- Clear visual feedback for status and risk

### Accessibility goals

- Keyboard-friendly navigation
- High contrast color usage
- Screen-reader-aware structure
- Large touch targets
- Clear state changes and feedback

## Technical stack

- React 18.3.1
- React Router 7
- Tailwind CSS v4
- Motion for animations
- Recharts for data visualization
- Lucide React for icons
- TypeScript
- Vite for build and development

## How to run

```bash
pnpm install
pnpm dev
pnpm build
```

## Project structure

The important app code lives under `src/app`:

- `src/app/screens` for end-user screens
- `src/app/components` for shared UI and showcase pages
- `src/app/components/design-system` for reusable product components
- `src/app/routes.ts` for route definitions
- `src/styles` for theme, font, and global styling

## Indian context and support

The app is positioned around Indian mental-health support and includes local helpline references.

- Tele-MANAS: 14416
- KIRAN: 1800-599-0019

## Important note

This project is a UI prototype and educational demonstration, not a medical diagnosis tool.

If someone is in immediate danger or at risk of self-harm, use emergency services or a local crisis line right away.

## Related docs

- [Quick Start Guide](./QUICKSTART.md)
- [Design System](./DESIGN_SYSTEM.md)
- [MindQuest Guide](./MINDQUEST_GUIDE.md)
- [MindQuest Summary](./MINDQUEST_SUMMARY.md)
- [Project Structure](./PROJECT_STRUCTURE.md)