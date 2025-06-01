const Person = require('./Person');

class Admin extends Person {
  constructor(name, dateOfBirth, gender, location, phoneNumber, email) {
    if (Admin.instance) {
      return Admin.instance;
    }
    super(name, dateOfBirth, gender, location, phoneNumber, email);
    Admin.instance = this;
  }

  static getAdmin() {
    if (!Admin.instance) {
      // You can set default admin details here or throw an error if not initialized
      Admin.instance = new Admin("Admin", null, null, null, null, null);
    }
    return Admin.instance;
  }

  manageUser() {
    // Implement user management logic here
  }

  manageHost() {
    // Implement host management logic here
  }

  reviewRequest() {
    // Implement request review logic here
    // Return true/false based on review
    return true;
  }
}

module.exports = Admin;