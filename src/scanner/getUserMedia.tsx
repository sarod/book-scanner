export async function getUserMedia(): Promise<MediaStream> {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 300 },
        height: { ideal: 200 },
      },
      audio: false,
    });
    console.error("Media stream acquired.");
    return mediaStream;
  } catch (err) {
    console.error("Error accessing camera: ", err);
    throw err;
  }
}
