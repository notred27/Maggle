// Simulate react-router-dom

const mockNavigate = jest.fn();
module.exports = {
  useParams: () => ({ uid: 'mockedUid' }),
  useNavigate: jest.fn(() => mockNavigate),
  useLocation: jest.fn(),
  __mockNavigate: mockNavigate
};
