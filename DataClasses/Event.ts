//add additional info
class Event {
  constructor(id, name, location) {
    this.id = id;
    this.name = name;
    this.location = location;
  }

  // Method to convert the class instance to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
    };
  }

  // Static method to create a class instance from JSON
  static fromJSON(json) {
    return new Event(json.id, json.name, json.location);
  }
}
