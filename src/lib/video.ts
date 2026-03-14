export function getVideoRoomUrl(meetingToken: string) {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_VIDEO_ROOM_BASE_URL;
  const baseUrl = configuredBaseUrl?.trim() || "https://meet.jit.si";
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const roomName = `telehealth-${meetingToken}`;

  return `${normalizedBase}/${encodeURIComponent(roomName)}`;
}
