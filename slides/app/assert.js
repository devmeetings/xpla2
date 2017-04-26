// @flow

export function nonNull<T> (condition: ?T, message: string = 'Pre-condition failure.'): T {
  if (!condition) {
    throw new Error(message)
  }

  return condition
}

export function cast<T> (input: any): T {
  if (!input) {
    throw new Error('Expected non-null object for casting.')
  }
  return input
}
