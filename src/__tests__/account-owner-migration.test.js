import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import OwnerListing from '../components/ui/OwnerListing';

const mockUser = { id: 'owner', name: 'Alex', email: 'alex@example.test' };
const mockNavigate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockLogout = jest.fn();
const mockUnlist = jest.fn();
const mockRequestReset = jest.fn();
const mockReset = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    updateProfile: mockUpdate,
    logout: mockLogout,
    requestPasswordReset: mockRequestReset,
    resetPassword: mockReset,
  }),
}));
jest.mock('../context/LoginModalContext', () => ({
  useLoginModal: () => ({ openLogin: jest.fn() }),
}));
jest.mock('../context/PushContext', () => ({
  usePush: () => ({ pushEnabled: false, setPushEnabled: jest.fn() }),
}));
jest.mock('../context/UserListingsContext', () => ({
  useUserListings: () => ({ unlistListing: mockUnlist }),
}));
jest.mock('../api/client', () => ({
  baseUrl: '',
  api: { delete: (...args) => mockDelete(...args) },
}));
let container, root;
beforeEach(() => {
  jest.clearAllMocks();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
const render = (node) =>
  act(() => root.render(<MemoryRouter>{node}</MemoryRouter>));
const button = (text) =>
  [...document.querySelectorAll('button')].find(
    (b) => b.textContent.trim() === text,
  );
const click = (node) => act(() => node.click());
const change = (node, value) =>
  act(() => Simulate.change(node, { target: { value } }));
const submit = (form) =>
  act(async () => {
    Simulate.submit(form);
    await Promise.resolve();
  });

test('profile saves both fields through the existing handler and keeps failures visible', async () => {
  mockUpdate
    .mockResolvedValueOnce({ ok: false, message: 'Email is already in use.' })
    .mockResolvedValueOnce({ ok: true });
  render(<ProfilePage />);
  change(container.querySelector('[name="name"]'), 'Alex Rivera');
  change(container.querySelector('[name="email"]'), 'new@example.test');
  await submit(container.querySelector('form'));
  expect(mockUpdate).toHaveBeenCalledWith({
    name: 'Alex Rivera',
    email: 'new@example.test',
  });
  expect(container.querySelector('[role="alert"]').textContent).toContain(
    'Email is already in use',
  );
  expect(container.querySelector('[name="email"]').value).toBe(
    'new@example.test',
  );
  await submit(container.querySelector('form'));
  expect(container.querySelector('[role="status"]').textContent).toBe(
    'Profile updated.',
  );
});

test('password reset still requires the existing email code flow and displays completion', async () => {
  mockRequestReset.mockResolvedValue({ ok: true });
  mockReset.mockResolvedValue({ ok: true, message: 'Password updated.' });
  render(<ProfilePage />);
  click(button('Send reset code to my email'));
  await submit(button('Send code').closest('form'));
  expect(mockRequestReset).toHaveBeenCalledWith('alex@example.test');
  change(container.querySelector('#reset-code'), '12345');
  change(container.querySelector('#reset-password'), 'validPassword1');
  change(container.querySelector('#reset-confirm'), 'differentPassword');
  await submit(button('Reset password').closest('form'));
  expect(mockReset).not.toHaveBeenCalled();
  expect(container.textContent).toContain('Passwords do not match.');
  change(container.querySelector('#reset-confirm'), 'validPassword1');
  await submit(button('Reset password').closest('form'));
  expect(mockReset).toHaveBeenCalledWith(
    'alex@example.test',
    '12345',
    'validPassword1',
  );
  expect(container.textContent).toContain('Password updated.');
});

test('closing delete confirmation clears the password without calling the service', () => {
  render(<SettingsPage />);
  click(button('Delete account'));
  change(
    document.querySelector('#bb-delete-account input'),
    'private-password',
  );
  click(document.querySelector('[aria-label="Close dialog"]'));
  expect(document.querySelector('dialog')).toBeNull();
  expect(mockDelete).not.toHaveBeenCalled();
  click(button('Delete account'));
  expect(document.querySelector('#bb-delete-account input').value).toBe('');
  expect(button('Delete my account').disabled).toBe(true);
});

test('delete failure preserves the session and the password contract', async () => {
  mockDelete.mockRejectedValue(new Error('Incorrect password.'));
  render(<SettingsPage />);
  click(button('Delete account'));
  change(document.querySelector('#bb-delete-account input'), 'test-password');
  await submit(document.querySelector('#bb-delete-account'));
  expect(mockDelete).toHaveBeenCalledWith('/api/users/me', {
    password: 'test-password',
  });
  expect(mockLogout).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(document.querySelector('[role="alert"]').textContent).toBe(
    'Incorrect password.',
  );
});

test('owner card opens the existing availability editor and retains unlist errors for retry', async () => {
  mockUnlist
    .mockRejectedValueOnce(new Error('Try again.'))
    .mockResolvedValueOnce(undefined);
  render(
    <OwnerListing
      property={{
        id: 'p1',
        title: 'My condo',
        status: 'approved',
        listingType: 'rent',
        price: 25000,
      }}
      onOpen={jest.fn()}
    />,
  );
  click(button('Availability'));
  expect(mockNavigate).toHaveBeenCalledWith(
    '/add-property/p1?section=availability',
  );
  click(button('Unlist'));
  expect(mockUnlist).not.toHaveBeenCalled();
  await act(async () => document.querySelector('dialog .bb-danger').click());
  expect(mockUnlist).toHaveBeenCalledWith('p1');
  expect(document.querySelector('[role="alert"]').textContent).toBe(
    'Try again.',
  );
  await act(async () => document.querySelector('dialog .bb-danger').click());
  expect(document.querySelector('dialog')).toBeNull();
});
