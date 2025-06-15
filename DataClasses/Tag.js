export class Tag {
  constructor(tagID, tagName, tagCategory) {
    this.tagID = tagID; // int
    this.tagName = tagName; // String
    this.tagCategory = tagCategory; // Category (could be a string or a class)
  }

  toJSON() {
    return {
      tagID: this.tagID,
      tagName: this.tagName,
      tagCategory: this.tagCategory && typeof this.tagCategory.toJSON === 'function'
        ? this.tagCategory.toJSON()
        : this.tagCategory,
    };
  }

  static fromJSON(json) {
    return new Tag(
      json.tagID,
      json.tagName,
      json.tagCategory // Consider Category.fromJSON if Category is a class
    );
  }
}