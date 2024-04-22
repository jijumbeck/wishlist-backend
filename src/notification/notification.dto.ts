
export const enum NotificationType {
    Coauthoring = 'CoauthoringRequest',
    Friend = 'FriendRequest'
}

export interface Notification {
    type: NotificationType,
    requestSenderId?: string,
    requestReceiverId: string
}