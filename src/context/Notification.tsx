import React, { createContext, useReducer, useState } from 'react';

type Notification = {
    id: number;
    type?: string;
    message?: string;
};

type NotificationContextType = {
    notifications: Notification[];
    addNotification: (message: string, type: string) => void;
};

export const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    addNotification: () => { },
});

const NotificationContainer = ({ children }: { children: React.ReactNode }) => {

    const reducer = (state: Notification[], action: { type: string, payload: Notification }) => {
        switch (action.type) {
            case 'ADD_NOTIFICATION':
                return [...state, action.payload];
            case 'REMOVE_NOTIFICATION':
                return state.filter((notification) => notification.id !== action.payload.id);
            default:
                return state;
        }
    };

    const [notifications, dispatch] = useReducer(reducer, []);

    const addNotification = (message: string, type: string) => {
        const notificationId = notifications.length;
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type, id: notificationId } });
        setTimeout(() => {
            dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id: notificationId } });
        }, 6000);
    };

    return (
        <NotificationContext.Provider value={{ notifications: notifications, addNotification: addNotification }}>
            <div className="fixed bottom-0 right-1 z-50">
                {notifications.map((alert) => (
                    <div key={alert.id} className="p-1">
                        <div className={`alert alert-${alert.type}`}>
                            <span>{alert.message}</span>
                        </div>
                    </div>
                ))}
            </div>
            {children}
        </NotificationContext.Provider>
    )
}

export default NotificationContainer;