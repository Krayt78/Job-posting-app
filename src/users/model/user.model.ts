export interface User {
    id: string;          // Unique identifier (consider using UUID)
    email: string;
    password: string;    // Store hashed password only
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
  