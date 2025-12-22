type Direction = "mb" | "mt" | "ml" | "mr";
const createSpace =
  (size: 4 | 10 | 12 | 20 | 24) =>
  ({ direction }: { direction: Direction }) => {
    const map = {
      mb: `mb-${size}`,
      mt: `mt-${size}`,
      ml: `ml-${size}`,
      mr: `mr-${size}`,
    };

    return <div className={map[direction]} />;
  };

export const Space4 = createSpace(4);
export const Space10 = createSpace(10);
export const Space12 = createSpace(12);
export const Space20 = createSpace(20);
export const Space24 = createSpace(24);
