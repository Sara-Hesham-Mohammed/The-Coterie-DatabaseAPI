class Person {
  constructor(name, dateOfBirth, gender, location, phoneNumber, email) {
    this.name = name;
    this.dateOfBirth = dateOfBirth; // Should be a Date object
    this.gender = gender;
    this.location = location; // Should be a Location object or class
    this.phoneNumber = phoneNumber;
    this.email = email;
  }

  // Method to convert the class instance to JSON
  toJSON() {
    return {
      name: this.name,
      dateOfBirth: this.dateOfBirth instanceof Date ? this.dateOfBirth.toISOString() : this.dateOfBirth,
      gender: this.gender,
      location: this.location && typeof this.location.toJSON === 'function'
        ? this.location.toJSON()
        : this.location,
      phoneNumber: this.phoneNumber,
      email: this.email,
    };
  }

  // Static method to create a class instance from JSON
  static fromJSON(json) {
    return new Person(
      json.name,
      json.dateOfBirth ? new Date(json.dateOfBirth) : null,
      json.gender,
      json.location, // You may want to call Location.fromJSON(json.location) if Location is a class
      json.phoneNumber,
      json.email
    );
  }
}
