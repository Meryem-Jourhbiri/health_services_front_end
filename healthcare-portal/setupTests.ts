import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

// Minimal mock for HeroUI Button to avoid ripple/domAnimation internals in tests
jest.mock("@heroui/button", () => {
  const React = require("react");
  return {
    __esModule: true,
    Button: React.forwardRef(
      (
        { children, onPress, onClick, isLoading: _isLoading, ...rest }: any,
        ref: any,
      ) =>
        React.createElement(
          "button",
          { ref, onClick: onPress ?? onClick, ...rest },
          children,
        ),
    ),
  };
});

// Mock framer-motion to avoid dynamic import issues in tests
jest.mock("framer-motion", () => {
  const React = require("react");
  const noop = React.forwardRef((props: any, ref: any) =>
    React.createElement("div", { ref, ...props }),
  );

  return {
    __esModule: true,
    AnimatePresence: ({ children }: any) =>
      React.createElement(React.Fragment, null, children),
    motion: new Proxy(
      {},
      {
        get: () => noop,
      },
    ),
  };
});
