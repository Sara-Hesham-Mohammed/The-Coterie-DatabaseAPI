import Person from './Person';
import Tag from './Tag';
// import Event from './Event'; // Uncomment and use if you have an Event class

class User extends Person {
  userID: number;
  tags: Set<Tag>;
  attendedEvents: any[]; // Replace 'any' with Event[] if you have an Event class

  constructor(
    userID: number,
    name: string,
    dateOfBirth: Date | null,
    gender: string,
    location: any,
    phoneNumber: string,
    email: string,
    tags: Set<Tag> = new Set(),
    attendedEvents: any[] = []
  ) {
    super(name, dateOfBirth, gender, location, phoneNumber, email);
    this.userID = userID;
    this.tags = tags;
    this.attendedEvents = attendedEvents;
  }

  toJSON(): object {
    return {
      userID: this.userID,
      name: this.name,
      dateOfBirth: this.dateOfBirth instanceof Date ? this.dateOfBirth.toISOString() : this.dateOfBirth,
      gender: this.gender,
      location: this.location && typeof (this.location as any).toJSON === 'function'
        ? (this.location as any).toJSON()
        : this.location,
      phoneNumber: this.phoneNumber,
      email: this.email,
      tags: Array.from(this.tags).map((tag: Tag) => tag.toJSON()),
      attendedEvents: this.attendedEvents.map(event =>
        typeof event.toJSON === 'function' ? event.toJSON() : event
      ),
    };
  }

  static fromJSON(json: any): User {
    return new User(
      json.userID,
      json.name,
      json.dateOfBirth ? new Date(json.dateOfBirth) : null,
      json.gender,
      json.location,
      json.phoneNumber,
      json.email,
      new Set(json.tags?.map((t: any) => Tag.fromJSON ? Tag.fromJSON(t) : t)),
      json.attendedEvents // Map to Event.fromJSON if Event class exists
    );
  }
}

export default User;