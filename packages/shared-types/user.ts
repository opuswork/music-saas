export interface IUser {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IUserLesson {
  userId: string;
  lessonId: string;
  lessonCreatedAt: Date;
  lessonPartCreatedAt: Date;
  lessonPartUpdatedAt: Date;
}