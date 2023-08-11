import {test, expect} from 'vitest';
import {isProblemDetails} from '../src';

const problemDetails = {
  'type': 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
  'title': 'One or more validation errors occurred.',
  'status': 400,
  'detail': 'See the errors property for details.',
  'instance': '/api/todos/9',
  'errors': ['You cannot edit Completed Todos']
};

test('Should be able to determine if an object is a ProblemDetails object', () => {
  expect(isProblemDetails(problemDetails)).toBe(true);
});