export function closeMediaStream(stream: MediaStream) {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}
