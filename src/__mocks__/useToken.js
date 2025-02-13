const useToken = jest.fn(() => ({
    setToken: jest.fn(),
    getToken: jest.fn(() => 'mocked_token'),
}));

export default useToken;