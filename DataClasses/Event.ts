
import {LocalLocation} from './Location';

class Event {
  id: number;
  name: string;
  location: LocalLocation; 

  constructor(id: number, name: string, location: LocalLocation) {
    this.id = id;
    this.name = name;
    this.location = location;
  }

  // Method to convert the class instance to JSON
  toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
    };
  }

  // Static method to create a class instance from JSON
  static fromJSON(json: any): Event {
    return new Event(json.id, json.name, json.location);
  }
}

export default Event;
