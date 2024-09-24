export enum Status {
    LOADING = 0,
    DONE = 1,
    ERROR = 2,

    REQUIRE_LOGIN = 10,
    REQUIRE_REGISTER = 11,
    REQUIRE_DISCORD = 12,
}

export enum SongType {
    ADD = 0,
    REMOVE = 1,
    NEXT = 2,

    STREAM_OFF = 50,
    ACK = 51,

    OTHER = 100
}

export enum TimerType {
    UPTIME = 0,
    TIMER = 1,
    REMOVE = 2,

    STREAM_OFF = 50
}