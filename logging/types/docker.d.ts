declare namespace Docker {
    type Stats = {
        min: number
        max: number
        total: number
    }

    type MinutesStats = {
        [x: number]: {
            [x: string]: {
                name: string
                count: number
                memory: {
                    used: Stats
                    available: Stats
                    pct: Stats
                }
                cpu: Stats
                network: {
                    rxBytes: Stats
                    txBytes: Stats
                }
            }
        }
    }
}

export = Docker
