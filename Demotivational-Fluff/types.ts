export enum MoodType {
  HAPPY = 'Happy',
  SAD = 'Sad',
  ANGRY = 'Angry',
  TIRED = 'Tired',
  ANXIOUS = 'Anxious',
  BORED = 'Bored',
  HUNGRY = 'Hungry',
  OVERWHELMED = 'Overwhelmed'
}

export interface GeneratedPosterData {
  quote: string;
  imageBase64: string;
  animalDescription: string;
}

export interface MoodConfig {
  type: MoodType;
  emoji: string;
  color: string;
  textColor: string;
}