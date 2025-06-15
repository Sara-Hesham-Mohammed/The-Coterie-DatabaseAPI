import { User } from './User.js';
import { Tag } from './Tag.js';

export class Group {
  constructor(groupID, users = new Set(), commonTags = new Set(), maxUsers, isFull = false) {
    this.groupID = groupID; // int
    this.users = users; // Set<User>
    this.commonTags = commonTags; // Set<Tag>
    this.maxUsers = maxUsers; // int
    this.isFull = isFull; // boolean
  }

  toJSON() {
    return {
      groupID: this.groupID,
      users: Array.from(this.users).map(user => typeof user.toJSON === 'function' ? user.toJSON() : user),
      commonTags: Array.from(this.commonTags).map(tag => typeof tag.toJSON === 'function' ? tag.toJSON() : tag),
      maxUsers: this.maxUsers,
      isFull: this.isFull,
    };
  }

  static fromJSON(json) {
    return new Group(
      json.groupID,
      new Set(json.users), // Consider User.fromJSON for each user if needed
      new Set(json.commonTags), // Consider Tag.fromJSON for each tag if needed
      json.maxUsers,
      json.isFull
    );
  }
}