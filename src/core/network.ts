import Peer from 'peerjs';

export let peer: Peer;
export let conn: any;
export let isHost = false;
export let isConnected = false;

// Queue for incoming data
export const remoteInputQueue: { frame: number, input: number }[] = [];

export function initNetwork(id?: string): Promise<string> {
    return new Promise((resolve) => {
        // @ts-ignore
        peer = new Peer(id); // If id is undefined, we get a random one (Host)
        
        peer.on('open', (myId) => {
            console.log('My ID:', myId);
            resolve(myId);
        });
        
        peer.on('connection', (c) => {
            if (conn) { c.close(); return; } // Only 1 player
            console.log('Peer connected:', c.peer);
            setupConnection(c);
            isHost = true;
        });
        
        peer.on('error', (err) => {
            console.error(err);
        });
    });
}

export function connectToPeer(remoteId: string) {
    const c = peer.connect(remoteId);
    setupConnection(c);
    isHost = false;
}

function setupConnection(c: any) {
    conn = c;
    conn.on('open', () => {
        console.log('Connection open!');
        isConnected = true;
    });
    
    conn.on('data', (data: any) => {
        // Data format: { f: frame, i: input }
        if (data.f !== undefined && data.i !== undefined) {
            remoteInputQueue.push({ frame: data.f, input: data.i });
        }
    });
    
    conn.on('close', () => {
        isConnected = false;
        console.log('Connection closed');
    });
}

export function sendInput(frame: number, input: number) {
    if (conn && isConnected) {
        conn.send({ f: frame, i: input });
    }
}
