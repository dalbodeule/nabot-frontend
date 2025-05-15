import type {IChzzkSession} from "~/components/ChzzkProfileWithButtons.vue";

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

export async function getChzzkUser(uid: string, url: string): Promise<IChzzkStreamer> {
    return await useRequestFetch()(`${url}/user/${uid}`) as IChzzkStreamer
}

export async function getSessionUser(url: string) {
    return await useRequestFetch()(`${url}/user`, {
        credentials: 'include',
    }) as IChzzkSession[] | undefined
}

const regex = /.*(?:youtu.be\/|v\/|u\/\\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/

export function getYoutubeVideoId(url: string): string | undefined {
    const matchResult = regex.exec(url)

    if(matchResult) return matchResult[1]
    else return undefined
}

export function getGuildIconUrl(guildId: string, iconHash: string) {
    return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png`
}

export function getGuildBannerUrl(guildId: string, bannerHash: string) {
    return `https://cdn.discordapp.com/banners/${guildId}/${bannerHash}.png`
}

export const _PING_TIME = 5 * 1000

export const defaultCommands: {label: string, content: string }[] = [
    {label: "!명령어", content: "명령어 목록을 확인합니다."},
    {label: '!명령어추가', content: '명령어를 추가합니다.'},
    {label: '!명령어삭제,', content: '명령어를 삭제합니다.'},
    {label: '!명령어수정', content: '명령어를 수정합니다.'},
    {label: '!시간', content: '시간 위젯을 설정합니다.'},
    {label: '!신청곡', content: '원하는 노래를 신청합니다.'},
    {label: '!노래목록', content: '플레이리스트 페이지로 이동합니다.'},
    {label: '!노래시작', content: '치수 플레이리스트 관리페이지로 이동합니다.'},
]

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))