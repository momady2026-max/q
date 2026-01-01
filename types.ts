
export enum QuestionType {
  MULTIPLE_CHOICE = 'Multiple Choice',
  TRUE_FALSE = 'True/False',
  FILL_IN_THE_BLANK = 'Fill in the blank',
  ESSAY = 'Essay',
  MATCHING = 'Matching',
  OTHER = 'Other'
}

export enum DifficultyLevel {
  HIGH = 'High',
  MEDIUM = 'Medium',
  EASY = 'Easy'
}

export enum EducationStage {
  PRIMARY = 'Primary',
  PREPARATORY = 'Preparatory',
  SECONDARY = 'Secondary'
}

export enum Semester {
  FIRST = 'First',
  SECOND = 'Second'
}

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
  image?: string; // base64
  matchText?: string; // For Matching type questions
}

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  category: string;
  text: string;
  image?: string; // base64
  choices: Choice[];
  correctAnswer?: string; // For fill in blank or essay (optional)
  points: number;
  bgColor?: string; // Custom bg color for this question
  // Classification fields for the bank
  stage?: EducationStage;
  grade?: string;
  subject?: string;
  semester?: Semester;
  branch?: string;
}

export interface QuizAppearance {
  backgroundColor: string;
  backgroundImage?: string; // New: Support for background images
  answerBoxBg: string;
  answerTextColor: string;
  selectedColor: string;
  selectedTextColor: string;
  fontSizeChoices: number;
  spacingChoices: number;
  borderStyle: 'none' | 'solid' | 'dashed' | 'double';
  showSideColumn: boolean;
  // New properties
  answerBoxShape: 'rounded' | 'square' | 'pill' | 'leaf';
  boxEffect: 'flat' | '3d' | 'glow' | 'glass' | 'neon';
  transitionEffect: 'slide' | 'fade' | 'zoom' | 'flip' | 'none';
  answerAnimation: 'none' | 'pulse' | 'scale' | 'wobble' | 'shake'; // New: Button click animation
  questionImageStyle: 'default' | 'rounded' | 'square_frame' | 'square';
}

export interface CloudConfig {
  firebaseConfig?: string; // JSON string or URL
  cloudUrl?: string; // API endpoint for results/banks
  folderName?: string; // Folder name for storage
  syncGrades: boolean;
  syncTests: boolean;
  syncBank: boolean;
}

export interface BrandingConfig {
  designerName: string;
  designerLogo?: string;
  position: 'left' | 'center' | 'right';
  textLayout: 'top' | 'bottom' | 'left' | 'right' | 'circular';
  logoWidth: number;
  logoHeight: number;
  textColor: string;
  fontSize: number;
  fontFamily: string;
}

export interface FeedbackMessages {
  fullMark: string; // New field added
  excellent: string;
  veryGood: string;
  good: string;
  fair: string;
  poor: string;
}

export interface QuizSettings {
  language: 'en' | 'ar';
  title: string;
  className: string;
  subject: string;
  branch: string;
  unit: string;
  lesson: string;
  timerEnabled: boolean;
  timerMode: 'total' | 'question'; // New: Mode selection
  timerSeconds: number;
  teacherWhatsApp: string;
  skipNameEntry: boolean;
  welcomeMessage: string;
  messageDuration: number;
  maxAttempts: number; // 0 for unlimited, 1 for single, N for specific
  appearance: QuizAppearance;
  cloudConfig: CloudConfig;
  branding: BrandingConfig;
  feedbackMessages: FeedbackMessages; 
  finalScoreHeader: string; 
  schedulingEnabled: boolean;
  shuffleQuestions: boolean; // Added for shuffling
  startTime?: string;
  endTime?: string;
  schedulingMessage?: string;
  preventSplitScreen: boolean;
  preventScreenshot: boolean;
  offlineMode: boolean;
  designerName?: string; 
  designerLogo?: string; 
  copyrightPosition: 'left' | 'center' | 'right'; 
  defaultStage?: EducationStage;
  defaultGrade?: string;
  defaultSemester?: Semester;
}

export interface QuizData {
  questions: Question[];
  settings: QuizSettings;
}

export interface SavedQuizEntry {
  id: string;
  data: QuizData;
  savedAt: string;
}
