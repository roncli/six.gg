declare namespace IGDBTypes {
    type SearchGameResult = {
        id: number
        cover?: {
            id: number
            url: string
        }
        name: string
    }
}

export = IGDBTypes
