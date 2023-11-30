import admin, { app } from "firebase-admin";
import { getFirebaseAdmin, initializeFirebaseAdmin } from "../index";

jest.mock("firebase-admin");

const originalWindow = globalThis.window;
const mockedInitializeApp = admin.initializeApp as jest.MockedFn<
  typeof admin.initializeApp
>;

beforeEach(() => {
  jest.resetModules();
});

afterEach(() => {
  mockedInitializeApp.mockClear();
  globalThis.window = originalWindow;
});

const config = {
  projectId: "TEST-PROJECT-ID",
  clientEmail: "TEST-CLIENT-EMAIL",
  privateKey: "TEST-PRIVATE-KEY",
  databaseURL: "TEST-DB-URL",
};

describe("Firebase server - index", () => {
  describe("The initializeFirebaseAdmin utility", () => {
    it("Will load the admin app", () => {
      initializeFirebaseAdmin(config);
      expect(mockedInitializeApp).toHaveBeenCalledTimes(1);
      expect(mockedInitializeApp.mock.calls[0]).toMatchInlineSnapshot(`
[
  {
    "credential": {
      "clientEmail": "TEST-CLIENT-EMAIL",
      "privateKey": "TEST-PRIVATE-KEY",
      "projectId": "TEST-PROJECT-ID",
    },
    "databaseURL": "TEST-DB-URL",
  },
]
`);
    });

    it("Will silently fail if the app is already initialized", () => {
      mockedInitializeApp.mockImplementation(() => {
        throw new Error("already exists");
      });
      const result = initializeFirebaseAdmin(config);
      expect(result).toMatchInlineSnapshot(`
{
  "isError": false,
}
`);
    });

    it("Will fail if there is an unknown error", () => {
      mockedInitializeApp.mockImplementation(() => {
        throw new Error("TEST");
      });
      const result = initializeFirebaseAdmin(config);
      expect(result).toMatchInlineSnapshot(`
{
  "error": [Error: TEST],
  "isError": true,
}
`);
    });

    it("Will fail if called on the client", () => {
      const mock = {} as Window & typeof globalThis;
      Object.defineProperty(globalThis, "window", {
        value: mock,
        writable: true,
      });
      const result = initializeFirebaseAdmin(config);
      expect(result).toMatchInlineSnapshot(`
{
  "error": [Error: Function 'initializeFirebaseAdmin' can not be called on the client],
  "isError": true,
}
`);
    });
  });

  describe("The getFirebaseAdmin utility", () => {
    it("Will get the admin if it is set", () => {
      const test = {} as app.App;
      mockedInitializeApp.mockImplementation(() => {
        return test;
      });
      initializeFirebaseAdmin(config);
      const result = getFirebaseAdmin();
      expect(result).toMatchObject({ isError: false, value: test });
    });

    it("Will fail if the admin app has not been initialized", () => {
      jest.isolateModules(async () => {
        const { getFirebaseAdmin } = await import("../index");
        const test = {} as app.App;
        mockedInitializeApp.mockImplementation(() => {
          return test;
        });
        const result = getFirebaseAdmin();
        expect(result).toMatchInlineSnapshot(`
{
  "error": [Error: Firebase admin as not been initialized],
  "isError": true,
}
`);
      });
    });
  });
});
