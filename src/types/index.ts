
  export interface OnboardingData {
    role: 'DONOR' | 'RECEIVER';
    location: Location;
  }
  export interface Location {
    userId: string;
    id: string;
    latitude: number;
    longitude: number;
    address: string;
  }
  
  export interface User {
    id: string;
    role: 'DONOR' | 'RECEIVER';
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface UserWithLocation extends User {
    location: Location;
  }
  