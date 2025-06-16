//add additional info
export class Event {
  constructor(id, name, location, date = new Date(), description = '') {
    this.id = id;
    this.name = name;
    this.location = location;
    this.date = date;
    this.description = description;
  }

  // Method to convert the class instance to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
      date: this.date instanceof Date ? this.date.toISOString() : this.date,
      description: this.description
    };
  }

  // Static method to create a class instance from JSON
  static fromJSON(json) {
    return new Event(
      json.id,
      json.name,
      json.location,
      json.date ? new Date(json.date) : new Date(),
      json.description
    );
  }
}