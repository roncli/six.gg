declare namespace DiscordOAuthTypes {
    interface Connection {
        id: string
        type: string
        name: string
        revoked?: string
        visibility: 0 | 1
        verified: boolean;
        friend_sync: boolean;
        show_activity: boolean;
        integrations?: Integration[]
    }

    interface Integration {
        id: string
        user?: User
        name: string
        type: string
        account: {
            id: string
            name: string
        }
        enabled: boolean
        role_id: string
        syncing: boolean
        synced_at: number
        expire_behavior: number
        expire_grace_period: number
    }
    
    interface TokenRequestResult {
        access_token: string
        token_type: string
        expires_in: number
        refresh_token: string
        scope: string
    }

    interface User {
        id: string
        avatar: string | null | undefined
        username: string
        discriminator?: string
        bot?: boolean
        email?: string
        flags?: number
        locale?: string
        verified?: boolean
        mfa_enabled?: boolean
        premium_type?: number
    }
}

export = DiscordOAuthTypes
