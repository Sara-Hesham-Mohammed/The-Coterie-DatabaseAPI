class Tag {
  tagID: number;
  tagName: string;
  tagCategory: string | object; // Replace 'object' with your Category type if available

  constructor(tagID: number, tagName: string, tagCategory: string | object) {
    this.tagID = tagID;
    this.tagName = tagName;
    this.tagCategory = tagCategory;
  }

  toJSON(): object {
    return {
      tagID: this.tagID,
      tagName: this.tagName,
      tagCategory:
        this.tagCategory && typeof (this.tagCategory as any).toJSON === 'function'
          ? (this.tagCategory as any).toJSON()
          : this.tagCategory,
    };
  }

  static fromJSON(json: any): Tag {
    return new Tag(
      json.tagID,
      json.tagName,
      json.tagCategory // Use Category.fromJSON if Category is a class
    );
  }
}

export default Tag;