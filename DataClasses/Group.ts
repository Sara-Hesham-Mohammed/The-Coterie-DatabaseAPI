import User from './User';
import Tag from './Tag';

class Group {
  groupID: number;
  users: Set<User>;
  commonTags: Set<Tag>;
  maxUsers: number;
  isFull: boolean;

  constructor(
    groupID: number,
    users: Set<User> = new Set(),
    commonTags: Set<Tag> = new Set(),
    maxUsers: number,
    isFull: boolean = false
  ) {
    this.groupID = groupID;
    this.users = users;
    this.commonTags = commonTags;
    this.maxUsers = maxUsers;
    this.isFull = isFull;
  }

  toJSON(): object {
    return {
      groupID: this.groupID,
      users: Array.from(this.users).map(user =>
        typeof (user as any).toJSON === 'function' ? (user as any).toJSON() : user
      ),
      commonTags: Array.from(this.commonTags).map(tag =>
        typeof (tag as any).toJSON === 'function' ? (tag as any).toJSON() : tag
      ),
      maxUsers: this.maxUsers,
      isFull: this.isFull,
    };
  }

  static fromJSON(json: any): Group {
    return new Group(
      json.groupID,
      new Set(json.users?.map((u: any) => User.fromJSON ? User.fromJSON(u) : u)),
      new Set(json.commonTags?.map((t: any) => Tag.fromJSON ? Tag.fromJSON(t) : t)),
      json.maxUsers,
      json.isFull
    );
  }
}

export default Group;