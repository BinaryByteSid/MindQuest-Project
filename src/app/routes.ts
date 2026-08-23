import { createBrowserRouter } from "react-router";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { ProgressDashboard } from "./screens/ProgressDashboard";
import { EmergencyMode } from "./screens/EmergencyMode";
import { DesignSystemShowcase } from "./components/DesignSystemShowcase";
import { ComponentLibrary } from "./components/ComponentLibrary";
import { GameStartScreen } from "./screens/GameStartScreen";
import { Level1CalmMode } from "./screens/Level1CalmMode";
import { Level2ChallengeMode } from "./screens/Level2ChallengeMode";
import { Level3StressMode } from "./screens/Level3StressMode";
import { MindQuestResultScreen } from "./screens/MindQuestResultScreen";
import { ManualAssessmentScreen } from "./screens/ManualAssessmentScreen";
import { ManualAssessmentResultScreen } from "./screens/ManualAssessmentResultScreen";
import { BreathingExerciseScreen } from "./screens/BreathingExerciseScreen";
import { PreGameBreathingScreen } from "./screens/PreGameBreathingScreen";
import AiBuddyScreen from "./screens/AiBuddyScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: OnboardingScreen,
  },
  {
    path: "/dashboard",
    Component: ProgressDashboard,
  },
  {
    path: "/emergency",
    Component: EmergencyMode,
  },
  {
    path: "/design-system",
    Component: DesignSystemShowcase,
  },
  {
    path: "/components",
    Component: ComponentLibrary,
  },
  {
    path: "/mindquest",
    Component: GameStartScreen,
  },
  {
    path: "/mindquest/breathing",
    Component: PreGameBreathingScreen,
  },
  {
    path: "/mindquest/level1",
    Component: Level1CalmMode,
  },
  {
    path: "/mindquest/level2",
    Component: Level2ChallengeMode,
  },
  {
    path: "/mindquest/level3",
    Component: Level3StressMode,
  },
  {
    path: "/mindquest/result",
    Component: MindQuestResultScreen,
  },
  {
    path: "/manual-assessment",
    Component: ManualAssessmentScreen,
  },
  {
    path: "/manual-assessment/result",
    Component: ManualAssessmentResultScreen,
  },
  {
    path: "/breathing",
    Component: BreathingExerciseScreen,
  },
  {
    path: "/ai-buddy",
    Component: AiBuddyScreen,
  },
]);