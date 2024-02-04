import { Throwable, errorFactory, getErrorMessage } from "@ouellettec/utils";

function getFileDimensions(file: File): Promise<Throwable<HTMLImageElement>> {
  return new Promise((resolve) => {
    try {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.addEventListener("load", function handleUploadedImageLoad() {
        URL.revokeObjectURL(url);
        return resolve({
          isError: false,
          value: image,
        });
      });
      image.addEventListener("error", function handleUploadedImageError(error) {
        URL.revokeObjectURL(url);
        return resolve(errorFactory(getErrorMessage(error)));
      });
      image.src = url;
    } catch (error) {
      return resolve(errorFactory(getErrorMessage(error)));
    }
  });
}

function getCanvasImage(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Throwable<Blob>> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return resolve(
            errorFactory("Blob was not created from canvas element"),
          );
        }
        return resolve({ isError: false, value: blob });
      },
      "image/webp",
      quality,
    );
  });
}

export async function convertToWebp(
  file: File,
  name: string,
  conversions: { width: number; quality: number },
): Promise<Throwable<File>> {
  const maybeImageFile = await getFileDimensions(file);
  if (maybeImageFile.isError) return maybeImageFile;
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(conversions.width, maybeImageFile.value.width);
  const ratio = maybeImageFile.value.height / maybeImageFile.value.width;
  canvas.height = ratio * canvas.width;
  const context = canvas.getContext?.("2d");
  if (!context) {
    return errorFactory("Cannot get canvas 2d context");
  }
  context.drawImage(maybeImageFile.value, 0, 0, canvas.width, canvas.height);
  const maybeBlob = await getCanvasImage(canvas, conversions.quality);
  if (maybeBlob.isError) return maybeBlob;
  const image = new File([maybeBlob.value], name, {
    type: "webp",
  });
  return { isError: false, value: image };
}
