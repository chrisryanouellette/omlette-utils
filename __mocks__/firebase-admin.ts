import type dep from "firebase-admin";

const mock = jest.createMockFromModule<typeof dep>("firebase-admin");

mock.initializeApp = jest.fn();
mock.credential = {
    cert: jest.fn().mockImplementation((val) => val),
    applicationDefault: jest.fn(),
    refreshToken: jest.fn()
}

export default mock
