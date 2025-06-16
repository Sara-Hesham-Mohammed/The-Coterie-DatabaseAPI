// Make sure to import Person, Tag, and  if needed
import { Person } from './Person.js';
import { Tag } from './Tag.js';
import { Event } from './Event.js';

export class User extends Person {
  constructor(userID, name, dateOfBirth, gender, location, phoneNumber, email, tags = new Set(), attendedEvents = new Set()) {
    super(name, dateOfBirth, gender, location, phoneNumber, email);
    this.userID = userID; // int
    this.tags = tags; // Set<Tag>
    this.attendedEvents = attendedEvents; // Set<Event>
  }

  // Method to convert the class instance to JSON
  toJSON() {
    return {
      userID: this.userID,
      name: this.name,
      dateOfBirth: this.dateOfBirth instanceof Date ? this.dateOfBirth.toISOString() : this.dateOfBirth,
      gender: this.gender,
      location: this.location && typeof this.location.toJSON === 'function'
        ? this.location.toJSON()
        : this.location,
      phoneNumber: this.phoneNumber,
      email: this.email,
      tags: Array.from(this.tags).map(tag => typeof tag.toJSON === 'function' ? tag.toJSON() : tag),
      attendedEvents: Array.from(this.attendedEvents).map(event => typeof event.toJSON === 'function' ? event.toJSON() : event),
    };
  }

  // Static method to create a class instance from JSON
  static fromJSON(json) {
    return new User(
      json.userID,
      json.name,
      json.dateOfBirth ? new Date(json.dateOfBirth) : null,
      json.gender,
      json.location, // Consider Location.fromJSON if needed
      json.phoneNumber,
      json.email,
      new Set(json.tags || []), // Consider Tag.fromJSON for each tag if needed
      new Set(json.attendedEvents || []) // Consider .fromJSON for each event if needed
    );
  }
}
