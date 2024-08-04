export function formatSeconds(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(secs).padStart(2, '0')
    ].join(':')
}

export interface IChzzkStreamer {
  uid: string,
  nickname: string,
  isStreamOn: boolean,
  avatarUrl: string
}

export async function getChzzkUser(uid: string) {
     return await useRequestFetch()(`https://api-nabot.mori.space/user/${uid}`) as IChzzkStreamer
}