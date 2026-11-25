type OpenCvModule = {
  Mat: new () => any;
  MatVector: new () => any;
  Size: new (width: number, height: number) => any;
  Point: new (x: number, y: number) => any;
  Scalar: new (value: number) => any;
  imread(source: HTMLCanvasElement): any;
  imshow(target: HTMLCanvasElement, image: any): void;
  cvtColor(source: any, target: any, code: number): void;
  Canny(source: any, target: any, low: number, high: number): void;
  findContours(source: any, contours: any, hierarchy: any, mode: number, method: number): void;
  contourArea(contour: any): number;
  arcLength(contour: any, closed: boolean): number;
  approxPolyDP(source: any, target: any, epsilon: number, closed: boolean): void;
  getPerspectiveTransform(source: any, target: any): any;
  warpPerspective(source: any, target: any, transform: any, size: any): void;
  COLOR_RGBA2GRAY: number;
  RETR_LIST: number;
  CHAIN_APPROX_SIMPLE: number;
};

let openCvPromise: Promise<OpenCvModule> | null = null;

async function getOpenCv(): Promise<OpenCvModule> {
  openCvPromise ??= import("@techstark/opencv-js").then(async (module) => {
    const candidate = (module as { default?: unknown }).default ?? module;
    return typeof (candidate as { then?: unknown }).then === "function"
      ? await candidate as OpenCvModule
      : candidate as OpenCvModule;
  });
  return openCvPromise;
}

function orderCorners(points: any[]): any[] {
  return [...points].sort((a, b) => (a.x + a.y) - (b.x + b.y));
}

export async function straightenBoard(source: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  const cv = await getOpenCv();
  const input = cv.imread(source);
  const gray = new cv.Mat();
  const edges = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  try {
    cv.cvtColor(input, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, edges, 60, 180);
    cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
    let best: any = null;
    let bestArea = 0;
    for (let index = 0; index < contours.size(); index += 1) {
      const contour = contours.get(index);
      const area = cv.contourArea(contour);
      const perimeter = cv.arcLength(contour, true);
      const polygon = new cv.Mat();
      cv.approxPolyDP(contour, polygon, perimeter * 0.02, true);
      if (polygon.rows === 4 && area > bestArea) {
        best = polygon;
        bestArea = area;
      } else {
        polygon.delete();
      }
      contour.delete();
    }
    if (!best || bestArea < input.rows * input.cols * 0.25) return source;
    const points = orderCorners(Array.from({ length: 4 }, (_, index) => ({ x: best.intPtr(index, 0)[0], y: best.intPtr(index, 0)[1] })));
    const sourcePoints = cv.matFromArray(4, 1, cv.CV_32FC2 ?? 13, points.flatMap((point) => [point.x, point.y]));
    const targetPoints = cv.matFromArray(4, 1, cv.CV_32FC2 ?? 13, [0, 0, 1000, 0, 1000, 1000, 0, 1000]);
    const transform = cv.getPerspectiveTransform(sourcePoints, targetPoints);
    const output = new cv.Mat();
    cv.warpPerspective(input, output, transform, new cv.Size(1000, 1000));
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 1000;
    cv.imshow(canvas, output);
    sourcePoints.delete();
    targetPoints.delete();
    transform.delete();
    output.delete();
    best.delete();
    return canvas;
  } finally {
    input.delete();
    gray.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();
  }
}
