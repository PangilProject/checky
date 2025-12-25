type Direction = "mb" | "mt" | "ml" | "mr";

const SPACE_MAP = {
  2: {
    mb: "mb-2",
    mt: "mt-2",
    ml: "ml-2",
    mr: "mr-2",
  },
  4: {
    mb: "mb-4",
    mt: "mt-4",
    ml: "ml-4",
    mr: "mr-4",
  },
  8: {
    mb: "mb-8",
    mt: "mt-8",
    ml: "ml-8",
    mr: "mr-8",
  },
  10: {
    mb: "mb-10",
    mt: "mt-10",
    ml: "ml-10",
    mr: "mr-10",
  },
  12: {
    mb: "mb-12",
    mt: "mt-12",
    ml: "ml-12",
    mr: "mr-12",
  },
  20: {
    mb: "mb-20",
    mt: "mt-20",
    ml: "ml-20",
    mr: "mr-20",
  },
  24: {
    mb: "mb-24",
    mt: "mt-24",
    ml: "ml-24",
    mr: "mr-24",
  },
} as const;

const createSpace =
  (size: keyof typeof SPACE_MAP) =>
  ({ direction }: { direction: Direction }) => {
    return <div className={SPACE_MAP[size][direction]} />;
  };

export const Space2 = createSpace(2);
export const Space4 = createSpace(4);
export const Space8 = createSpace(8);
export const Space10 = createSpace(10);
export const Space12 = createSpace(12);
export const Space20 = createSpace(20);
export const Space24 = createSpace(24);
