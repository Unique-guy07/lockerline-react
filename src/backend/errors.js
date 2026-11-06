// PROVIDED: do not edit.
// A refusal the backend gives. Services throw these; routes.js turns them into the problem body
// { type, title, status, detail, instance, ...extras }.

export class Refusal extends Error {
  constructor(status, type, title, detail, extras = {}) {
    super(detail);
    this.status = status;
    this.type = type;
    this.title = title;
    this.extras = extras;
  }
}

/** A request part that does not fit: one { field, message } per bad field. */
export class ValidationError extends Refusal {
  constructor(errors) {
    super(400, '/errors/validation', 'Invalid request', 'The request is not valid', { errors });
  }
}

export class NoSuchTower extends Refusal {
  constructor(tower) {
    super(404, '/errors/no-such-tower', 'No such tower', `There is no tower ${tower}`);
  }
}

export class NoSuchDoor extends Refusal {
  constructor(tower, no) {
    super(404, '/errors/no-such-door', 'No such door', `Tower ${tower} has no door ${no}`);
  }
}

export class NoSuchFlat extends Refusal {
  constructor(flat) {
    super(400, '/errors/no-such-flat', 'No such flat', `There is no flat ${flat} in this tower`);
  }
}

export class NoDoorFree extends Refusal {
  constructor(sizeClass, freeSizes) {
    super(409, '/errors/no-door-free', 'No door free', `No ${sizeClass} door is free`, { freeSizes });
  }
}

export class NoSuchParcel extends Refusal {
  constructor(parcelId) {
    super(404, '/errors/no-such-parcel', 'No such parcel', `There is no parcel ${parcelId}`);
  }
}

/** No-such-code and code-expired share 404, so a guesser cannot tell them apart; only the type differs. */
export class NoSuchCode extends Refusal {
  constructor() {
    super(404, '/errors/no-such-code', 'No such code', 'There is no parcel waiting for this code');
  }
}

export class CodeExpired extends Refusal {
  constructor() {
    super(404, '/errors/code-expired', 'Code expired', 'The free window of this code has passed');
  }
}

export class CodeUsed extends Refusal {
  constructor() {
    super(409, '/errors/code-used', 'Code used', 'This code has already opened its door');
  }
}
