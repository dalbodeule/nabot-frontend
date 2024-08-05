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

export async function getSessionUser(sid: string) {
    return await useRequestFetch()(`https://api-nabot.mori.space/session/${sid}`) as IChzzkStreamer
}

const regex = /.*(?:youtu.be\/|v\/|u\/\\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/

export function getYoutubeVideoId(url: string): string | undefined {
    const matchResult = regex.exec(url)

    if(matchResult) return matchResult[1]
    else return undefined
}