
import {LocalLocation} from './Location';

class Person {
  name: string;
  dateOfBirth: Date | null;
  gender: string;
  location: LocalLocation;
  phoneNumber: string;
  email: string;

  constructor(
    name: string,
    dateOfBirth: Date | null,
    gender: string,
    location: LocalLocation,
    phoneNumber: string,
    email: string
  ) {
    this.name = name;
    this.dateOfBirth = dateOfBirth;
    this.gender = gender;
    this.location = location;
    this.phoneNumber = phoneNumber;
    this.email = email;
  }

  // Method to convert the class instance to JSON
  toJSON(): object {
    return {
      name: this.name,
      dateOfBirth:
        this.dateOfBirth instanceof Date
          ? this.dateOfBirth.toISOString()
          : this.dateOfBirth,
      gender: this.gender,
      location:
        this.location && typeof (this.location as any).toJSON === "function"
          ? (this.location as any).toJSON()
          : this.location,
      phoneNumber: this.phoneNumber,
      email: this.email,
    };
  }

  // Static method to create a class instance from JSON
  static fromJSON(json: any): Person {
    return new Person(
      json.name,
      json.dateOfBirth ? new Date(json.dateOfBirth) : null,
      json.gender,
      json.location, 
      json.phoneNumber,
      json.email
    );
  }
}

export default Person;
