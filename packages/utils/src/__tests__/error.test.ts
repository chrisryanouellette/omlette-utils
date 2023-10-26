import {
  getErrorCode,
  getErrorMessage,
  handleError,
  selectError,
} from "../error";

describe("The error utilities", () => {
  describe("getErrorMessage", () => {
    it("Will return the error message when present", () => {
      const data = { message: "TEST" };
      const code = getErrorMessage(data);
      expect(code).toBe(data.message);
    });
    it("Will return the error message as a string when given an object", () => {
      const data = { key: "TEST" };
      const code = getErrorMessage(data);
      expect(code).toBe(JSON.stringify(data));
    });
    it("Will return the error message as a string when given an invalid object", () => {
      const data: Record<string, unknown> = {};
      data.a = data;
      const code = getErrorMessage(data);
      expect(code).toBe(String(data));
    });
  });

  describe("getErrorCode", () => {
    it("Will return the error code when present", () => {
      const data = { code: "200" };
      const code = getErrorCode(data);
      expect(code).toBe(data.code);
    });
    it("Will return null when no error code is present", () => {
      const data = { message: "TEST" };
      const code = getErrorCode(data);
      expect(code).toBeNull();
    });
  });

  describe("selectError", () => {
    it("Will return the value", async () => {
      const data = "TEST";
      const result = await selectError(() => data, getErrorMessage);
      expect(result).toEqual({ isError: false, value: data });
    });

    it("Will select an error from a function that throws", async () => {
      const data = "TEST";
      const error = new Error(data);
      const result = await selectError(() => {
        throw error;
      }, getErrorMessage);
      expect(result).toEqual({ isError: true, error });
    });
  });

  describe("handleError", () => {
    it("Will return the value", async () => {
      const data = "TEST";
      const result = await handleError(() => data);
      expect(result).toEqual({ isError: false, value: data });
    });

    it("Will handle an error from a function that throws an error", async () => {
      const data = "TEST";
      const error = new Error(data);
      const result = await handleError(() => {
        throw error;
      });
      expect(result).toEqual({ isError: true, error });
    });

    it("Will handle an error from a function that throws an object", async () => {
      const data = "TEST";
      const error = { message: data };
      const result = await handleError(() => {
        throw error;
      });
      expect(result).toEqual({ isError: true, error: new Error(data) });
    });
  });
});
