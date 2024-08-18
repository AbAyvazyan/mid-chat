import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';

interface Message {
    type: 'add' | 'remove';
    message: string;
}

const fetchMessages = async (): Promise<string[]> => {
    const { data } = await axios.get<string[]>('http://localhost:8080/messages');
    return data;
};

function App() {
    const queryClient = useQueryClient();
    const { data: messages = [], isLoading } = useQuery<string[]>('messages', fetchMessages);
    const [newMessage, setNewMessage] = useState<string>('');
    console.log(123124)

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
            try {
                const data: Message = JSON.parse(event.data);
                if (data.type === 'add') {
                    queryClient.setQueryData<string[]>('messages', (old) => [...(old || []), data.message]);
                } else if (data.type === 'remove') {
                    queryClient.setQueryData<string[]>('messages', (old) => (old || []).filter(msg => msg !== data.message));
                }
            } catch (error) {
                console.error('Error parsing WebSocket message', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => ws.close();
    }, [queryClient]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newMessage.trim()) {
            await axios.post('http://localhost:8080/messages', { message: newMessage });
            setNewMessage('');
        }
    };

    console.log(messages)

    if (isLoading) return <div>Loading...</div>;

    return (
        <div style={styles.container}>
            <ul style={styles.messageList}>
                {messages.map((msg, index) => (
                    <li key={index} style={styles.messageItem}>{msg}</li>
                ))}
            </ul>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Send</button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
    },
    messageList: {
        listStyleType: 'none',
        padding: '0',
        margin: '0 0 20px',
    },
    messageItem: {
        backgroundColor: '#f1f1f1',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '10px',
        marginBottom: '5px',
    },
    form: {
        display: 'flex',
        alignItems: 'center',
    },
    input: {
        flex: '1',
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginRight: '10px',
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer',
    }
};

export default App;
